# Testing Guide

> Comprehensive testing strategies for BlackRoad OS

---

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Testing Agents](#testing-agents)
- [Testing Memory](#testing-memory)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

---

## Testing Philosophy

### Principles

1. **Test Behavior, Not Implementation** - Focus on what, not how
2. **Fast Feedback** - Tests should run quickly
3. **Deterministic** - Same input = same output
4. **Independent** - Tests don't depend on each other
5. **Readable** - Tests serve as documentation

### Test Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲         Few, slow, expensive
                 ╱──────╲
                ╱        ╲
               ╱Integration╲    Some, medium speed
              ╱────────────╲
             ╱              ╲
            ╱   Unit Tests   ╲  Many, fast, cheap
           ╱──────────────────╲
```

---

## Test Types

### Unit Tests

Test individual functions and classes in isolation.

```python
# tests/unit/test_agent.py
import pytest
from blackroad.agents import Agent

class TestAgent:
    def test_create_agent_with_valid_config(self):
        config = {"name": "TEST", "type": "worker"}
        agent = Agent(config)
        assert agent.name == "TEST"
        assert agent.status == "initialized"

    def test_create_agent_with_invalid_config(self):
        with pytest.raises(ValueError):
            Agent({"name": ""})

    def test_agent_can_process_task(self):
        agent = Agent({"name": "TEST", "type": "worker"})
        result = agent.process({"action": "echo", "data": "hello"})
        assert result["status"] == "success"
```

```typescript
// tests/unit/agent.test.ts
import { describe, it, expect } from 'vitest';
import { Agent } from '../src/agent';

describe('Agent', () => {
  it('should create agent with valid config', () => {
    const agent = new Agent({ name: 'TEST', type: 'worker' });
    expect(agent.name).toBe('TEST');
    expect(agent.status).toBe('initialized');
  });

  it('should throw error with invalid config', () => {
    expect(() => new Agent({ name: '' })).toThrow('Invalid config');
  });
});
```

### Integration Tests

Test multiple components working together.

```python
# tests/integration/test_agent_memory.py
import pytest
from blackroad.agents import Agent
from blackroad.memory import MemoryStore

class TestAgentMemoryIntegration:
    @pytest.fixture
    def agent_with_memory(self):
        memory = MemoryStore()
        agent = Agent({"name": "TEST"}, memory=memory)
        return agent, memory

    def test_agent_stores_memory_after_task(self, agent_with_memory):
        agent, memory = agent_with_memory
        agent.process({"action": "remember", "data": "test_value"})

        stored = memory.get("test_value")
        assert stored is not None

    def test_agent_retrieves_memory_for_task(self, agent_with_memory):
        agent, memory = agent_with_memory
        memory.set("context", "important_data")

        result = agent.process({"action": "recall", "key": "context"})
        assert result["data"] == "important_data"
```

### End-to-End Tests

Test complete user workflows.

```typescript
// tests/e2e/agent-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Workflow', () => {
  test('user can create and assign task to agent', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigate to agents
    await page.click('text=Agents');
    await expect(page).toHaveURL('/agents');

    // Create task
    await page.click('text=New Task');
    await page.fill('[name="title"]', 'Test Task');
    await page.selectOption('[name="agent"]', 'ALICE');
    await page.click('text=Create');

    // Verify task created
    await expect(page.locator('text=Test Task')).toBeVisible();
    await expect(page.locator('text=Assigned to ALICE')).toBeVisible();
  });
});
```

---

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test                    # JavaScript/TypeScript
pytest                      # Python
cargo test                  # Rust

# Run specific test file
npm test -- agent.test.ts
pytest tests/unit/test_agent.py
cargo test agent::tests

# Run tests matching pattern
npm test -- --grep "memory"
pytest -k "memory"
cargo test memory

# Run with coverage
npm test -- --coverage
pytest --cov=blackroad
cargo tarpaulin
```

### Watch Mode

```bash
# Re-run tests on file change
npm test -- --watch
pytest-watch
cargo watch -x test
```

### Verbose Output

```bash
npm test -- --verbose
pytest -v
cargo test -- --nocapture
```

---

## Writing Tests

### Test Structure (AAA Pattern)

