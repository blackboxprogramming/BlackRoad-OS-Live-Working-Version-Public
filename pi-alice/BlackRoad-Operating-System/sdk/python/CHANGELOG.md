# Changelog

All notable changes to the BlackRoad Python SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-16

### Added

#### Core Features
- Initial release of BlackRoad Python SDK
- Synchronous and asynchronous client implementations
- Full type hints throughout the codebase
- Comprehensive docstrings for all public APIs

#### Authentication
- User registration
- User login with JWT tokens
- Token management (set/clear)
- Current user information retrieval
- Logout functionality

#### Blockchain Operations
- Wallet management
- Balance checking
- Transaction creation and retrieval
- Transaction history with pagination
- Block retrieval and exploration
- Block mining
- Blockchain statistics and analytics

#### Agent Operations
- List available agents
- Filter agents by category
- Get agent details
- Execute agents with custom parameters
- Monitor execution status
- Cancel running executions

#### HTTP Client
- Automatic retry logic with exponential backoff
- Request/response interceptors
- Custom header management
- Configurable timeout and retry settings
- Comprehensive error handling

#### Error Handling
- Custom exception hierarchy
- Specific exceptions for different error types:
  - `AuthenticationError` - Authentication failures
  - `AuthorizationError` - Authorization failures
  - `NotFoundError` - Resource not found
  - `ValidationError` - Request validation errors
  - `RateLimitError` - Rate limit exceeded
  - `ServerError` - Server-side errors
  - `NetworkError` - Network connectivity issues
  - `TimeoutError` - Request timeouts
  - `BlockchainError` - Blockchain operation failures
  - `AgentError` - Agent execution failures
  - `ConfigurationError` - Configuration errors

#### Data Models
- User models (User, UserCreate, Token)
- Blockchain models (Wallet, Transaction, Block, BlockchainStats)
- Agent models (AgentInfo, AgentResult, AgentStatus, AgentMetadata)
- Full Pydantic validation for all models

#### Development Tools
- Comprehensive test suite with pytest
- Example scripts for common use cases:
  - `quickstart.py` - Basic usage example
  - `agents_example.py` - Agent operations
  - `blockchain_example.py` - Blockchain operations
- Setup configuration for pip installation
- pyproject.toml for modern Python packaging

#### Documentation
- Comprehensive README with usage examples
- Inline documentation for all public APIs
- Example code for sync and async usage
- Configuration guide
- Error handling guide

### Technical Details
- Python 3.8+ support
- Dependencies:
  - httpx >= 0.24.0
  - pydantic >= 2.0.0
  - python-dateutil >= 2.8.0
  - typing-extensions >= 4.0.0

[0.1.0]: https://github.com/blackboxprogramming/BlackRoad-Operating-System/releases/tag/v0.1.0
