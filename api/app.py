from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import concurrent.futures
from dotenv import load_dotenv
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
    user_id = data.get('userId', {})

    with sql_helper.get_conn() as conn:
        try:
            routes = sql_helper.get_tracked_routes(conn, user_id)
            if routes is None:
                return jsonify({"error": "Failed to fetch routes"}), 500

            return jsonify(routes), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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