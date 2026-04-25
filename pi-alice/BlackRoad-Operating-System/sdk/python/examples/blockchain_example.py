#!/usr/bin/env python3
"""
BlackRoad SDK - Blockchain Operations Example
==============================================

This example demonstrates advanced blockchain operations including:
- Wallet management
- Transaction creation and monitoring
- Block mining and validation
- Blockchain statistics and analytics
"""

import asyncio
import os
import sys
import time
from typing import List

# Add parent directory to path to import blackroad
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from blackroad import (
    AsyncBlackRoadClient,
    BlackRoadClient,
    BlockchainError,
    Transaction,
    ValidationError,
)


def sync_example() -> None:
    """Synchronous blockchain operations example."""
    print("=== Synchronous Blockchain Operations ===\n")

    # Initialize client
    client = BlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000")
    )

    # Login
    try:
        token = client.auth.login(username="demo_user", password="SecurePassword123!")
        client.set_token(token.access_token)
        user = client.auth.me()
        print(f"Logged in as: {user.username}")
        print(f"Wallet: {user.wallet_address}\n")
    except Exception as e:
        print(f"Login failed: {e}")
        print("Make sure to run quickstart.py first to create a user")
        return

    # Example 1: Wallet Information
    print("1. Getting wallet information...")
    try:
        wallet = client.blockchain.get_wallet()
        print(f"Address: {wallet.address}")
        print(f"Balance: {wallet.balance} RoadCoin")
        print(f"Label: {wallet.label}")

        balance_info = client.blockchain.get_balance()
        print(f"\nBalance confirmation: {balance_info['balance']} RoadCoin")

    except Exception as e:
        print(f"Error: {e}")

    # Example 2: Blockchain Statistics
    print("\n2. Analyzing blockchain statistics...")
    try:
        stats = client.blockchain.get_stats()
        print(f"Latest block index: {stats.latest_block_index}")
        print(f"Latest block hash: {stats.latest_block_hash}")
        print(f"Total blocks: {stats.total_blocks}")
        print(f"Total transactions: {stats.total_transactions}")
        print(f"Pending transactions: {stats.pending_transactions}")
        print(f"Current difficulty: {stats.difficulty}")
        print(f"Mining reward: {stats.mining_reward} RoadCoin")

    except Exception as e:
        print(f"Error: {e}")

    # Example 3: Block Explorer
    print("\n3. Exploring recent blocks...")
    try:
        blocks = client.blockchain.get_blocks(limit=10)
        print(f"Retrieved {len(blocks)} blocks:\n")

        for block in blocks[:5]:  # Show first 5
            print(f"Block #{block.index}")
            print(f"  Hash: {block.hash}")
            print(f"  Previous: {block.previous_hash[:16]}...")
            print(f"  Timestamp: {block.timestamp}")
            print(f"  Nonce: {block.nonce}")
            print(f"  Difficulty: {block.difficulty}")
            print(f"  Transactions: {block.transaction_count}")
            print(f"  Miner: {block.miner_address or 'Genesis'}")
            print(f"  Reward: {block.reward} RoadCoin")
            print()

        # Get specific block
        if blocks:
            print(f"Getting details for block #{blocks[0].index}...")
            block_detail = client.blockchain.get_block(blocks[0].index)
            print(f"Block retrieved: {block_detail.hash}")

    except Exception as e:
        print(f"Error: {e}")

    # Example 4: Transaction History
    print("\n4. Reviewing transaction history...")
    try:
        transactions = client.blockchain.get_transactions(limit=10)
        print(f"Retrieved {len(transactions)} transactions:\n")

        if transactions:
            for tx in transactions[:5]:  # Show first 5
                print(f"Transaction: {tx.transaction_hash[:16]}...")
                print(f"  From: {tx.from_address[:16]}...")
                print(f"  To: {tx.to_address[:16]}...")
                print(f"  Amount: {tx.amount} RoadCoin")
                print(f"  Fee: {tx.fee} RoadCoin")
                print(f"  Status: {'Confirmed' if tx.is_confirmed else 'Pending'}")
                print(f"  Confirmations: {tx.confirmations}")
                print(f"  Created: {tx.created_at}")
                print()

            # Get specific transaction
            print(f"Getting details for transaction {transactions[0].transaction_hash[:16]}...")
            tx_detail = client.blockchain.get_transaction(transactions[0].transaction_hash)
            print(f"Transaction retrieved: {tx_detail.amount} RoadCoin")
        else:
            print("No transactions found")

    except Exception as e:
        print(f"Error: {e}")

    # Example 5: Creating a Transaction
    print("\n5. Creating a transaction...")
    print("Note: This requires another user account to send to")
    print("Skipping transaction creation for this example")

    # Example transaction code (would need a recipient):
    # try:
    #     tx = client.blockchain.create_transaction(
    #         to_address="recipient_wallet_address",
    #         amount=10.0,
    #         message="Payment for services"
    #     )
    #     print(f"Transaction created: {tx.transaction_hash}")
    #     print(f"Amount: {tx.amount} RoadCoin")
    #     print(f"Status: {'Confirmed' if tx.is_confirmed else 'Pending'}")
    # except ValidationError as e:
    #     print(f"Validation error: {e}")
    # except BlockchainError as e:
    #     print(f"Blockchain error: {e}")

    # Example 6: Mining a Block
    print("\n6. Mining a new block...")
    try:
        print("Starting mining process (this may take a moment)...")
        start_time = time.time()

        block = client.blockchain.mine_block()

        end_time = time.time()
        mining_time = end_time - start_time

        print(f"\nBlock mined successfully in {mining_time:.2f} seconds!")
        print(f"Block #{block.index}")
        print(f"Hash: {block.hash}")
        print(f"Previous hash: {block.previous_hash[:16]}...")
        print(f"Nonce: {block.nonce}")
        print(f"Difficulty: {block.difficulty}")
        print(f"Reward: {block.reward} RoadCoin")
        print(f"Transactions included: {block.transaction_count}")

        # Check updated balance
        wallet = client.blockchain.get_wallet()
        print(f"\nUpdated balance: {wallet.balance} RoadCoin")

    except BlockchainError as e:
        print(f"Mining failed: {e}")
    except Exception as e:
        print(f"Error: {e}")

    # Cleanup
    client.close()
    print("\n=== Synchronous Example Complete ===")


