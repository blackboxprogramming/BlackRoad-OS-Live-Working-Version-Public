#!/usr/bin/env python3
"""
Aria AI Agent - OpenAI-powered neighbor
Runs on aria@aria
"""
import openai
import json
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

# Initialize OpenAI client
# Make sure to set OPENAI_API_KEY environment variable
try:
    client = openai.OpenAI()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize OpenAI client: {e}")
    client = None

conversation_history = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "name": "aria",
        "ai_type": "openai",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    context = data.get('context', {})

    if not client:
        return jsonify({
            "error": "OpenAI client not initialized. Set OPENAI_API_KEY"
        }), 500

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": message}],
            max_tokens=1024
        )

        reply = response.choices[0].message.content

        conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "reply": reply,
            "context": context
        })

        return jsonify({
            "neighbor": "aria",
            "ai_type": "openai",
            "reply": reply,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    return jsonify({
        "neighbor": "aria",
        "history": conversation_history
    })

if __name__ == '__main__':
    print("🏠 Aria (OpenAI) AI Agent starting...")
    print("   Listening on http://0.0.0.0:5002")
    app.run(host='0.0.0.0', port=5002, debug=False)
