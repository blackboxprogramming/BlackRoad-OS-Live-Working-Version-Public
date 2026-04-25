#!/usr/bin/env python3
"""
BlackRoad SDK Quickstart Example
=================================

This example demonstrates basic usage of the BlackRoad SDK,
including authentication, blockchain operations, and agent execution.
"""

import os
import sys

# Add parent directory to path to import blackroad
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from blackroad import (
    AuthenticationError,
    BlackRoadClient,
    NotFoundError,
    ValidationError,
)


def main() -> None:
    """Run the quickstart example."""
    # Initialize the client
    print("Initializing BlackRoad client...")
    client = BlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000"),
        timeout=30,
        max_retries=3,
    )

    # Example 1: User Registration and Authentication
    print("\n=== User Registration and Authentication ===")

    try:
        # Register a new user
        print("Registering new user...")
        user = client.auth.register(
            username="demo_user",
            email="demo@example.com",
            password="SecurePassword123!",
            full_name="Demo User",
        )
        print(f"User registered successfully: {user.username}")
        print(f"Wallet address: {user.wallet_address}")
        print(f"Starting balance: {user.balance} RoadCoin")

    except AuthenticationError as e:
        print(f"User already exists, logging in instead...")

    try:
        # Login
        print("\nLogging in...")
        token = client.auth.login(username="demo_user", password="SecurePassword123!")
        print(f"Login successful! Token type: {token.token_type}")

        # Set the authentication token
        client.set_token(token.access_token)

        # Get current user info
        current_user = client.auth.me()
        print(f"\nCurrent user: {current_user.username}")
        print(f"Email: {current_user.email}")
        print(f"Balance: {current_user.balance} RoadCoin")

    except AuthenticationError as e:
        print(f"Authentication error: {e}")
        return

    # Example 2: Blockchain Operations
    print("\n=== Blockchain Operations ===")

    try:
        # Get wallet information
        print("\nGetting wallet information...")
        wallet = client.blockchain.get_wallet()
        print(f"Wallet address: {wallet.address}")
        print(f"Balance: {wallet.balance} RoadCoin")

        # Get blockchain statistics
        print("\nGetting blockchain statistics...")
        stats = client.blockchain.get_stats()
        print(f"Latest block: #{stats.latest_block_index}")
        print(f"Total blocks: {stats.total_blocks}")
        print(f"Total transactions: {stats.total_transactions}")
        print(f"Pending transactions: {stats.pending_transactions}")
        print(f"Mining difficulty: {stats.difficulty}")
        print(f"Mining reward: {stats.mining_reward} RoadCoin")

        # Get recent blocks
        print("\nGetting recent blocks...")
        blocks = client.blockchain.get_blocks(limit=5)
        print(f"Retrieved {len(blocks)} blocks:")
        for block in blocks:
            print(f"  Block #{block.index}: {block.hash[:16]}... ({block.transaction_count} txs)")

        # Get transaction history
        print("\nGetting transaction history...")
        transactions = client.blockchain.get_transactions(limit=5)
        print(f"Retrieved {len(transactions)} transactions:")
        for tx in transactions:
            print(
                f"  {tx.transaction_hash[:16]}...: "
                f"{tx.amount} RoadCoin "
                f"({'confirmed' if tx.is_confirmed else 'pending'})"
            )

    except Exception as e:
        print(f"Blockchain error: {e}")

    # Example 3: Creating a Transaction (if we have a recipient)
    print("\n=== Creating a Transaction ===")

    # Note: This will fail if there's no other user to send to
    # You would need to create another user first
    print("Skipping transaction creation (requires another user)")

    # Example 4: Mining a Block
    print("\n=== Mining a Block ===")

    try:
        print("Mining a new block (this may take a moment)...")
        block = client.blockchain.mine_block()
        print(f"Block mined successfully!")
        print(f"Block #{block.index}")
        print(f"Hash: {block.hash}")
        print(f"Nonce: {block.nonce}")
        print(f"Reward: {block.reward} RoadCoin")
        print(f"Transactions: {block.transaction_count}")

        # Check updated balance
        wallet = client.blockchain.get_wallet()
        print(f"\nUpdated balance: {wallet.balance} RoadCoin")

    except Exception as e:
        print(f"Mining error: {e}")

    # Example 5: Agent Operations (if agent endpoints are available)
    print("\n=== Agent Operations ===")

    try:
        # List available agents
        print("Listing available agents...")
        agents = client.agents.list_agents(category="devops")
        if agents:
            print(f"Found {len(agents)} DevOps agents:")
            for agent in agents[:5]:  # Show first 5
                print(f"  - {agent.name} (v{agent.version}): {agent.description}")
        else:
            print("No agents found (agent endpoints may not be implemented yet)")

    except NotFoundError:
        print("Agent endpoints not available")
    except Exception as e:
        print(f"Agent error: {e}")

    # Cleanup
    print("\n=== Cleanup ===")
    client.close()
    print("Client closed successfully")

    print("\n=== Quickstart Complete ===")
    print("Check out the other examples for more advanced usage:")
    print("  - examples/agents_example.py - Agent management and execution")
    print("  - examples/blockchain_example.py - Advanced blockchain operations")


if __name__ == "__main__":
    main()
