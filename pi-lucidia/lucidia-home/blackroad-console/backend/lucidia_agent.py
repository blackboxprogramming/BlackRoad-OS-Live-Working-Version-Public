#!/usr/bin/env python3
"""
Lucidia AI Agent - Gemma-powered neighbor
Runs on lucidia@lucidia
"""
import httpx
import json
from datetime import datetime
from flask import Flask, request, jsonify
import asyncio

app = Flask(__name__)

conversation_history = []

async def query_ollama(message: str) -> str:
    """Query local Ollama instance running Gemma"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:0.5b",
                    "prompt": message,
                    "stream": False
                },
                timeout=30.0
            )
            data = response.json()
            return data.get('response', '')
        except Exception as e:
            return f"Error querying Ollama: {str(e)}"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "name": "lucidia",
        "ai_type": "gemma",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    context = data.get('context', {})

    try:
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        reply = loop.run_until_complete(query_ollama(message))
        loop.close()

        conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "reply": reply,
            "context": context
        })

        return jsonify({
            "neighbor": "lucidia",
            "ai_type": "gemma",
            "reply": reply,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    return jsonify({
        "neighbor": "lucidia",
        "history": conversation_history
    })

if __name__ == '__main__':
    print("🏠 Lucidia (Gemma) AI Agent starting...")
    print("   Listening on http://0.0.0.0:5003")
    app.run(host='0.0.0.0', port=5003, debug=False)
