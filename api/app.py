from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Set CORS configuration
CORS(app, resources={r"/*": {"origins": os.getenv('CLIENT_URL')}})

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
    data = request.get_json()
    bot_id = data.get('id')
    text = data.get('text')

    print(text)

    # Create a mock response from the bot based on the input text
    message = f'Bot response for bot ID: {bot_id}. You said: "{text}"'

    if message:
        return jsonify({'message': message})
    else:
        return jsonify({'message': 'There was an error getting a response from the bot. Please try again later.'}), 500

# Start the Flask server
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
