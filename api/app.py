from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import concurrent.futures
from dotenv import load_dotenv
import requests
from datetime import datetime, timedelta, timezone
import helpers.sql_helper as sql_helper

# Load environment variables from .env file
load_dotenv()
client_url = os.getenv('CLIENT_URL')

app = Flask(__name__)

# Set CORS configuration
CORS(app, resources={r"/*": {"origins": client_url}})

@app.route('/is-db-active', methods=['GET'])
def is_db_active():
    """Checks if the database is active (ONLINE) with a timeout of 4 seconds."""
    
    def check_database_status():
        with sql_helper.get_conn() as conn:
            status = sql_helper.get_database_status(conn)
            if status is None:
                return {"isActive": False}
            return {"isActive": status.get("status") == "ONLINE"}
    
    try:
        # Execute the task with a timeout using concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(check_database_status)
            return jsonify(future.result(timeout=2.5)), 200

    except concurrent.futures.TimeoutError:
        return jsonify({"isActive": False}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_tracked_routes', methods=['POST'])
def get_tracked_routes_endpoint():
    data = request.json
    user_id = data.get('userId')

    with sql_helper.get_conn() as conn:
        try:
            routes = sql_helper.get_tracked_routes(conn, user_id)
            if routes is None:
                return jsonify({"error": "Failed to fetch routes"}), 500

            return jsonify(routes), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
@app.route('/autocomplete_address', methods=['POST'])
def autocomplete_address_endpoint():
    data = request.json
    query = data.get('query', '')

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        api_key = os.getenv("AZURE_MAPS_API_KEY")
        if not api_key:
            return jsonify({"error": "Azure Maps API key is missing"}), 500

        url = f"https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&query={query}&countrySet=US&subscription-key={api_key}"
        try:
            response = requests.get(url)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch autocomplete results"}), response.status_code

        return jsonify(response.json()), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

def get_route_info(start_lat, start_lng, end_lat, end_lng):
    try:
        api_key = os.getenv("HERE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("HERE Maps API key is missing")

        # Construct the URL for route calculation
        url = (
            f"https://router.hereapi.com/v8/routes?"
            f"transportMode=car&"
            f"origin={start_lat},{start_lng}&"
            f"destination={end_lat},{end_lng}&"
            f"return=summary&"
            f"apiKey={api_key}"
        )

        response = requests.get(url)
        response.raise_for_status()  # This will raise an exception for non-2xx status codes

        # Check if the response is valid
        route_info = response.json()

        # Check if a route was found
        if not route_info.get('routes'):
            raise ValueError("No route found between the given points")

        # Extract the first route and its summary
        route = route_info['routes'][0]
        section = route['sections'][0]
        summary = section['summary']

        # Prepare the route information
        route_data = {
            'duration': summary['duration'],  # Duration in seconds
            'distanceMeters': summary['length'],  # Distance in meters
        }

        return route_data

    except Exception as e:
        print(e)
        raise e
    
@app.route('/get_route_info', methods=['POST'])
def get_route_info_endpoint():
    data = request.json
    
    # Extract latitude and longitude for start and end points
    start_lat = data.get('start_lat', None)
    start_lng = data.get('start_lng', None)
    end_lat = data.get('end_lat', None)
    end_lng = data.get('end_lng', None)

    # Validate if all required coordinates are provided
    if not start_lat or not start_lng or not end_lat or not end_lng:
        return jsonify({"error": "Latitude and longitude for both start and end are required"}), 400

    try:
        route_info = get_route_info(start_lat, start_lng, end_lat, end_lng)
        return jsonify(route_info), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_route', methods=['POST'])
def create_route_endpoint():
    data = request.json
    try:
        start_address = data.get('startLocationAddress')
        start_latitude = data.get('startLatitude')
        start_longitude = data.get('startLongitude')
        end_address = data.get('endLocationAddress')
        end_latitude = data.get('endLatitude')
        end_longitude = data.get('endLongitude')
        user_id = data.get('userId')
        name = data.get('name')

        if not all([start_address, start_latitude, start_longitude, end_address, end_latitude, end_longitude]):
            return jsonify({"error": "Missing required fields"}), 400

        with sql_helper.get_conn() as conn:
            result = sql_helper.create_tracked_route(
                conn,
                start_address,
                start_latitude,
                start_longitude,
                end_address,
                end_latitude,
                end_longitude,
                user_id,
                name
            )

            if not result['success']:
                return jsonify({"error": result['message']}), 400 if result['message'] == "You have already created the maximum 2 routes. Delete one to create a new one." else 500

            return jsonify({"message": result['message']}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/delete_route', methods=['POST'])
def delete_route_endpoint():
    data = request.json
    try:
        route_id = data.get('routeId')
        user_id = data.get('userId')

        if not route_id or not user_id:
            return jsonify({"error": "Missing required fields"}), 400

        with sql_helper.get_conn() as conn:
            result = sql_helper.delete_tracked_route(conn, route_id, user_id)

            if not result:
                return jsonify({"error": "Failed to delete route"}), 500

            return jsonify({"message": "Route deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_route_data', methods=['POST'])
def get_route_data_endpoint():
    data = request.json
    route_id = data.get('routeId')

    if not route_id:
        return jsonify({"error": "Missing route ID"}), 400

    try:
        with sql_helper.get_conn() as conn:
            route_data = sql_helper.get_route_data(conn, route_id)
            if route_data is None:
                return jsonify({"error": "Failed to fetch route data"}), 500

            return jsonify(route_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload_route_data', methods=['POST'])
def upload_route_data_endpoint():
    data = request.json
    try:
        route_data_list = data.get('routeDataList')
        if not route_data_list:
            return jsonify({"error": "Missing route data list"}), 400

        with sql_helper.get_conn() as conn:
            result = sql_helper.upload_route_data(conn, route_data_list)

            if not result:
                return jsonify({"error": "Failed to upload route data"}), 500

            return jsonify({"message": "Route data uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/run_route_calculations', methods=['POST'])
def run_route_calculations():
    try:
        # Get the list of tracked routes
        with sql_helper.get_conn() as conn:
            routes = sql_helper.get_tracked_routes(conn)
            if routes is None:
                return jsonify({"error": "Failed to fetch routes"}), 500
        
        # Get the current time rounded to the nearest full minute
        now = datetime.utcnow()
        start_time = now.replace(second=0, microsecond=0)

        # Prepare the results list
        results = []

        for route in routes:
            route_info = get_route_info(
                route["StartLatitude"],
                route["StartLongitude"],
                route["EndLatitude"],
                route["EndLongitude"]
            )
            result = {
                "id": route["Id"],
                "duration": route_info["duration"],
                "distance": route_info["distanceMeters"],
                "time": start_time.strftime("%Y-%m-%d %H:%M:%S")
            }
            results.append(result)

        # Upload the results list
        with sql_helper.get_conn() as conn:
            result = sql_helper.upload_route_data(conn, results)
            if not result:
                return jsonify({"error": "Failed to upload route data"}), 500

        return jsonify({"message": "Route calculations run successfully"}), 200

    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return jsonify({"error": f"API request failed: {e}"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": f"An error occurred: {e}"}), 500

# Define the ping endpoint
@app.route('/')
def ping():
    return "Ping successful!", 200

# Start the Flask server
if __name__ == '__main__':
    local_dev = True
    if local_dev:
        port = int(os.getenv('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        app.run()