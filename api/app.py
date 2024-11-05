from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from sql_helper import get_todays_count, increment_today_count

# Load environment variables from .env file
load_dotenv()
azure_ai_url = os.getenv('AZURE_AI_URL')
azure_ai_key = os.getenv('AZURE_AI_KEY')
client_url = os.getenv('CLIENT_URL')
allowed_daily_chats = int(os.getenv('ALLOWED_DAILY_CHATS'))

azure_ai_completions_url = f"{azure_ai_url}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview"

app = Flask(__name__)

# Set CORS configuration
CORS(app, resources={r"/*": {"origins": client_url}})

# Example list of bots
bots = [
    {
        'id': 1,
        'title': 'Weather Bot',
        'summary': 'Provides weather updates and forecasts.'
    },
    {
        'id': 2,
        'title': 'Finance Bot',
        'summary': 'Gives stock prices and financial news.'
    },
    {
        'id': 3,
        'title': 'Chatbot',
        'summary': 'A simple conversational chatbot.'
    }
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

# Route for chatting with a bot (mock response)
@app.route('/chat', methods=['POST'])
def chat():
    todays_count = get_todays_count()
    if todays_count > allowed_daily_chats:
        return jsonify({'message': 'Sorry, usage of chatbots has reached its limit for the day'})
    data = request.get_json()
    bot_id = data.get('id')
    text = data.get('text')
    conversation = data.get('messages')

    error_response = jsonify({'message': 'There was an error getting a response from the bot. Please try again later.'})

    # Check if environment variables are loaded
    if not azure_ai_url or not azure_ai_key:
        raise ValueError("Missing Azure AI URL or key environment variables.")

    # Set up headers with API key
    headers = {
        'api-key': azure_ai_key,
        'Content-Type': 'application/json'
    }

    request_body_messages = []
    for message in conversation:
        request_body_messages.append({
            "role": "user" if message["sender"] == "user" else "assistant",
            "content": message["text"]
        })
    request_body = {
        "messages": request_body_messages,
        "temperature": 0.7,
        "max_tokens": 1000
    }

    response = requests.post(azure_ai_completions_url, json=request_body, headers=headers)

    increment_today_count()

    if response.status_code == 200:
        response = response.json()
        choices = response.get("choices", [])
        if choices and len(choices) > 0:
            message = choices[0].get("message", {}).get("content")
            
    else:
        print(f"Request failed with status code {response.status_code}")
    
    if message:
        return jsonify({'message': message})
    else:
        return error_response, 500

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