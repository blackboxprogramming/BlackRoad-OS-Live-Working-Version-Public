# BlackRoad Python SDK

Official Python SDK for the BlackRoad Operating System - A comprehensive interface for AI agents, blockchain, and system operations.

[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

- **Async and Sync Support**: Full support for both synchronous and asynchronous operations
- **Type Hints**: Complete type annotations for better IDE support and code safety
- **Authentication**: Support for JWT tokens and API key authentication
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Comprehensive Error Handling**: Custom exceptions for different error scenarios
- **Agent Management**: Create, execute, and manage AI agents
- **Blockchain Operations**: Interact with RoadChain blockchain, wallets, and transactions
- **User Management**: Registration, authentication, and profile management

## Installation

### From PyPI (when published)

```bash
pip install blackroad
```

### From Source

```bash
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System/sdk/python
pip install -e .
```

## Quick Start

### Basic Usage

```python
from blackroad import BlackRoadClient

# Initialize the client
client = BlackRoadClient(
    base_url="http://localhost:8000",
    api_key="your-api-key"  # Optional
)

# Register a new user
user = client.auth.register(
    username="john_doe",
    email="john@example.com",
    password="secure_password",
    full_name="John Doe"
)

# Login
token = client.auth.login(
    username="john_doe",
    password="secure_password"
)

# Set the authentication token
client.set_token(token.access_token)

# Get current user info
user = client.auth.me()
print(f"Logged in as: {user.username}")
```

### Async Usage

```python
import asyncio
from blackroad import AsyncBlackRoadClient

async def main():
    async with AsyncBlackRoadClient(base_url="http://localhost:8000") as client:
        # Login
        token = await client.auth.login(
            username="john_doe",
            password="secure_password"
        )

        client.set_token(token.access_token)

        # Get wallet balance
        wallet = await client.blockchain.get_wallet()
        print(f"Balance: {wallet.balance} RoadCoin")

        # Create a transaction
        tx = await client.blockchain.create_transaction(
            to_address="recipient_wallet_address",
            amount=10.0,
            message="Payment for services"
        )
        print(f"Transaction created: {tx.transaction_hash}")

asyncio.run(main())
```

### Blockchain Operations

```python
# Get wallet information
wallet = client.blockchain.get_wallet()
print(f"Address: {wallet.address}")
print(f"Balance: {wallet.balance}")

# Create a transaction
transaction = client.blockchain.create_transaction(
    to_address="recipient_address",
    amount=50.0,
    message="Payment"
)

# Get transaction history
transactions = client.blockchain.get_transactions(limit=10)
for tx in transactions:
    print(f"{tx.transaction_hash}: {tx.amount} RoadCoin")

# Get blockchain stats
stats = client.blockchain.get_stats()
print(f"Latest block: {stats['latest_block_index']}")
print(f"Total transactions: {stats['total_transactions']}")

# Mine a new block
block = client.blockchain.mine_block()
print(f"Mined block #{block.index} with hash {block.hash}")
```

### Agent Operations

```python
# List available agents
agents = client.agents.list_agents(category="devops")
for agent in agents:
    print(f"{agent.name}: {agent.description}")

# Get agent details
agent = client.agents.get_agent("deployment-agent")
print(f"Agent: {agent.name} v{agent.version}")
print(f"Category: {agent.category}")

# Execute an agent
result = client.agents.execute_agent(
    agent_name="deployment-agent",
    params={
        "environment": "production",
        "version": "1.2.3",
        "service": "api"
    }
)

print(f"Execution ID: {result.execution_id}")
print(f"Status: {result.status}")
print(f"Result: {result.data}")
```

## Configuration

### Environment Variables

```bash
export BLACKROAD_BASE_URL="http://localhost:8000"
export BLACKROAD_API_KEY="your-api-key"
export BLACKROAD_TIMEOUT=30
```

### Client Configuration

```python
from blackroad import BlackRoadClient

client = BlackRoadClient(
    base_url="http://localhost:8000",
    api_key="your-api-key",
    timeout=30,
    max_retries=3,
    retry_delay=1.0
)
```

## Error Handling

The SDK provides custom exceptions for different error scenarios:

```python
from blackroad import (
    BlackRoadClient,
    AuthenticationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    BlockchainError
)

try:
    client = BlackRoadClient(base_url="http://localhost:8000")
    user = client.auth.login(username="invalid", password="wrong")
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except NotFoundError as e:
    print(f"Resource not found: {e}")
except ValidationError as e:
    print(f"Validation error: {e}")
except RateLimitError as e:
    print(f"Rate limit exceeded: {e}")
except BlockchainError as e:
    print(f"Blockchain error: {e}")
```

## Advanced Usage

### Custom Headers

```python
client = BlackRoadClient(base_url="http://localhost:8000")
client.add_header("X-Custom-Header", "value")
```

### Request Interceptors

```python
def log_request(method, url, **kwargs):
    print(f"{method} {url}")
    return method, url, kwargs

client.add_request_interceptor(log_request)
```

### Response Interceptors

```python
def log_response(response):
    print(f"Status: {response.status_code}")
    return response

client.add_response_interceptor(log_response)
```

## API Reference

### Authentication (`client.auth`)

- `register(username, email, password, full_name)` - Register a new user
- `login(username, password)` - Login and get access token
- `me()` - Get current user information
- `logout()` - Logout current session

### Blockchain (`client.blockchain`)

- `get_wallet()` - Get wallet information
- `get_balance()` - Get wallet balance
- `create_transaction(to_address, amount, message=None)` - Create a transaction
- `get_transactions(limit=50, offset=0)` - Get transaction history
- `get_transaction(tx_hash)` - Get transaction by hash
- `get_blocks(limit=20, offset=0)` - Get blockchain blocks
- `get_block(block_id)` - Get block by ID
- `mine_block()` - Mine a new block
- `get_stats()` - Get blockchain statistics

### Agents (`client.agents`)

- `list_agents(category=None)` - List available agents
- `get_agent(agent_name)` - Get agent details
- `execute_agent(agent_name, params)` - Execute an agent
- `get_execution_status(execution_id)` - Get execution status
- `cancel_execution(execution_id)` - Cancel an execution

## Examples

See the [examples](examples/) directory for more comprehensive examples:

- [quickstart.py](examples/quickstart.py) - Basic usage examples
- [agents_example.py](examples/agents_example.py) - Agent management and execution
- [blockchain_example.py](examples/blockchain_example.py) - Blockchain operations

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System/sdk/python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development dependencies
pip install -e ".[dev]"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=blackroad --cov-report=html

# Run specific test file
pytest tests/test_client.py
```

### Code Quality

```bash
# Format code
black blackroad/

# Lint code
flake8 blackroad/
pylint blackroad/

# Type checking
mypy blackroad/
```

## Requirements

- Python 3.8+
- httpx >= 0.24.0
- pydantic >= 2.0.0
- python-dateutil >= 2.8.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

For issues, questions, or contributions:

- GitHub Issues: [Report a bug](https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues)
- Documentation: [Full API Documentation](https://blackroad.dev/docs)
- Community: [Join our Discord](https://discord.gg/blackroad)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

**Built with love by the BlackRoad community** 🛣️