async def async_example() -> None:
    """Asynchronous blockchain operations example."""
    print("\n\n=== Asynchronous Blockchain Operations ===\n")

    # Initialize async client
    async with AsyncBlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000")
    ) as client:

        # Login
        try:
            token = await client.auth.login(username="demo_user", password="SecurePassword123!")
            client.set_token(token.access_token)
            user = await client.auth.me()
            print(f"Logged in as: {user.username}\n")
        except Exception as e:
            print(f"Login failed: {e}")
            return

        # Example: Concurrent Operations
        print("Performing concurrent blockchain operations...")

        try:
            # Execute multiple operations concurrently
            wallet_task = client.blockchain.get_wallet()
            stats_task = client.blockchain.get_stats()
            blocks_task = client.blockchain.get_blocks(limit=5)
            transactions_task = client.blockchain.get_transactions(limit=5)

            # Wait for all operations to complete
            wallet, stats, blocks, transactions = await asyncio.gather(
                wallet_task,
                stats_task,
                blocks_task,
                transactions_task,
            )

            print(f"\nWallet Balance: {wallet.balance} RoadCoin")
            print(f"Total Blocks: {stats.total_blocks}")
            print(f"Total Transactions: {stats.total_transactions}")
            print(f"Latest Block: #{blocks[0].index if blocks else 'N/A'}")
            print(f"Recent Transactions: {len(transactions)}")

            # Mine multiple blocks concurrently (careful with this!)
            print("\nMining blocks asynchronously...")
            print("Note: In production, coordinate mining to avoid conflicts")

            # For demo purposes, mine just one block
            block = await client.blockchain.mine_block()
            print(f"Block #{block.index} mined: {block.hash[:16]}...")

        except Exception as e:
            print(f"Error: {e}")

    print("\n=== Asynchronous Example Complete ===")


def main() -> None:
    """Run all examples."""
    print("BlackRoad SDK - Blockchain Operations Examples")
    print("=" * 50)

    # Run synchronous example
    sync_example()

    # Run asynchronous example
    asyncio.run(async_example())

    print("\n" + "=" * 50)
    print("Examples complete!")
    print("\nTips:")
    print("  - Use async operations for better performance")
    print("  - Always check balance before creating transactions")
    print("  - Mining rewards are added to your wallet balance")
    print("  - Transaction fees go to block miners")


if __name__ == "__main__":
    main()
