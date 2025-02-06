import os
import requests
from dotenv import load_dotenv

load_dotenv()
azure_ai_url = os.getenv('AZURE_AI_URL')
azure_ai_key = os.getenv('AZURE_AI_KEY')

azure_ai_completions_url = f"{azure_ai_url}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview"

def make_azure_ai_call(messages):
    if not azure_ai_url or not azure_ai_key:
        raise ValueError("Missing Azure AI URL or key environment variables.")
    
    headers = {
        'api-key': azure_ai_key,
        'Content-Type': 'application/json'
    }
    
    request_body = {
        "messages": messages,
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


def get_azure_ai_response_from_conversation(conversation, response_style=None, context=None, only_answer_with_context=False):
    system_message = "You are an AI assistant."

    if context:
        system_message += f" Here is some context for this conversation:------ {context} ------. Do not reference, acknowledge, or allude to the context in your responses."
        if only_answer_with_context:
            system_message += "You must only use the information provided in the context to answer questions. Do not reference or acknowledge that you are using context. If the question cannot be answered using the context, respond with 'I don't know.' Do not make assumptions, infer details, or provide information that is not explicitly included in the context. Avoid adding extra details or personal opinions. Your answers should be concise and directly address the user's questions. "

    if response_style and len(response_style) > 2:
        system_message += f" Please respond in the style of {response_style}."

    request_body_messages = [
        {"role": "system", "content": system_message}
    ] + [
        {
            "role": "user" if message["sender"] == "user" else "assistant",
            "content": message["text"]
        } for message in conversation
    ]

    return make_azure_ai_call(request_body_messages)


# Function to get AI response from a single text string
def get_azure_ai_response_from_text(text):
    messages = [
        {
            "role": "user",
            "content": text
        }
    ]
    return make_azure_ai_call(messages)