from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import re
import helpers.sql_helper as sql_helper
from helpers.azure_ai_helper import get_azure_ai_response_from_conversation

# Load environment variables from .env file
load_dotenv()
client_url = os.getenv('CLIENT_URL')
allowed_daily_chats = int(os.getenv('ALLOWED_DAILY_CHATS'))

app = Flask(__name__)

# Set CORS configuration
CORS(app, resources={r"/*": {"origins": client_url}})

def generate_bot_id(bot_name):
    """Generate a botId based on bot name."""
    # Replace spaces with hyphens
    bot_id = bot_name.replace(" ", "-")
    # Remove any characters that are not alphanumeric or hyphens
    bot_id = re.sub(r'[^a-zA-Z0-9-]', '', bot_id)
    # Convert to lowercase
    bot_id = bot_id.lower()
    return bot_id

# Route for chatting with a bot
@app.route('/chat', methods=['POST'])
def chat():
    with sql_helper.get_conn() as sql_connection:
        todays_count = sql_helper.get_todays_count(sql_connection)
        if todays_count > allowed_daily_chats:
            return jsonify({'message': 'Sorry, usage of chatbots has reached its limit for the day'})
        sql_helper.increment_today_count(sql_connection)

    data = request.get_json()
    conversation = data.get('messages')
    
    message = get_azure_ai_response_from_conversation(conversation)

    if message:
        return jsonify({'message': message})
    else:
        return jsonify({'message': 'There was an error getting a response from the bot. Please try again later.'}), 500

@app.route('/get_bots', methods=['POST'])
def get_bots_endpoint():
    data = request.json
    filters = data.get('filter', {})  # Optional filter object

    with sql_helper.get_conn() as conn:
        try:
            # Call the helper function to get bots with the provided filters
            bots = sql_helper.get_bots(conn, filters)
            if bots is None:
                return jsonify({"error": "Failed to fetch bots"}), 500

            return jsonify(bots), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/create_bot', methods=['POST'])
def create_bot_endpoint():
    data = request.json
    bot_name = data.get('name')
    user_id = data.get('userId')
    description = data.get('description')
    links = data.get('links', [])  # List of link items with 'url' and 'description'

    # Generate the botId
    bot_id = generate_bot_id(bot_name)

    with sql_helper.get_conn() as conn:
        try:
            # First, create the bot with the generated botId
            result, message = sql_helper.create_bot(conn, bot_name, bot_id, user_id, description)
            if not result:
                return jsonify({"error": message}), 500  # Return the message if creation fails

            # Now, create each link associated with the bot
            for link in links:
                url = link['url']
                link_description = link['description']
                
                # Attempt to create each link
                link_result = sql_helper.create_bot_link(conn, bot_id, url, link_description)
                if not link_result:
                    return jsonify({"error": f"Failed to create link '{url}' for bot '{bot_name}'"}), 500

            # Return success response with the botId
            return jsonify({
                "message": f"Bot '{bot_name}' and all links created successfully",
                "botId": bot_id
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/update_bot', methods=['PUT'])
def update_bot_endpoint():
    data = request.json
    old_bot = data.get('oldBot')
    new_bot = data.get('newBot')

    with sql_helper.get_conn() as conn:
        try:
            # Generate a new bot ID if the name has changed
            old_bot_id = old_bot['botId']
            new_bot_id = old_bot_id
            if old_bot['botName'] != new_bot['botName']:
                new_bot_id = generate_bot_id(new_bot['botName'])

            # Call the update helper function
            result, message = sql_helper.update_bot(
                conn,
                old_bot_id=old_bot_id,
                new_bot_id=new_bot_id,
                new_name=new_bot['botName'],
                new_description=new_bot['description'],
                old_name=old_bot['botName'],
                old_description=old_bot['description'],
                old_links=old_bot['links'],
                new_links=new_bot['links'],
            )

            if result:
                return jsonify({"message": "Bot updated successfully", "botId": new_bot_id}), 200
            else:
                return jsonify({"error": message}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/delete_bot/<bot_id>', methods=['DELETE'])
def delete_bot_endpoint(bot_id):
    with sql_helper.get_conn() as conn:
        try:
            result = sql_helper.delete_bot(conn, bot_id)
            if result:
                return jsonify({"message": f"Bot '{bot_id}' deleted successfully"}), 200
            else:
                return jsonify({"error": f"Bot '{bot_id}' not found or could not be deleted"}), 404
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