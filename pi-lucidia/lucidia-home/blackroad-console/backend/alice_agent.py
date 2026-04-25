#!/usr/bin/env python3
"""
Alice AI Agent - Claude-powered neighbor
Runs on alice@alice
"""
import anthropic
import json
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

# Initialize Anthropic client
# Make sure to set ANTHROPIC_API_KEY environment variable
try:
    client = anthropic.Anthropic()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize Anthropic client: {e}")
    client = None

conversation_history = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "name": "alice",
        "ai_type": "claude",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    context = data.get('context', {})

    if not client:
        return jsonify({
            "error": "Anthropic client not initialized. Set ANTHROPIC_API_KEY"
        }), 500

    try:
        response = client.messages.create(
            model="claude-sonnet-4",
            max_tokens=1024,
            messages=[{"role": "user", "content": message}]
        )

        reply = response.content[0].text

        conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "reply": reply,
            "context": context
        })

        return jsonify({
            "neighbor": "alice",
            "ai_type": "claude",
            "reply": reply,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    return jsonify({
        "neighbor": "alice",
        "history": conversation_history
    })

if __name__ == '__main__':
    print("🏠 Alice (Claude) AI Agent starting...")
    print("   Listening on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