```python
def test_something():
    # Arrange - Set up test data
    agent = Agent({"name": "TEST"})
    task = Task({"action": "process"})

    # Act - Execute the code under test
    result = agent.execute(task)

    # Assert - Verify the outcome
    assert result.status == "completed"
    assert result.duration < 1.0
```

### Fixtures

```python
# conftest.py
import pytest

@pytest.fixture
def agent():
    """Create a test agent."""
    return Agent({"name": "TEST", "type": "worker"})

@pytest.fixture
def memory_store():
    """Create an in-memory store."""
    store = MemoryStore(backend="memory")
    yield store
    store.clear()  # Cleanup after test

@pytest.fixture
def api_client():
    """Create authenticated API client."""
    client = TestClient(app)
    client.headers["Authorization"] = "Bearer test_token"
    return client
```

### Mocking

```python
from unittest.mock import Mock, patch

def test_agent_calls_external_api():
    with patch('blackroad.agents.external_api') as mock_api:
        mock_api.call.return_value = {"status": "ok"}

        agent = Agent({"name": "TEST"})
        result = agent.fetch_external_data()

        mock_api.call.assert_called_once()
        assert result["status"] == "ok"
```

```typescript
import { vi } from 'vitest';

test('agent calls external API', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ status: 'ok' });
  vi.stubGlobal('fetch', mockFetch);

  const agent = new Agent({ name: 'TEST' });
  const result = await agent.fetchExternalData();

  expect(mockFetch).toHaveBeenCalledOnce();
  expect(result.status).toBe('ok');
});
```

### Parameterized Tests

```python
import pytest

@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("test", "TEST"),
])
def test_uppercase(input, expected):
    assert input.upper() == expected

@pytest.mark.parametrize("agent_type,expected_capabilities", [
    ("reasoning", ["analyze", "synthesize"]),
    ("worker", ["execute", "report"]),
    ("security", ["scan", "protect"]),
])
def test_agent_capabilities(agent_type, expected_capabilities):
    agent = Agent({"name": "TEST", "type": agent_type})
    assert agent.capabilities == expected_capabilities
```

---

## Test Coverage

### Coverage Targets

| Component | Minimum | Target |
|-----------|---------|--------|
| Core Logic | 80% | 90% |
| API Endpoints | 70% | 85% |
| Agents | 75% | 90% |
| Memory | 80% | 95% |
| Utils | 90% | 95% |

### Generate Coverage Report

```bash
# Python
pytest --cov=blackroad --cov-report=html
open htmlcov/index.html

# JavaScript
npm test -- --coverage
open coverage/lcov-report/index.html

# Rust
cargo tarpaulin --out Html
open tarpaulin-report.html
```

### Coverage Configuration

```toml
# pyproject.toml
[tool.coverage.run]
source = ["blackroad"]
omit = ["tests/*", "*/migrations/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise NotImplementedError",
]
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"

      - name: Run tests
        run: |
          pytest --cov=blackroad --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ruff
      - run: ruff check .

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install mypy
      - run: mypy blackroad/
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: tests
        name: Run tests
        entry: pytest tests/unit -x
        language: system
        pass_filenames: false
        always_run: true
```

---

## Testing Agents

### Agent Test Utilities

```python
# tests/helpers/agent_helpers.py
from blackroad.agents import Agent

class AgentTestHelper:
    @staticmethod
    def create_test_agent(name="TEST", type="worker"):
        return Agent({
            "name": name,
            "type": type,
            "config": {"test_mode": True}
        })

    @staticmethod
    def simulate_task_completion(agent, task):
        agent.assign(task)
        agent.start()
        while agent.status != "completed":
            agent.tick()
        return agent.get_result()
```

### Testing Agent Communication

```python
def test_agents_can_communicate():
    alice = Agent({"name": "ALICE"})
    bob = Agent({"name": "BOB"})

    # Alice sends message to Bob
    alice.send_message(bob.id, {"type": "greeting", "text": "Hello"})

    # Bob receives message
    messages = bob.get_messages()
    assert len(messages) == 1
    assert messages[0]["text"] == "Hello"
```

### Testing Agent State Transitions

```python
@pytest.mark.parametrize("initial,action,expected", [
    ("idle", "assign_task", "busy"),
    ("busy", "complete_task", "idle"),
    ("busy", "pause", "paused"),
    ("paused", "resume", "busy"),
    ("idle", "shutdown", "offline"),
])
def test_agent_state_transitions(initial, action, expected):
    agent = Agent({"name": "TEST"})
    agent.status = initial

    getattr(agent, action)()

    assert agent.status == expected
```

