#!/usr/bin/env python3
"""
AI Neighborhood Coordinator
Enables communication between alice, aria, and lucidia AI instances
"""
import asyncio
import json
from datetime import datetime
from typing import Dict, List
import anthropic
import openai
import httpx

class AINeighbor:
    def __init__(self, name: str, host: str, ai_type: str):
        self.name = name
        self.host = host
        self.ai_type = ai_type  # 'claude', 'openai', or 'gemma'
        self.messages = []

    async def send_message(self, message: str, context: Dict = None) -> str:
        """Send a message to this AI neighbor"""
        timestamp = datetime.now().isoformat()

        if self.ai_type == 'claude':
            # Use Anthropic SDK
            client = anthropic.Anthropic()
            response = client.messages.create(
                model="claude-sonnet-4",
                max_tokens=1024,
                messages=[{"role": "user", "content": message}]
            )
            reply = response.content[0].text

        elif self.ai_type == 'openai':
            # Use OpenAI SDK
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": message}]
            )
            reply = response.choices[0].message.content

        elif self.ai_type == 'gemma':
            # Use Ollama endpoint
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"http://{self.host}:11434/api/generate",
                    json={
                        "model": "gemma:2b",
                        "prompt": message,
                        "stream": False
                    },
                    timeout=30.0
                )
                data = response.json()
                reply = data.get('response', '')

        else:
            reply = f"Unknown AI type: {self.ai_type}"

        self.messages.append({
            "timestamp": timestamp,
            "sent": message,
            "received": reply
        })

        return reply

class AINeighborhood:
    def __init__(self):
        self.neighbors = {
            'alice': AINeighbor('alice', 'alice', 'claude'),
            'aria': AINeighbor('aria', 'aria', 'openai'),
            'lucidia': AINeighbor('lucidia', 'lucidia', 'gemma')
        }

    async def broadcast(self, message: str) -> Dict[str, str]:
        """Send a message to all AI neighbors"""
        tasks = []
        for name, neighbor in self.neighbors.items():
            tasks.append(neighbor.send_message(message))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            name: result if not isinstance(result, Exception) else str(result)
            for name, result in zip(self.neighbors.keys(), results)
        }

    async def round_robin_conversation(self, initial_message: str, rounds: int = 3):
        """Have AIs talk to each other in sequence"""
        current_message = initial_message
        conversation_history = []

        neighbor_names = list(self.neighbors.keys())

        for round_num in range(rounds):
            for i, name in enumerate(neighbor_names):
                neighbor = self.neighbors[name]

                context_message = f"{current_message}\n\n[Previous responses: {json.dumps(conversation_history[-3:] if conversation_history else [])}]"

                print(f"\n🤖 Round {round_num + 1}, {name} is thinking...")
                response = await neighbor.send_message(context_message)

                conversation_history.append({
                    "round": round_num + 1,
                    "neighbor": name,
                    "response": response
                })

                print(f"   {name} ({neighbor.ai_type}): {response[:100]}...")
                current_message = response

        return conversation_history

    def save_conversation_log(self, filename: str = "ai_neighborhood_log.json"):
        """Save all conversation history"""
        log_data = {
            neighbor_name: {
                "ai_type": neighbor.ai_type,
                "host": neighbor.host,
                "messages": neighbor.messages
            }
            for neighbor_name, neighbor in self.neighbors.items()
        }

        with open(filename, 'w') as f:
            json.dump(log_data, f, indent=2)

        print(f"\n💾 Conversation log saved to {filename}")

async def main():
    print("🏘️ Starting AI Neighborhood... ✨")
    neighborhood = AINeighborhood()

    # Test broadcast
    print("\n📡 Broadcasting to all neighbors...")
    results = await neighborhood.broadcast("Hello neighbor! What's your specialty?")

    for name, response in results.items():
        print(f"\n{name}: {response}")

    # Have a conversation
    print("\n💬 Starting round-robin conversation...")
    history = await neighborhood.round_robin_conversation(
        "Let's collaborate on building a distributed AI system. What should we focus on?",
        rounds=2
    )

    # Save the log
    neighborhood.save_conversation_log()

    print("\n✅ AI Neighborhood session complete!")

if __name__ == "__main__":
    asyncio.run(main())
