# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-11-16

### Added
- Initial release of BlackRoad SDK
- TypeScript-first SDK with full type definitions
- Support for both Node.js and browser environments
- Authentication client with support for API keys and JWT tokens
- Agents client for managing AI agents
  - Create, read, update, and delete agents
  - Execute agent tasks (sync and async)
  - Monitor execution status and history
  - Agent lifecycle management (start, pause, stop)
- Blockchain client for blockchain operations
  - Get wallet balances and transactions
  - Send transactions
  - Deploy and interact with smart contracts
  - Get blocks and network statistics
  - Gas estimation
- Comprehensive error handling with custom error classes
- HTTP utilities with retry logic and error handling
- Utility functions for common operations
- Full JSDoc documentation
- Examples for quickstart, agents, and blockchain
- Unit tests for core functionality
- Support for ESM and CommonJS builds
- Production-ready configuration

[0.1.0]: https://github.com/blackroad/blackroad-os/releases/tag/sdk-v0.1.0
