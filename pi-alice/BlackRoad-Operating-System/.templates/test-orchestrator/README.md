# Test Orchestrator Templates

> **Reusable test orchestrator pattern for any monorepo**

These templates provide a complete testing infrastructure that you can copy to any repository. The pattern has been battle-tested in BlackRoad Operating System and is designed to be easily adaptable.

---

## What's Included

1. **`test_all.sh.template`** - Universal test orchestrator script
2. **`test-orchestrator.yml.template`** - GitHub Actions workflow
3. **`TESTING.md.template`** - Comprehensive testing documentation

---

## Quick Start: Copy to New Repo

### 1. Copy Templates

```bash
# In your target repository
mkdir -p .github/workflows

# Copy orchestrator script
cp /path/to/BlackRoad/.templates/test-orchestrator/test_all.sh.template ./test_all.sh
chmod +x test_all.sh

# Copy GitHub Actions workflow
cp /path/to/BlackRoad/.templates/test-orchestrator/test-orchestrator.yml.template .github/workflows/test-orchestrator.yml

# Copy documentation
cp /path/to/BlackRoad/.templates/test-orchestrator/TESTING.md.template ./TESTING.md
```

### 2. Customize for Your Repo

Edit `test_all.sh` and replace placeholders:

- `{{REPO_NAME}}` → Your repository name
- `{{PROJECT_DESCRIPTION}}` → Brief project description
- Suite functions → Adapt to your project structure

Edit `.github/workflows/test-orchestrator.yml`:

- Update service containers if needed
- Adjust cache paths
- Modify environment variables

Edit `TESTING.md`:

- Update project-specific details
- Add your test suites
- Customize examples

### 3. Run Tests

```bash
./test_all.sh
```

---

## Adapting to Different Project Structures

### Example 1: Pure Python Project

```bash
# test_all.sh - Keep only Python suites
run_backend_tests() {
  # Your main Python package
}

run_cli_tests() {
  # CLI tool tests
}

run_integration_tests() {
  # Integration tests
}
```

### Example 2: Pure Node.js Project

```bash
# test_all.sh - Keep only Node suites
run_api_tests() {
  # Express/Fastify API
}

run_frontend_tests() {
  # React/Vue/Svelte
}

run_sdk_tests() {
  # Client SDK
}
```

### Example 3: Microservices

```bash
# test_all.sh - One suite per service
run_auth_service_tests() {
  cd services/auth && npm test
}

run_api_gateway_tests() {
  cd services/api-gateway && go test ./...
}

run_data_service_tests() {
  cd services/data && pytest
}
```

---

## Pattern Philosophy

### Core Principles

1. **One script to rule them all**: `test_all.sh` is the single source of truth
2. **CI = Local**: Same script runs everywhere
3. **Best-effort by default**: Run all suites, report at end
4. **Strict mode available**: Fail-fast when needed
5. **Clear output**: Color-coded, structured, summary table

### Benefits

✅ **Consistency**: Same test experience across all repos
✅ **Discoverability**: New contributors know exactly how to run tests
✅ **Maintainability**: One pattern to learn and maintain
✅ **Extensibility**: Easy to add new test suites
✅ **CI-friendly**: Works perfectly with GitHub Actions

---

## Customization Guide

### Adding a New Test Suite

1. **Create suite function** in `test_all.sh`:

```bash
run_myapp_tests() {
  log_suite "MyApp (description)"

  local start_time=$(date +%s)

  # Check if suite exists
  if [[ ! -d "$ROOT/myapp" ]]; then
    log_skip "myapp/ directory not found"
    record_result "myapp" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT/myapp"

  # Run your tests
  log_info "Running tests..."
  npm test  # or pytest, or whatever

  local exit_code=$?
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  if [[ $exit_code -eq 0 ]]; then
    log_success "MyApp tests passed"
    record_result "myapp" "PASS" "${duration}s"
  else
    log_error "MyApp tests failed"
    record_result "myapp" "FAIL" "${duration}s"
    return 1
  fi

  cd "$ROOT"
}
```

2. **Add to main execution block**:

```bash
# In main execution section
if [[ -z "$SPECIFIC_SUITE" ]]; then
  run_backend_tests || true
  run_myapp_tests || true  # Add here
  # ...
fi
```

3. **Add to suite list** in `print_summary()`:

```bash
for suite in backend myapp frontend; do  # Add "myapp"
  # ...
done
```

4. **Add to --help**:

```bash
AVAILABLE SUITES:
  backend              Backend API tests
  myapp                MyApp tests         # Add here
  frontend             Frontend tests
```

### Removing Unnecessary Suites

If your project doesn't have certain suites (e.g., no TypeScript), simply remove:

1. The suite function (`run_sdk_typescript_tests`)
2. The call in main execution
3. The entry in `print_summary()`
4. The entry in `--help`

