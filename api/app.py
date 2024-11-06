from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from helpers.sql_helper import get_todays_count, increment_today_count
from helpers.azure_ai_helper import get_azure_ai_response

# Load environment variables from .env file
load_dotenv()
client_url = os.getenv('CLIENT_URL')
allowed_daily_chats = int(os.getenv('ALLOWED_DAILY_CHATS'))

app = Flask(__name__)

# Set CORS configuration
CORS(app, resources={r"/*": {"origins": client_url}})

# Example list of bots
bots = [
    {'id': 1, 'title': 'Weather Bot', 'summary': 'Provides weather updates and forecasts.'},
    {'id': 2, 'title': 'Finance Bot', 'summary': 'Gives stock prices and financial news.'},
    {'id': 3, 'title': 'Chatbot', 'summary': 'A simple conversational chatbot.'}
]

# Route to list all bots
@app.route('/listBots', methods=['GET'])
def list_bots():
    return jsonify(bots)

# Route to get details of a specific bot by id
@app.route('/botDetails', methods=['GET'])
def bot_details():
    bot_id = request.args.get('id')
    bot = next((bot for bot in bots if str(bot['id']) == bot_id), None)
    if bot:
        return jsonify(bot)
    else:
        return jsonify({'message': 'Bot not found'}), 404

# Route for chatting with a bot
@app.route('/chat', methods=['POST'])
def chat():
    todays_count = get_todays_count()
    if todays_count > allowed_daily_chats:
        return jsonify({'message': 'Sorry, usage of chatbots has reached its limit for the day'})

    data = request.get_json()
    conversation = data.get('messages')
    
    message = get_azure_ai_response(conversation)
    increment_today_count()

    if message:
        return jsonify({'message': message})
    else:
        return jsonify({'message': 'There was an error getting a response from the bot. Please try again later.'}), 500

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