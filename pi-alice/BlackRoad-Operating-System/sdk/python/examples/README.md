# BlackRoad SDK Examples

This directory contains example scripts demonstrating how to use the BlackRoad Python SDK.

## Prerequisites

Before running these examples:

1. **Install the SDK**:
   ```bash
   cd ..
   pip install -e .
   ```

2. **Start the BlackRoad backend**:
   ```bash
   cd ../../../backend
   uvicorn app.main:app --reload
   ```

3. **Set environment variables** (optional):
   ```bash
   export BLACKROAD_BASE_URL="http://localhost:8000"
   ```

## Available Examples

### 1. quickstart.py

**Basic usage example covering all major features**

```bash
python quickstart.py
```

This example demonstrates:
- User registration and authentication
- Wallet management
- Blockchain statistics
- Transaction history
- Block mining
- Agent operations (if available)

**What you'll learn**:
- How to initialize the client
- How to authenticate users
- How to interact with the blockchain
- How to mine blocks
- Basic error handling

### 2. blockchain_example.py

**Advanced blockchain operations**

```bash
python blockchain_example.py
```

This example demonstrates:
- Detailed wallet information
- Blockchain analytics
- Block explorer functionality
- Transaction monitoring
- Concurrent blockchain operations (async)
- Mining blocks

**What you'll learn**:
- Working with blockchain data
- Pagination for blocks and transactions
- Synchronous vs asynchronous operations
- Performance optimization with async
- Blockchain statistics analysis

### 3. agents_example.py

**Agent management and execution**

```bash
python agents_example.py
```

This example demonstrates:
- Listing available agents
- Filtering agents by category
- Getting agent details
- Executing agents with parameters
- Monitoring execution status
- Concurrent agent execution (async)

**What you'll learn**:
- How to discover available agents
- How to execute agents with custom parameters
- How to monitor agent execution
- Error handling for agent operations
- Async patterns for multiple agents

## Example Usage Patterns

### Synchronous Pattern

```python
from blackroad import BlackRoadClient

# Initialize client
client = BlackRoadClient(base_url="http://localhost:8000")

try:
    # Login
    token = client.auth.login(username="user", password="pass")
    client.set_token(token.access_token)

    # Perform operations
    wallet = client.blockchain.get_wallet()
    print(f"Balance: {wallet.balance}")

finally:
    # Always close the client
    client.close()
```

### Asynchronous Pattern

```python
import asyncio
from blackroad import AsyncBlackRoadClient

async def main():
    async with AsyncBlackRoadClient(base_url="http://localhost:8000") as client:
        # Login
        token = await client.auth.login(username="user", password="pass")
        client.set_token(token.access_token)

        # Perform operations concurrently
        wallet, stats = await asyncio.gather(
            client.blockchain.get_wallet(),
            client.blockchain.get_stats()
        )

        print(f"Balance: {wallet.balance}")
        print(f"Total blocks: {stats.total_blocks}")

asyncio.run(main())
```

### Context Manager Pattern

```python
from blackroad import BlackRoadClient

# Automatic cleanup with context manager
with BlackRoadClient(base_url="http://localhost:8000") as client:
    token = client.auth.login(username="user", password="pass")
    client.set_token(token.access_token)

    wallet = client.blockchain.get_wallet()
    print(f"Balance: {wallet.balance}")
# Client is automatically closed
```

## Error Handling

All examples include error handling. Common patterns:

```python
from blackroad import (
    AuthenticationError,
    NotFoundError,
    ValidationError,
    BlockchainError,
)

try:
    # Perform operation
    result = client.some_operation()
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except NotFoundError as e:
    print(f"Resource not found: {e}")
except ValidationError as e:
    print(f"Invalid data: {e}")
except BlockchainError as e:
    print(f"Blockchain error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Creating Your Own Examples

When creating your own scripts, follow this structure:

```python
#!/usr/bin/env python3
"""
Your Script Name
================

Description of what the script does.
"""

import os
import sys

# Add parent directory to path if running from examples/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from blackroad import BlackRoadClient

def main():
    """Main function."""
    client = BlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000")
    )

    try:
        # Your code here
        pass
    finally:
        client.close()

if __name__ == "__main__":
    main()
```

## Tips

1. **Always use environment variables** for URLs and credentials
2. **Use context managers** to ensure proper cleanup
3. **Handle exceptions** appropriately for production code
4. **Use async** for better performance when making multiple requests
5. **Check the backend is running** before running examples
6. **Start with quickstart.py** to understand the basics

## Troubleshooting

### Backend Not Running

```
NetworkError: Connection refused
```

**Solution**: Start the backend server first:
```bash
cd ../../../backend
uvicorn app.main:app --reload
```

### User Already Exists

```
AuthenticationError: Username or email already registered
```

**Solution**: The examples try to create a user. If it already exists, they'll log in instead.

### Missing Dependencies

```
ModuleNotFoundError: No module named 'blackroad'
```

**Solution**: Install the SDK:
```bash
cd ..
pip install -e .
```

## Next Steps

After exploring these examples:

1. Read the [main README](../README.md) for detailed API documentation
2. Check out the [tests/](../tests/) directory for more usage patterns
3. Build your own application using the SDK
4. Contribute your own examples!

---

Happy coding! 🛣️
