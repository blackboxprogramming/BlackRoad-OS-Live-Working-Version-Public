# BlackRoad Python SDK - Installation Guide

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment (recommended)

## Installation Methods

### Method 1: Install from Source (Development)

This is recommended for development or if you want to contribute to the SDK.

```bash
# Clone the repository
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System/sdk/python

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install the SDK in development mode
pip install -e .

# Or install with development dependencies
pip install -e ".[dev]"
```

### Method 2: Install from PyPI (When Published)

Once the package is published to PyPI, you can install it directly:

```bash
pip install blackroad
```

### Method 3: Install from requirements.txt

```bash
pip install -r requirements.txt
python setup.py install
```

## Verify Installation

After installation, verify that the SDK is installed correctly:

```python
python -c "import blackroad; print(blackroad.__version__)"
```

You should see the version number (e.g., `0.1.0`).

## Quick Start

1. **Set up environment variables** (optional):

```bash
export BLACKROAD_BASE_URL="http://localhost:8000"
export BLACKROAD_API_KEY="your-api-key"  # Optional
```

2. **Test the installation**:

```python
from blackroad import BlackRoadClient

# Initialize client
client = BlackRoadClient(base_url="http://localhost:8000")

# Test connection (will fail if server is not running)
try:
    stats = client.blockchain.get_stats()
    print(f"Connected! Total blocks: {stats.total_blocks}")
except Exception as e:
    print(f"Connection failed: {e}")
finally:
    client.close()
```

3. **Run example scripts**:

```bash
# Make sure the BlackRoad backend is running first
cd examples
python quickstart.py
```

## Running Tests

```bash
# Install test dependencies
pip install -e ".[test]"

# Run all tests
pytest

# Run with coverage
pytest --cov=blackroad --cov-report=html

# Run specific test file
pytest tests/test_client.py -v

# Run specific test
pytest tests/test_client.py::TestBlackRoadClient::test_client_initialization -v
```

## Development Setup

For development, install with all development dependencies:

```bash
# Install with dev dependencies
pip install -e ".[dev]"

# Install pre-commit hooks (if using)
pre-commit install

# Format code
black blackroad/

# Lint code
flake8 blackroad/
pylint blackroad/

# Type checking
mypy blackroad/

# Sort imports
isort blackroad/
```

## Upgrading

### From Source

```bash
cd BlackRoad-Operating-System/sdk/python
git pull origin main
pip install -e . --upgrade
```

### From PyPI

```bash
pip install --upgrade blackroad
```

## Uninstallation

```bash
pip uninstall blackroad
```

## Troubleshooting

### Import Error

If you get an import error:

```python
ModuleNotFoundError: No module named 'blackroad'
```

**Solution**: Make sure you're in the correct virtual environment and the package is installed:

```bash
pip list | grep blackroad
```

### Connection Error

If you get connection errors when using the client:

```python
NetworkError: Network error: ...
```

**Solution**: Make sure the BlackRoad backend is running:

```bash
# Start the backend
cd ../../backend
uvicorn app.main:app --reload
```

### Version Conflicts

If you get dependency version conflicts:

**Solution**: Create a fresh virtual environment:

```bash
deactivate  # If in a virtual environment
rm -rf venv  # Remove old environment
python -m venv venv
source venv/bin/activate
pip install -e .
```

### SSL Certificate Error

If you get SSL certificate errors:

**Solution**: Either fix your SSL certificates or disable SSL verification (not recommended for production):

```python
import httpx
from blackroad import BlackRoadClient

# Create a custom HTTP client with SSL disabled
client = BlackRoadClient(base_url="http://localhost:8000")
# Note: Use HTTPS in production!
```

## Getting Help

If you encounter any issues:

1. Check the [README.md](README.md) for usage examples
2. Review the [CHANGELOG.md](CHANGELOG.md) for recent changes
3. Look at the [examples/](examples/) directory for working code
4. Open an issue on [GitHub](https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues)

## Next Steps

After installation:

1. Read the [README.md](README.md) for usage examples
2. Try the example scripts in [examples/](examples/)
3. Check out the API documentation
4. Join the BlackRoad community

---

Happy coding with BlackRoad! 🛣️
