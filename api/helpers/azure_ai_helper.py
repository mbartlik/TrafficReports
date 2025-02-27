import os
import requests
from dotenv import load_dotenv

load_dotenv()
azure_ai_url = os.getenv('AZURE_AI_URL')
azure_ai_key = os.getenv('AZURE_AI_KEY')

azure_ai_completions_url = f"{azure_ai_url}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview"

import time
import requests

import time
import requests

def make_azure_ai_call(messages):
    """Makes a request to Azure AI with given messages."""
    if not azure_ai_url or not azure_ai_key:
        raise ValueError("Missing Azure AI URL or key environment variables.")
    
    retries = 5
    for attempt in range(retries):
        try:
            response = requests.post(
                azure_ai_completions_url,
                json={"messages": messages, "temperature": 0.7, "max_tokens": 1000},
                headers={'api-key': azure_ai_key, 'Content-Type': 'application/json'}
            )
            print(response)
            if response.status_code == 200:
                choices = response.json().get("choices", [])
                return choices[0].get("message", {}).get("content") if choices else None
            elif response.status_code == 429:
                # Rate limit exceeded, apply exponential backoff (1, 2, 4, 8, 16 seconds)
                wait_time = 2 ** attempt  # Exponential backoff (1, 2, 4, 8, 16)
                print(f"Rate limit exceeded, retrying in {wait_time} seconds (Attempt {attempt + 1}/{retries})...")
                time.sleep(wait_time)
            else:
                print(f"Azure AI request failed with status code {response.status_code}")
                break
        except Exception as error:
            print(f"Error during request: {error}")
            break
    
    return None


def get_azure_ai_response_from_conversation(conversation, response_style=None, context=None, only_answer_with_context=False):
    """Generates AI response from a conversation with optional context and response style."""
    system_message = "You are an AI assistant."
    
    if context:
        system_message += f" Here is some context for this conversation:------ {context} ------. "
        if only_answer_with_context:
            system_message += "You must only use the information provided in the context to answer questions. If the question cannot be answered using the context, respond with 'I don't know.'"
    
    if response_style and len(response_style) > 2:
        system_message += f" Please respond in the style of {response_style}."
    
    request_body_messages = [{"role": "system", "content": system_message}] + [
        {"role": "user" if msg["sender"] == "user" else "assistant", "content": msg["text"]}
        for msg in conversation
    ]
    
    return make_azure_ai_call(request_body_messages)

def get_azure_ai_response_from_text(text):
    """Gets AI response from a single text string."""
    return make_azure_ai_call([{"role": "user", "content": text}])