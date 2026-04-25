# Testing Guide - BlackRoad Operating System

> **Comprehensive testing documentation for developers and AI assistants**

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Orchestrator](#test-orchestrator)
4. [Test Suites](#test-suites)
5. [Local Development](#local-development)
6. [CI/CD Integration](#cicd-integration)
7. [Writing Tests](#writing-tests)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

BlackRoad Operating System uses a **unified test orchestrator** that coordinates all test suites across the monorepo. This ensures consistent testing behavior between local development and CI/CD environments.

### Testing Philosophy

- **Comprehensive**: All components are tested (backend, agents, SDKs, frontend)
- **Fast Feedback**: Tests run quickly with clear, actionable output
- **Isolated**: Each suite runs in isolation to prevent cross-contamination
- **Consistent**: Same test runner works locally and in CI
- **Extensible**: Easy to add new test suites as the codebase grows

### Test Coverage

| Component | Framework | Location | Status |
|-----------|-----------|----------|--------|
| Backend API | pytest | `backend/tests/` | ✅ Active |
| AI Agents | pytest | `agents/tests/` | ✅ Active |
| Operator Engine | pytest | `operator_engine/tests/` | ✅ Active |
| Python SDK | pytest | `sdk/python/tests/` | ✅ Active |
| TypeScript SDK | Jest | `sdk/typescript/tests/` | ✅ Active |
| Frontend | Validation | `backend/static/` | ⚠️ Structure only |

---

## Quick Start

### Run All Tests (Recommended)

```bash
# Best-effort mode - runs all suites, reports summary
./test_all.sh

# Strict mode - fails on first error
./test_all.sh --strict

# Verbose output
./test_all.sh --verbose
```

### Run Specific Suite

```bash
# Backend only
./test_all.sh --suite backend

# Agents only
./test_all.sh --suite agents

# Python SDK only
./test_all.sh --suite sdk-python

# TypeScript SDK only
./test_all.sh --suite sdk-typescript
```

### Run Individual Component Tests

```bash
# Backend (using helper script)
bash scripts/run_backend_tests.sh

# Agents (direct pytest)
pytest agents/tests/ -v

# Operator Engine
cd operator_engine && pytest tests/ -v

# Python SDK
cd sdk/python && pytest -v

# TypeScript SDK
cd sdk/typescript && npm test
```

---

## Test Orchestrator

The **Test Orchestrator** (`test_all.sh`) is the central test runner that coordinates all test suites in the monorepo.

### Features

✅ **Unified Interface**: Single command to run all tests
✅ **Smart Suite Detection**: Automatically detects and runs available test suites
✅ **Two Modes**: Best-effort (run all) and strict (fail-fast)
✅ **Clear Output**: Color-coded, structured output with summary table
✅ **Result Tracking**: Records pass/fail/skip status and duration for each suite
✅ **CI-Friendly**: Same script works locally and in GitHub Actions

### Architecture

```
test_all.sh
├── Configuration
│   ├── STRICT_MODE (--strict flag)
│   ├── SPECIFIC_SUITE (--suite flag)
│   └── VERBOSE (--verbose flag)
│
├── Test Suite Functions
│   ├── run_backend_tests()
│   ├── run_agents_tests()
│   ├── run_operator_tests()
│   ├── run_sdk_python_tests()
│   ├── run_sdk_typescript_tests()
│   └── run_frontend_tests()
│
├── Result Tracking
│   ├── record_result(suite, status, duration)
│   ├── SUITE_RESULTS (associative array)
│   └── SUITE_TIMES (associative array)
│
└── Reporting
    ├── print_summary()
    └── Exit code (0 = pass, 1 = fail)
```

### Usage Examples

```bash
# Run all suites with detailed output
./test_all.sh --verbose

# Run backend tests in strict mode
./test_all.sh --suite backend --strict

# Run agents tests only
./test_all.sh --suite agents

# Get help
./test_all.sh --help
```

### Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BlackRoad Operating System - Test Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Mode: BEST-EFFORT (run all suites)

▶ Backend (FastAPI + pytest)
  ℹ Using Python: Python 3.11.0
  ℹ Creating test virtual environment...
  ℹ Installing dependencies...
  ℹ Running pytest...
  ✓ Backend tests passed

▶ Agents (200+ AI agent ecosystem)
  ℹ Running agent tests...
  ✓ Agent tests passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Suite                     Result     Duration
─────────────────────────────────────────────────────────
backend                   ✓ PASS     12s
agents                    ✓ PASS     5s
operator                  ✓ PASS     3s
sdk-python                ✓ PASS     4s
sdk-typescript            ✓ PASS     8s
frontend                  ✓ PASS     1s
─────────────────────────────────────────────────────────

Total: 6 suites | 6 passed | 0 failed | 0 skipped

✅ ALL TESTS PASSED
```

---

## Test Suites

### 1. Backend (FastAPI)

**Framework**: pytest
**Location**: `backend/tests/`
**Coverage**: Authentication, blockchain, dashboard, mining, VSCode integration, API integrations

#### Running Backend Tests

```bash
# Via orchestrator
./test_all.sh --suite backend

# Via helper script (creates isolated venv)
bash scripts/run_backend_tests.sh

# Direct pytest (requires manual setup)
cd backend
source .venv-tests/bin/activate
pytest -v
```

#### Backend Test Configuration

**File**: `backend/pytest.ini`

```ini
[pytest]
asyncio_mode = auto
```

**Environment Variables** (set by test runner):
- `TEST_DATABASE_URL`: SQLite test database (default)
- `ENVIRONMENT`: `testing`
- `ALLOWED_ORIGINS`: `http://localhost:3000,http://localhost:8000`

#### Backend Test Files

```
backend/tests/
├── conftest.py              # Fixtures and test configuration
├── test_auth.py             # Authentication endpoints
├── test_blockchain.py       # Blockchain operations
├── test_dashboard.py        # Dashboard endpoints
├── test_miner.py            # Mining functionality
├── test_vscode_router.py    # VSCode integration
└── test_api_integrations.py # External API integrations
```

---

### 2. Agents (AI Agent Ecosystem)

**Framework**: pytest
**Location**: `agents/tests/`
**Coverage**: Base agent, execution lifecycle, error handling, registry

#### Running Agent Tests

```bash
# Via orchestrator
./test_all.sh --suite agents

# Direct pytest
pytest agents/tests/ -v
```

#### Agent Test Files

```
agents/tests/
└── test_agents.py           # Core agent functionality
```

---

### 3. Operator Engine (GitHub Automation)

**Framework**: pytest
**Location**: `operator_engine/tests/`
**Coverage**: GitHub client, webhooks, PR automation, job scheduling

#### Running Operator Tests

```bash
# Via orchestrator
./test_all.sh --suite operator

# Direct pytest
cd operator_engine
pytest tests/ -v
```

#### Operator Test Configuration

**File**: `operator_engine/pytest.ini`

```ini
[pytest]
# Operator-specific pytest configuration
```

---

### 4. Python SDK

**Framework**: pytest
**Location**: `sdk/python/`
**Coverage**: API client, blockchain operations, agent interactions

#### Running Python SDK Tests

```bash
# Via orchestrator
./test_all.sh --suite sdk-python

# Direct pytest
cd sdk/python
pip install -e .[dev]
pytest -v
```

#### Python SDK Configuration

**File**: `sdk/python/pyproject.toml`

```toml
[project]
name = "blackroad"
version = "0.1.0"

dependencies = [
    "httpx>=0.24.0",
    "pydantic>=2.0.0",
    "python-dateutil>=2.8.0",
    "typing-extensions>=4.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.1.0",
    "black>=23.0.0",
    "flake8>=6.0.0",
    "mypy>=1.0.0",
]
```

---

### 5. TypeScript SDK

**Framework**: Jest
**Location**: `sdk/typescript/`
**Coverage**: API client, TypeScript type definitions, dual CJS/ESM builds

#### Running TypeScript SDK Tests

```bash
# Via orchestrator
./test_all.sh --suite sdk-typescript

# Direct npm
cd sdk/typescript
npm install
npm test

# With coverage
npm run test:coverage
```

#### TypeScript SDK Configuration

**File**: `sdk/typescript/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### 6. Frontend (Vanilla JavaScript)

**Framework**: Validation (no unit tests currently)
**Location**: `backend/static/`
**Coverage**: Structure validation, JavaScript syntax checking

#### Running Frontend Validation

```bash
# Via orchestrator
./test_all.sh --suite frontend
```

#### Frontend Validation Checks

1. ✅ Essential files exist (`index.html`, `js/` directory)
2. ✅ JavaScript syntax validation (via Node.js `--check`)
3. ⚠️ **Note**: No unit tests for frontend JavaScript yet

#### Future Enhancement Opportunity

The frontend currently lacks unit tests. Consider adding:
- **Vitest** or **Jest** for vanilla JS testing
- **Playwright** or **Cypress** for E2E testing
- Component-level testing for UI modules

---

## Local Development

### Prerequisites

#### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.11+ | Backend, agents, Python SDK |
| **Node.js** | 16+ | TypeScript SDK, frontend validation |
| **npm** | 8+ | Package management |
| **Git** | 2.30+ | Version control |

#### Optional Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Docker** | 20+ | Service containers (Postgres, Redis) |
| **docker-compose** | 2.0+ | Multi-service orchestration |
| **PostgreSQL** | 15+ | Database (for integration tests) |
| **Redis** | 7+ | Caching (for integration tests) |

### Setup for Testing

#### 1. Clone Repository

```bash
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System
```

#### 2. Install Python Dependencies

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Agents (if needed)
pip install -r agents/requirements.txt

# Python SDK
cd sdk/python
pip install -e .[dev]
cd ../..
```

#### 3. Install Node.js Dependencies

```bash
# TypeScript SDK
cd sdk/typescript
npm install
cd ../..
```

#### 4. Run Tests

```bash
# All suites
./test_all.sh

# Specific suite
./test_all.sh --suite backend
```

### Environment Variables for Testing

The test orchestrator automatically sets these for each suite:

```bash
# Backend tests
TEST_DATABASE_URL=sqlite+aiosqlite:///./test.db
ENVIRONMENT=testing
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

For local testing with real services:

```bash
# Create backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/blackroad_test
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test-orchestrator.yml`

The CI workflow uses the same `test_all.sh` script as local development, ensuring consistency.

#### Workflow Features

✅ Runs on push to `main`, `claude/**`, `copilot/**`, `codex/**` branches
✅ Runs on pull requests to `main`
✅ Supports manual dispatch with suite selection
✅ Provides Postgres and Redis service containers
✅ Uploads test artifacts (coverage, reports)
✅ Generates test summary in GitHub UI
✅ Posts status comments on PRs

#### Workflow Jobs

1. **orchestrator**: Runs the main test orchestrator
2. **backend-coverage**: Generates coverage report for PRs
3. **status-check**: Final status check and PR comment

#### Triggering CI

```bash
# Push to main
git push origin main

# Push to AI assistant branch
git push origin claude/my-feature

# Create pull request
gh pr create --title "My Feature" --body "Description"
```

#### Manual Workflow Dispatch

You can manually trigger the workflow from GitHub UI:

1. Go to **Actions** → **Test Orchestrator - All Suites**
2. Click **Run workflow**
3. Select:
   - **Branch**: Which branch to test
   - **Suite**: Specific suite or all (leave empty)
   - **Strict mode**: Enable fail-fast behavior

#### Viewing Results

**GitHub Actions UI**:
- Summary table in job output
- Test artifacts (downloadable)
- Job summary with pass/fail status

**PR Comments**:
- Automatic status comment on PRs
- Coverage report (if codecov is configured)

---

## Writing Tests

### Backend Tests (pytest)

#### Example Test File

```python
# backend/tests/test_example.py

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_create_item(client: AsyncClient, db_session: AsyncSession):
    """Test creating a new item via API"""
    response = await client.post(
        "/api/items",
        json={"name": "Test Item", "description": "Test Description"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_items(client: AsyncClient):
    """Test retrieving items"""
    response = await client.get("/api/items")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
```

#### Using Fixtures

```python
@pytest.fixture
async def test_user(db_session: AsyncSession):
    """Create a test user"""
    from app.models import User

    user = User(email="test@example.com", username="testuser")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user

@pytest.mark.asyncio
async def test_with_user(client: AsyncClient, test_user):
    """Test using the test_user fixture"""
    response = await client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 200
```

### Agent Tests (pytest)

#### Example Agent Test

```python
# agents/tests/test_example_agent.py

import pytest
from agents.categories.myagent import MyAgent

@pytest.mark.asyncio
async def test_agent_execution():
    """Test agent executes successfully"""
    agent = MyAgent()

    result = await agent.execute()

    assert result["status"] == "success"
    assert "data" in result

@pytest.mark.asyncio
async def test_agent_error_handling():
    """Test agent handles errors gracefully"""
    agent = MyAgent()

    # Trigger error condition
    with pytest.raises(ValueError):
        await agent.execute(invalid_param=True)
```

### TypeScript SDK Tests (Jest)

#### Example Test File

```typescript
// sdk/typescript/tests/client.test.ts

import { BlackRoadClient } from '../src/client';

describe('BlackRoadClient', () => {
  let client: BlackRoadClient;

  beforeEach(() => {
    client = new BlackRoadClient({
      apiKey: 'test-key',
      baseURL: 'https://api.blackroad.dev'
    });
  });

  it('should initialize with correct config', () => {
    expect(client.baseURL).toBe('https://api.blackroad.dev');
  });

  it('should make authenticated requests', async () => {
    const response = await client.get('/users/me');
    expect(response.status).toBe(200);
  });
});
```

### Test Naming Conventions

#### Python Tests

```python
# File: test_<module>.py
# Function: test_<feature>_<scenario>

test_auth.py
  test_login_success()
  test_login_invalid_credentials()
  test_login_missing_fields()
```

#### TypeScript Tests

```typescript
// File: <module>.test.ts
// Describe: Component or module name
// It: Behavior description

client.test.ts
  describe('BlackRoadClient')
    it('should initialize with correct config')
    it('should handle API errors gracefully')
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Poetry Not Found

**Symptom**: `poetry not available; skipping` message

**Solution**:
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Or via pip
pip install poetry
```

#### 2. Node.js Not Installed

**Symptom**: `Node.js not installed` message

**Solution**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Download from https://nodejs.org/
```

#### 3. Python Not Found

**Symptom**: `Python not found` error

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv

# macOS
brew install python@3.11

# Windows
# Download from https://www.python.org/downloads/
```

#### 4. Virtual Environment Issues

**Symptom**: `No module named pytest` or similar import errors

**Solution**:
```bash
# Recreate virtual environment
cd backend
rm -rf .venv-tests
python -m venv .venv-tests
source .venv-tests/bin/activate
pip install -r requirements.txt
```

#### 5. Database Connection Errors

**Symptom**: `Connection refused` when connecting to Postgres

**Solution**:
```bash
# Test runner uses SQLite by default
# To use Postgres, start services:
cd backend
docker-compose up -d postgres

# Or set explicitly:
export TEST_DATABASE_URL="sqlite+aiosqlite:///./test.db"
```

#### 6. Redis Connection Errors

**Symptom**: `Error connecting to Redis`

**Solution**:
```bash
# Start Redis via Docker
cd backend
docker-compose up -d redis

# Or skip Redis-dependent tests
export SKIP_REDIS_TESTS=true
```

#### 7. Permission Denied on test_all.sh

**Symptom**: `Permission denied: ./test_all.sh`

**Solution**:
```bash
# Make script executable
chmod +x test_all.sh
```

#### 8. Tests Pass Locally but Fail in CI

**Symptom**: Tests pass on your machine but fail in GitHub Actions

**Possible Causes**:
1. Missing environment variables in CI
2. Different Python/Node versions
3. Timezone differences
4. Service containers not ready

**Solution**:
```bash
# Check CI logs for specific error
# Reproduce CI environment locally:
docker run -it ubuntu:latest
apt-get update && apt-get install -y python3 python3-pip nodejs npm
# Run test_all.sh
```

#### 9. Slow Test Execution

**Symptom**: Tests take a long time to run

**Solutions**:
```bash
# Run specific suite only
./test_all.sh --suite backend

# Run tests in parallel (pytest)
cd backend
pytest -n auto  # Requires pytest-xdist

# Skip slow tests
pytest -m "not slow"
```

#### 10. Import Errors in Tests

**Symptom**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
# Ensure you're in the correct directory
cd backend

# Install package in editable mode
pip install -e .

# Or add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:${PWD}"
```

### Debugging Tips

#### Enable Verbose Output

```bash
# See detailed test output
./test_all.sh --verbose

# See pytest output with print statements
pytest -v -s
```

#### Run Single Test

```bash
# Pytest
pytest backend/tests/test_auth.py::test_login_success -v

# Jest
npm test -- --testNamePattern="should initialize"
```

#### Debug with breakpoints

```python
# Python
import pdb; pdb.set_trace()  # Pause execution

# Or use pytest debugger
pytest --pdb  # Drop into debugger on failure
```

#### Check Test Coverage

```bash
# Backend
cd backend
pytest --cov=app --cov-report=html
# Open htmlcov/index.html

# TypeScript SDK
cd sdk/typescript
npm run test:coverage
# Open coverage/index.html
```

---

## Best Practices

### General Testing Principles

1. **Write tests first** (TDD approach when possible)
2. **One assertion per test** (or closely related assertions)
3. **Test behavior, not implementation**
4. **Use descriptive test names**
5. **Keep tests isolated and independent**
6. **Mock external dependencies**
7. **Clean up after tests** (use fixtures and teardown)

### Backend Testing

✅ **DO**:
- Use async fixtures for async tests
- Test both success and error paths
- Use `pytest.mark.asyncio` for async tests
- Mock external API calls
- Test authentication and authorization
- Validate request/response schemas

❌ **DON'T**:
- Test database implementation details
- Rely on test execution order
- Use real API keys in tests
- Skip error handling tests
- Test third-party library code

### Frontend Testing

✅ **DO** (when unit tests are added):
- Test user interactions
- Test component rendering
- Mock API calls
- Test error states
- Test accessibility

❌ **DON'T**:
- Test implementation details
- Test CSS styling
- Test third-party libraries

### Test Organization

```
tests/
├── unit/              # Fast, isolated unit tests
├── integration/       # Tests with dependencies
├── contract/          # API contract tests
├── fixtures/          # Shared test data
└── conftest.py        # Shared fixtures
```

### Continuous Improvement

- **Monitor test execution time**: Keep tests fast
- **Track coverage trends**: Aim for >80% coverage
- **Fix flaky tests immediately**: Don't ignore intermittent failures
- **Update tests with code changes**: Keep tests in sync
- **Review test failures**: Don't merge PRs with failing tests

---

## FAQ

### Q: How do I add a new test suite to the orchestrator?

**A**: Edit `test_all.sh`:

1. Create a new function: `run_mynewsuite_tests()`
2. Add result tracking: `record_result "mynewsuite" "PASS" "${duration}s"`
3. Call it from the main execution block
4. Add to the suite list in `print_summary()`

### Q: Can I run tests in parallel?

**A**: Yes, for individual suites:

```bash
# Backend (pytest-xdist)
cd backend
pip install pytest-xdist
pytest -n auto

# TypeScript SDK (Jest)
cd sdk/typescript
npm test -- --maxWorkers=4
```

The orchestrator runs suites sequentially by design for clearer output.

### Q: How do I skip a test temporarily?

**A**: Use test framework skip decorators:

```python
# Pytest
@pytest.mark.skip(reason="Temporarily disabled")
def test_something():
    pass

# Or skipif for conditional
@pytest.mark.skipif(sys.version_info < (3, 11), reason="Requires Python 3.11+")
def test_something():
    pass
```

```typescript
// Jest
describe.skip('MyComponent', () => {
  it('should do something', () => {
    // Skipped
  });
});
```

### Q: How do I test code that requires authentication?

**A**: Use test fixtures that create authenticated sessions:

```python
@pytest.fixture
async def auth_headers(test_user):
    """Create authentication headers for test user"""
    from app.utils.auth import create_access_token

    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_protected_endpoint(client: AsyncClient, auth_headers):
    response = await client.get("/api/protected", headers=auth_headers)
    assert response.status_code == 200
```

### Q: How do I run tests with coverage in CI?

**A**: The `backend-coverage` job in `.github/workflows/test-orchestrator.yml` automatically runs coverage on PRs and uploads to Codecov.

For local coverage:

```bash
# Backend
cd backend
pytest --cov=app --cov-report=html
open htmlcov/index.html

# TypeScript SDK
cd sdk/typescript
npm run test:coverage
open coverage/index.html
```

### Q: What's the difference between `--strict` and default mode?

**A**:
- **Default (best-effort)**: Runs all suites even if some fail, reports summary at end
- **Strict mode**: Stops on first failure, useful for CI fail-fast behavior

---

## Resources

### Official Documentation

- [BlackRoad CLAUDE.md](./CLAUDE.md) - AI assistant guide
- [Backend README](./backend/README.md) - Backend setup
- [Python SDK README](./sdk/python/README.md) - Python SDK documentation
- [TypeScript SDK README](./sdk/typescript/README.md) - TypeScript SDK documentation

### Testing Frameworks

- [pytest Documentation](https://docs.pytest.org/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Best Practices

- [Testing Best Practices (Python)](https://docs.python-guide.org/writing/tests/)
- [Testing Best Practices (JavaScript)](https://testingjavascript.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## Contributing

When adding tests to BlackRoad Operating System:

1. **Run all tests** before submitting PR: `./test_all.sh`
2. **Ensure tests pass** in CI before requesting review
3. **Add tests for new features** - no code without tests
4. **Update this documentation** if you change testing infrastructure
5. **Keep tests maintainable** - clear, simple, focused

---

**Questions or issues?** Open an issue on GitHub or check the [CLAUDE.md](./CLAUDE.md) guide.

**Happy Testing! 🧪✨**
