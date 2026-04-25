# AI Assistant Prompts for Test Orchestrator Pattern

> **Ready-to-use prompts for Claude, Copilot, ChatGPT, and other AI assistants**

These prompts help AI assistants implement the Test Orchestrator pattern in any repository.

---

## Quick Prompt: Implement Test Orchestrator

Copy and paste this into your AI assistant:

```
You are an AI engineer helping me implement the BlackRoad Test Orchestrator pattern in my repository.

## Context
I want to create a unified test orchestrator script (test_all.sh) and matching CI workflow for my monorepo.

Repository structure:
[PASTE YOUR DIRECTORY STRUCTURE HERE - use `tree -L 2` or describe it]

Current test commands:
- Component 1: [your test command]
- Component 2: [your test command]
- Component 3: [your test command]

## Task
Using the BlackRoad Test Orchestrator templates located at:
- .templates/test-orchestrator/test_all.sh.template
- .templates/test-orchestrator/test-orchestrator.yml.template
- .templates/test-orchestrator/TESTING.md.template

Please:

1. **Create test_all.sh** adapted to my project structure
   - Replace placeholder suite functions with my actual components
   - Use the correct test commands for each suite
   - Update the suite list in print_summary()
   - Customize the help text

2. **Create .github/workflows/test-orchestrator.yml**
   - Add service containers I need (e.g., Postgres, Redis, etc.)
   - Set up the correct language runtimes (Python, Node, Go, etc.)
   - Configure environment variables
   - Add appropriate caching

3. **Create TESTING.md**
   - Document my specific test suites
   - Include my setup instructions
   - Add troubleshooting for my stack

4. **Make it executable**
   - Ensure test_all.sh has executable permissions

## Constraints
- Keep the same structure and helper functions from the template
- Maintain the two-mode design (best-effort and strict)
- Keep the summary table format
- Don't remove the color-coded output
- Follow the same naming conventions

## Output Format
Provide:
1. Complete test_all.sh file
2. Complete .github/workflows/test-orchestrator.yml file
3. Complete TESTING.md file
4. Brief explanation of what you changed

Ready? Let's implement this!
```

---

## Detailed Prompt: Custom Test Orchestrator

For more complex projects, use this expanded prompt:

```
I want to implement a comprehensive test orchestrator for my {{LANGUAGE/STACK}} project.

## Project Details

**Name**: {{REPO_NAME}}
**Description**: {{PROJECT_DESCRIPTION}}
**Primary Languages**: {{e.g., Python, TypeScript, Go, Rust}}
**Test Frameworks**: {{e.g., pytest, Jest, Go testing, Cargo}}

## Current Structure

```
[PASTE TREE OUTPUT OR DESCRIBE STRUCTURE]
```

## Test Suites

I have the following test suites:

1. **{{Suite Name}}**
   - Location: `{{path}}`
   - Framework: {{framework}}
   - Command: `{{test command}}`
   - Dependencies: {{databases, services, etc.}}

2. **{{Suite Name}}**
   - Location: `{{path}}`
   - Framework: {{framework}}
   - Command: `{{test command}}`
   - Dependencies: {{databases, services, etc.}}

[Add more suites...]

## Service Dependencies

For CI, I need:
- [ ] PostgreSQL (version: {{version}})
- [ ] Redis (version: {{version}})
- [ ] MySQL (version: {{version}})
- [ ] MongoDB (version: {{version}})
- [ ] Other: {{describe}}

## Environment Variables

My tests need these environment variables:
```bash
{{VAR_NAME}}={{description}}
{{VAR_NAME}}={{description}}
```

## Special Requirements

- [ ] Need to run database migrations before tests
- [ ] Need to seed test data
- [ ] Need to build artifacts before testing
- [ ] Need to run linters/formatters
- [ ] Need to generate coverage reports
- [ ] Other: {{describe}}

## Task

Create a complete test orchestrator implementation based on the BlackRoad pattern that:

1. **test_all.sh** that:
   - Runs all my test suites
   - Handles my specific frameworks
   - Sets up my service dependencies (locally or via Docker)
   - Has clear, color-coded output
   - Supports best-effort and strict modes
   - Generates a summary table

2. **GitHub Actions workflow** that:
   - Sets up all required service containers
   - Installs all language runtimes
   - Caches dependencies appropriately
   - Runs the test orchestrator
   - Uploads artifacts (coverage, reports)
   - Posts results to PRs

3. **TESTING.md** that:
   - Documents my setup process
   - Explains each test suite
   - Provides troubleshooting for my stack
   - Includes examples for my frameworks

4. **Optional enhancements**:
   - Matrix testing across versions
   - Coverage reporting (Codecov integration)
   - Performance benchmarking
   - Slack/Discord notifications

## Output Format

Provide complete, ready-to-use files with:
- No placeholders (use my actual values)
- Comments explaining key sections
- Examples relevant to my stack
- Clear migration instructions from my current setup

Let's build this!
```

