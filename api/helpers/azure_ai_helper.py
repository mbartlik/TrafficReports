import os
import requests
from dotenv import load_dotenv

load_dotenv()
azure_ai_url = os.getenv('AZURE_AI_URL')
azure_ai_key = os.getenv('AZURE_AI_KEY')

azure_ai_completions_url = f"{azure_ai_url}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview"

def get_azure_ai_response(conversation):
    if not azure_ai_url or not azure_ai_key:
        raise ValueError("Missing Azure AI URL or key environment variables.")

    headers = {
        'api-key': azure_ai_key,
        'Content-Type': 'application/json'
    }

    request_body_messages = [
        {
            "role": "user" if message["sender"] == "user" else "assistant",
            "content": message["text"]
        } for message in conversation
    ]
    
    request_body = {
        "messages": request_body_messages,
        "temperature": 0.7,
        "max_tokens": 1000
    }

    response = requests.post(azure_ai_completions_url, json=request_body, headers=headers)
    
    if response.status_code == 200:
        response_json = response.json()
        choices = response_json.get("choices", [])
        if choices and len(choices) > 0:
            return choices[0].get("message", {}).get("content")
    
    print(f"Azure AI request failed with status code {response.status_code}")
    return None