---

## Testing Memory

### Memory Test Fixtures

```python
@pytest.fixture
def memory_with_data():
    memory = MemoryStore()
    memory.store("key1", "value1", type="short_term")
    memory.store("key2", "value2", type="long_term")
    memory.store("key3", {"nested": "data"}, type="semantic")
    return memory
```

### Testing Memory Search

```python
def test_semantic_search(memory_with_data):
    # Store some memories with embeddings
    memory_with_data.store(
        "deployment_docs",
        "How to deploy to production",
        type="semantic"
    )

    # Search
    results = memory_with_data.search(
        "production deployment guide",
        limit=5
    )

    assert len(results) > 0
    assert results[0]["key"] == "deployment_docs"
    assert results[0]["score"] > 0.7
```

### Testing Memory Consolidation

```python
def test_memory_consolidation():
    memory = MemoryStore()

    # Create many short-term memories
    for i in range(100):
        memory.store(f"temp_{i}", f"value_{i}", type="short_term")

    # Consolidate
    memory.consolidate(older_than_hours=0)

    # Verify consolidation
    short_term = memory.list(type="short_term")
    long_term = memory.list(type="long_term")

    assert len(short_term) == 0
    assert len(long_term) > 0
```

---

## Performance Testing

### Load Testing with Locust

```python
# locustfile.py
from locust import HttpUser, task, between

class AgentUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def list_agents(self):
        self.client.get("/v1/agents")

    @task(1)
    def create_task(self):
        self.client.post("/v1/tasks", json={
            "title": "Load test task",
            "agent_id": "agent_alice_001"
        })

    @task(2)
    def search_memory(self):
        self.client.post("/v1/memory/search", json={
            "query": "test query",
            "limit": 10
        })
```

### Run Load Tests

```bash
# Start Locust
locust -f locustfile.py --host=http://localhost:8000

# Run headless
locust -f locustfile.py --host=http://localhost:8000 \
  --users 100 --spawn-rate 10 --run-time 60s --headless
```

### Benchmark Tests

```python
import pytest

@pytest.mark.benchmark
def test_agent_creation_performance(benchmark):
    def create_agent():
        return Agent({"name": "TEST", "type": "worker"})

    result = benchmark(create_agent)
    assert result is not None

@pytest.mark.benchmark
def test_memory_search_performance(benchmark, memory_with_data):
    def search():
        return memory_with_data.search("test query", limit=10)

    results = benchmark(search)
    assert len(results) <= 10
```

---

## Security Testing

### SAST (Static Analysis)

```bash
# Python - Bandit
bandit -r blackroad/

# JavaScript - ESLint security
npm run lint:security

# Secrets detection
gitleaks detect --source .
```

### Dependency Scanning

```bash
# Python
pip-audit

# JavaScript
npm audit

# All dependencies
snyk test
```

### API Security Tests

```python
def test_authentication_required():
    client = TestClient(app)
    response = client.get("/v1/agents")
    assert response.status_code == 401

def test_invalid_token_rejected():
    client = TestClient(app)
    response = client.get(
        "/v1/agents",
        headers={"Authorization": "Bearer invalid"}
    )
    assert response.status_code == 401

def test_rate_limiting():
    client = TestClient(app)
    # Make many requests
    for _ in range(100):
        client.get("/v1/agents", headers=auth_headers)

    # Next request should be rate limited
    response = client.get("/v1/agents", headers=auth_headers)
    assert response.status_code == 429
```

---

## Test Data Management

### Factories

```python
# tests/factories.py
import factory
from blackroad.models import Agent, Task

class AgentFactory(factory.Factory):
    class Meta:
        model = Agent

    name = factory.Sequence(lambda n: f"AGENT_{n}")
    type = "worker"
    status = "idle"

class TaskFactory(factory.Factory):
    class Meta:
        model = Task

    title = factory.Faker('sentence')
    agent = factory.SubFactory(AgentFactory)
    priority = "normal"
```

### Database Fixtures

```python
@pytest.fixture(scope="function")
def db():
    """Create test database."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
```

---

*Last updated: 2026-02-05*