---

## Minimal Prompt: Quick Setup

For simple projects:

```
Implement the BlackRoad Test Orchestrator pattern for my project.

My test commands:
- {{component}}: {{command}}
- {{component}}: {{command}}

Create:
1. test_all.sh (based on .templates/test-orchestrator/test_all.sh.template)
2. .github/workflows/test-orchestrator.yml
3. Make it work with my stack: {{language/framework}}

Keep it simple and working. Go!
```

---

## Migration Prompt: From Existing Setup

If you already have test scripts:

```
I want to migrate my existing test scripts to the BlackRoad Test Orchestrator pattern.

## Current Setup

I currently run tests using:
[DESCRIBE CURRENT APPROACH - Makefile, scripts, npm scripts, etc.]

Current test scripts:
- {{path/to/script1}}: {{what it does}}
- {{path/to/script2}}: {{what it does}}

Current CI workflow:
[PASTE .github/workflows/*.yml or describe]

## Goal

Consolidate everything into:
1. Single test_all.sh orchestrator
2. Unified GitHub Actions workflow
3. Clear documentation

## Migration Strategy

I want to:
- [ ] Keep my existing scripts temporarily (call them from orchestrator)
- [ ] Refactor everything into the orchestrator directly
- [ ] Migrate gradually (one suite at a time)

Please:
1. Analyze my current setup
2. Propose a migration plan
3. Implement the orchestrator calling my existing scripts
4. Suggest refactoring opportunities

Let's migrate!
```

---

## Enhancement Prompt: Add Features

To add features to existing orchestrator:

```
I already have the BlackRoad Test Orchestrator implemented.

I want to add:
- [ ] Matrix testing (test across {{Python 3.9, 3.10, 3.11}} or {{Node 18, 20, 22}})
- [ ] Coverage reporting with Codecov
- [ ] Performance benchmarking
- [ ] Slack/Discord notifications on failure
- [ ] Parallel test execution
- [ ] Test result caching
- [ ] Flaky test detection
- [ ] Other: {{describe}}

Current test_all.sh location: ./test_all.sh
Current workflow location: .github/workflows/test-orchestrator.yml

Please:
1. Show me how to implement {{feature}}
2. Update both test_all.sh and the workflow
3. Explain the tradeoffs
4. Provide configuration examples

Let's enhance!
```

---

## Troubleshooting Prompt

When something isn't working:

```
My Test Orchestrator isn't working correctly.

## Problem

{{DESCRIBE THE ISSUE}}

## What I've Tried

{{WHAT YOU'VE TRIED}}

## Error Output

```
{{PASTE ERROR OUTPUT}}
```

## Current Configuration

test_all.sh:
```bash
{{PASTE RELEVANT SECTION}}
```

Workflow:
```yaml
{{PASTE RELEVANT SECTION}}
```

## Environment

- OS: {{Linux/macOS/Windows}}
- CI: {{GitHub Actions/GitLab CI/CircleCI}}
- Languages: {{Python 3.11, Node 20, etc.}}

Please:
1. Diagnose the issue
2. Provide a fix
3. Explain why it happened
4. Suggest prevention strategies

Help!
```

---

## Framework-Specific Prompts

### Python (pytest) Project

```
Implement BlackRoad Test Orchestrator for my Python project.

Structure:
- src/myapp/
- tests/
  - unit/
  - integration/
  - e2e/
- pytest.ini
- requirements.txt
- requirements-dev.txt

I want:
- Separate suites for unit, integration, e2e
- Coverage reporting (pytest-cov)
- PostgreSQL for integration tests
- Environment isolation (venv)

Create test orchestrator with these suites.
```

### Node.js (Jest) Project

```
Implement BlackRoad Test Orchestrator for my Node.js monorepo.

Structure:
- packages/
  - api/          (Express, Jest)
  - web/          (React, Vitest)
  - sdk/          (TypeScript, Jest)
- package.json (workspace)

I want:
- Suite per package
- Coverage aggregation
- MongoDB for API tests
- Redis for caching tests

Create test orchestrator for this setup.
```

### Go Project

```
Implement BlackRoad Test Orchestrator for my Go project.

Structure:
- cmd/myapp/
- internal/
- pkg/
- tests/
  - unit/
  - integration/

Test commands:
- Unit: go test ./...
- Integration: go test -tags=integration ./tests/integration/...
- Benchmarks: go test -bench=. ./...

Create orchestrator that handles these.
```

### Rust Project

```
Implement BlackRoad Test Orchestrator for my Rust workspace.

Structure:
- crates/
  - api/
  - core/
  - cli/
- Cargo.toml (workspace)

Test commands:
- All: cargo test --all
- Per crate: cargo test -p <crate>
- Doc tests: cargo test --doc

Create orchestrator for Rust testing.
```

