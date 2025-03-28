from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import concurrent.futures
from dotenv import load_dotenv
import requests
from datetime import datetime
import helpers.sql_helper as sql_helper

# Load environment variables
load_dotenv()
client_url = os.getenv('CLIENT_URL')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": client_url}})

@app.route('/is-db-active', methods=['GET'])
def is_db_active():
    """Check if the database is active."""
    def check_database_status():
        with sql_helper.get_conn() as conn:
            status = sql_helper.get_database_status(conn)
            return {"isActive": status.get("status") == "ONLINE"} if status else {"isActive": False}

    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(check_database_status)
            return jsonify(future.result(timeout=2.5)), 200
    except concurrent.futures.TimeoutError:
        return jsonify({"isActive": False}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_tracked_routes', methods=['POST'])
def get_tracked_routes_endpoint():
    user_id = request.json.get('userId')
    with sql_helper.get_conn() as conn:
        routes = sql_helper.get_tracked_routes(conn, user_id)
        return jsonify(routes if routes is not None else {"error": "Failed to fetch routes"}), 200 if routes else 500

@app.route('/autocomplete_address', methods=['POST'])
def autocomplete_address_endpoint():
    query = request.json.get('query', '')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    api_key = os.getenv("AZURE_MAPS_API_KEY")
    if not api_key:
        return jsonify({"error": "Azure Maps API key is missing"}), 500

    url = f"https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&query={query}&countrySet=US&subscription-key={api_key}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {e}"}), 500

def get_route_info(start_lat, start_lng, end_lat, end_lng):
    """Fetch route info from HERE Maps API."""
    api_key = os.getenv("HERE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("HERE Maps API key is missing")

    url = (
        f"https://router.hereapi.com/v8/routes?"
        f"transportMode=car&origin={start_lat},{start_lng}&destination={end_lat},{end_lng}&return=summary&apiKey={api_key}"
    )
    response = requests.get(url)
    response.raise_for_status()
    route = response.json().get('routes', [{}])[0].get('sections', [{}])[0].get('summary', {})
    if not route:
        raise ValueError("No route found")
    return {'duration': route['duration'], 'distanceMeters': route['length']}

@app.route('/get_route_info', methods=['POST'])
def get_route_info_endpoint():
    data = request.json
    coords = [data.get(key) for key in ['start_lat', 'start_lng', 'end_lat', 'end_lng']]
    if not all(coords):
        return jsonify({"error": "Latitude and longitude for both start and end are required"}), 400

    try:
        return jsonify(get_route_info(*coords)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_route', methods=['POST'])
def create_route_endpoint():
    data = request.json
    required_fields = ['startLocationAddress', 'startLatitude', 'startLongitude', 'endLocationAddress', 'endLatitude', 'endLongitude']
    if not all(data.get(field) for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    with sql_helper.get_conn() as conn:
        result = sql_helper.create_tracked_route(
            conn, data['startLocationAddress'], data['startLatitude'], data['startLongitude'],
            data['endLocationAddress'], data['endLatitude'], data['endLongitude'], data.get('userId'), data.get('name')
        )
        return jsonify({"message": result['message']}), 201 if result['success'] else 400

@app.route('/delete_route', methods=['POST'])
def delete_route_endpoint():
    data = request.json
    route_id, user_id = data.get('routeId'), data.get('userId')
    if not route_id or not user_id:
        return jsonify({"error": "Missing required fields"}), 400

    with sql_helper.get_conn() as conn:
        result = sql_helper.delete_tracked_route(conn, route_id, user_id)
        return jsonify({"message": "Route deleted successfully"}), 200 if result else 500

@app.route('/get_route_data', methods=['POST'])
def get_route_data_endpoint():
    route_id = request.json.get('routeId')
    if not route_id:
        return jsonify({"error": "Missing route ID"}), 400

    with sql_helper.get_conn() as conn:
        route_data = sql_helper.get_route_data(conn, route_id)
        if route_data is None:
            return jsonify({"error": "Failed to fetch route data"}), 500
        return jsonify(route_data), 200

@app.route('/upload_route_data', methods=['POST'])
def upload_route_data_endpoint():
    route_data_list = request.json.get('routeDataList')
    if not route_data_list:
        return jsonify({"error": "Missing route data list"}), 400

    with sql_helper.get_conn() as conn:
        result = sql_helper.upload_route_data(conn, route_data_list)
        return jsonify({"message": "Route data uploaded successfully"}), 201 if result else 500

@app.route('/run_route_calculations', methods=['POST'])
def run_route_calculations():
    try:
        with sql_helper.get_conn() as conn:
            routes = sql_helper.get_tracked_routes(conn)
            if routes is None:
                return jsonify({"error": "Failed to fetch routes"}), 500

        now = datetime.utcnow().replace(second=0, microsecond=0)
        results = [
            {
                "id": route["Id"],
                "duration": route_info["duration"],
                "distance": route_info["distanceMeters"],
                "time": now.strftime("%Y-%m-%d %H:%M:%S")
            }
            for route in routes
            for route_info in [get_route_info(route["StartLatitude"], route["StartLongitude"], route["EndLatitude"], route["EndLongitude"])]
        ]

        with sql_helper.get_conn() as conn:
            if not sql_helper.upload_route_data(conn, results):
                return jsonify({"error": "Failed to upload route data"}), 500

        return jsonify({"message": "Route calculations run successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

@app.route('/')
def ping():
    return "Ping successful!", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
    # app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))