### Changing Test Frameworks

Replace test commands in suite functions:

```bash
# From pytest to unittest
pytest -v
# to
python -m unittest discover

# From Jest to Vitest
npm test
# to
npx vitest run

# From npm to pnpm
npm install
# to
pnpm install
```

---

## GitHub Actions Customization

### Service Containers

Add/remove as needed in `.github/workflows/test-orchestrator.yml`:

```yaml
services:
  postgres:  # Remove if not needed
    image: postgres:15-alpine
    # ...

  mysql:  # Add if needed
    image: mysql:8
    env:
      MYSQL_ROOT_PASSWORD: test
    # ...

  mongodb:  # Add if needed
    image: mongo:7
    # ...
```

### Matrix Testing

Test across multiple versions:

```yaml
jobs:
  orchestrator:
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
        node-version: ['18', '20']

    steps:
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### Scheduled Runs

Add cron schedule:

```yaml
on:
  push:
    branches: ["main"]
  schedule:
    - cron: '0 2 * * *'  # Run at 2 AM daily
```

---

## Examples from Other Projects

### Example: Data Science Project

```bash
# test_all.sh

run_notebooks_tests() {
  log_suite "Jupyter Notebooks (validation)"
  jupyter nbconvert --to notebook --execute notebooks/*.ipynb
}

run_models_tests() {
  log_suite "ML Models (validation)"
  pytest tests/models/ -v
}

run_data_pipeline_tests() {
  log_suite "Data Pipeline (integration)"
  python -m data_pipeline.test_runner
}
```

### Example: Infrastructure Project

```bash
# test_all.sh

run_terraform_tests() {
  log_suite "Terraform (validation)"
  cd infra/terraform
  terraform fmt -check
  terraform validate
}

run_ansible_tests() {
  log_suite "Ansible (syntax check)"
  cd infra/ansible
  ansible-playbook --syntax-check playbook.yml
}

run_docker_tests() {
  log_suite "Docker (build test)"
  docker build -t myapp:test .
}
```

### Example: Mobile App Project

```bash
# test_all.sh

run_ios_tests() {
  log_suite "iOS App (XCTest)"
  cd ios
  xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'
}

run_android_tests() {
  log_suite "Android App (JUnit)"
  cd android
  ./gradlew test
}

run_shared_tests() {
  log_suite "Shared Code (Kotlin Multiplatform)"
  cd shared
  ./gradlew allTests
}
```

---

## AI Assistant Prompt

Use this prompt to have AI assistants (Claude/Copilot/ChatGPT) adapt these templates:

```
I want to use the BlackRoad Test Orchestrator pattern in my repository.

Here's my project structure:
[paste tree output or describe structure]

Here are my test commands:
- Component A: [command]
- Component B: [command]
- Component C: [command]

Please:
1. Adapt test_all.sh.template to my project
2. Customize test-orchestrator.yml.template for my CI needs
3. Update TESTING.md.template with my project details

Keep the same structure and philosophy, just adapt the suite functions and paths.
```

---

## Migration from Existing Test Scripts

If you already have test scripts:

### 1. Inventory Existing Scripts

```bash
find . -name "*test*" -type f -executable
# List all test-related scripts
```

### 2. Map to Orchestrator Suites

| Old Script | New Suite Function |
|------------|-------------------|
| `scripts/test-backend.sh` | `run_backend_tests()` |
| `scripts/test-frontend.sh` | `run_frontend_tests()` |
| `Makefile` target `test` | Suite functions |

### 3. Migrate Gradually

Keep old scripts during transition:

```bash
run_backend_tests() {
  log_suite "Backend"

  # Call old script temporarily
  bash scripts/test-backend.sh

  # Record result based on exit code
  if [[ $? -eq 0 ]]; then
    record_result "backend" "PASS" "Xs"
  else
    record_result "backend" "FAIL" "Xs"
  fi
}
```

### 4. Refactor Over Time

Once orchestrator is working, gradually refactor suite functions to be self-contained.

---

## Troubleshooting

### Common Adaptation Issues

**Issue**: Suite detection doesn't work
**Fix**: Check directory paths in suite functions (`if [[ ! -d "$ROOT/myapp" ]]`)

**Issue**: Tests fail in CI but pass locally
**Fix**: Check environment variables, service containers, and paths

**Issue**: Colors don't show in CI
**Fix**: This is normal; GitHub Actions strips color codes from logs

**Issue**: --suite flag doesn't work for new suite
**Fix**: Add new suite to the case statement in main execution

---

## Support

- **Original Implementation**: BlackRoad Operating System
- **Issues**: Report in your repository's issue tracker
- **Questions**: Refer to `TESTING.md` in BlackRoad repo for detailed examples

---

## License

These templates are provided as-is from the BlackRoad Operating System project.
Adapt freely for your own projects.

---

**Happy Testing! 🧪✨**