---

## Copilot-Specific Tips

When using **GitHub Copilot Chat**:

1. **Open the template files first** so Copilot has context
2. **Use `/tests` command** to generate suite-specific tests
3. **Reference files explicitly**: "Using .templates/test-orchestrator/test_all.sh.template as a base..."
4. **Iterate in chat**: Ask for changes, then refine

Example Copilot Chat flow:

```
You: Using .templates/test-orchestrator/test_all.sh.template, create test_all.sh for my Python project

Copilot: [generates script]

You: Add a suite for my FastAPI backend in backend/

Copilot: [adds suite]

You: Make the PostgreSQL connection optional

Copilot: [updates script]
```

---

## Claude-Specific Tips

When using **Claude**:

1. **Provide full context** in one message
2. **Use code blocks** for templates
3. **Ask for complete files** rather than diffs
4. **Request explanations** for changes

Example Claude prompt:

```
I'm going to paste three template files. Then I want you to adapt them for my project.

[Template 1: test_all.sh.template]
{{paste file}}

[Template 2: test-orchestrator.yml.template]
{{paste file}}

[Template 3: TESTING.md.template]
{{paste file}}

My project structure:
{{describe}}

Please create adapted versions for my project, replacing all placeholders with real values.
```

---

## ChatGPT-Specific Tips

When using **ChatGPT**:

1. **Break into smaller steps** if context window is limited
2. **Use code interpreter** for testing syntax
3. **Ask for alternatives** to see different approaches
4. **Iterate on sections** rather than whole files

Example ChatGPT flow:

```
Me: I want to implement a test orchestrator. Here's my project structure: [paste]

ChatGPT: [suggests approach]

Me: Let's start with the test_all.sh script. Here's the template: [paste]

ChatGPT: [creates script]

Me: Now the GitHub Actions workflow...

[Continue]
```

---

## Tips for All AI Assistants

### 1. Provide Context

Good:
```
My Python monorepo has:
- Backend (FastAPI, pytest)
- Workers (Celery, pytest)
- SDK (httpx, pytest)

Currently I run: cd backend && pytest, cd workers && pytest, etc.

I want one test_all.sh to run everything.
```

Bad:
```
Make me a test script.
```

### 2. Show, Don't Tell

Good:
```
My test suite structure:
tests/
├── unit/
│   ├── test_auth.py
│   └── test_users.py
├── integration/
│   ├── test_api.py
│   └── test_db.py
└── conftest.py

I run: pytest tests/unit/ then pytest tests/integration/
```

Bad:
```
I have some tests in a tests folder.
```

### 3. Specify Exactly What You Need

Good:
```
Create:
1. test_all.sh with suites: backend, frontend, e2e
2. GitHub Actions workflow with Postgres and Redis
3. TESTING.md with setup instructions

Don't include coverage reporting yet.
```

Bad:
```
Make it work.
```

### 4. Iterate

It's okay to refine! After getting initial output:

```
This is close! Can you:
- Change the timeout from 30 to 60 minutes
- Add a suite for my docs (using mdbook test)
- Remove the Redis service (I don't need it)
```

---

## Success Checklist

After implementing, verify:

- [ ] `./test_all.sh` runs and shows summary
- [ ] `./test_all.sh --help` shows your suites
- [ ] `./test_all.sh --suite <name>` runs specific suite
- [ ] `./test_all.sh --strict` fails fast on errors
- [ ] GitHub Actions workflow passes
- [ ] CI output is clear and helpful
- [ ] TESTING.md documents your setup
- [ ] New developers can run tests easily

---

## Common Pitfalls to Avoid

❌ Don't:
- Hardcode paths without checking if they exist
- Skip error handling in suite functions
- Forget to update the suite list in `print_summary()`
- Remove the color output (it's helpful!)
- Make the script depend on complex setup

✅ Do:
- Check if directories exist before running tests
- Record results for every suite (PASS/FAIL/SKIP)
- Update all three places when adding a suite (function, main execution, summary)
- Keep the clean, color-coded output
- Make it work out of the box or fail clearly

---

## Next Steps After Implementation

1. **Test it locally**: `./test_all.sh`
2. **Commit the changes**: `git add test_all.sh .github/workflows/ TESTING.md`
3. **Push and verify CI**: Check GitHub Actions
4. **Update team docs**: Link to TESTING.md in README
5. **Share the pattern**: Help other teams adopt it

---

## Support

- **Original Pattern**: BlackRoad Operating System
- **Templates**: `.templates/test-orchestrator/`
- **Issues**: Open an issue in your repository
- **Questions**: Refer to TESTING.md

---

**Happy Orchestrating! 🎼✨**

---

*These prompts are designed to work with Claude, GitHub Copilot, ChatGPT, and other AI assistants.*
*Adapt them to your specific needs and workflow.*
