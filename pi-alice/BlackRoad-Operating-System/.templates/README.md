# BlackRoad Templates

> **Reusable patterns and templates from BlackRoad Operating System**

This directory contains battle-tested templates and patterns that can be copied to other projects.

---

## Available Templates

### 🧪 [Test Orchestrator](./test-orchestrator/)

**Purpose**: Unified test orchestration for monorepos

**What's Included**:
- `test_all.sh.template` - Universal test orchestrator script
- `test-orchestrator.yml.template` - GitHub Actions workflow
- `TESTING.md.template` - Comprehensive testing documentation
- `PROMPTS.md` - AI assistant prompts for implementation
- `README.md` - Usage guide and customization instructions

**When to Use**:
- Multi-language monorepos
- Projects with multiple test suites
- Teams wanting consistent test execution
- CI/CD pipelines needing orchestration

**Quick Start**:
```bash
# Copy to your repo
cp -r .templates/test-orchestrator/* /path/to/your/repo/

# Customize for your project
# See test-orchestrator/README.md for details
```

**Used In**:
- BlackRoad Operating System (this repo)
- Can be adapted for any project

---

## Future Templates

Plans to add:

- **CI/CD Pipeline Templates** - Reusable GitHub Actions workflows
- **Docker Compose Stacks** - Development environment templates
- **API Documentation** - OpenAPI/Swagger templates
- **Project Structure** - New project scaffolding
- **Release Automation** - Semantic versioning and changelog generation

---

## Contributing Templates

When adding new templates to this directory:

1. **Create a subdirectory**: `.templates/my-template/`
2. **Include these files**:
   - `README.md` - Usage guide
   - Template files with `.template` extension
   - `PROMPTS.md` - AI assistant prompts (optional)
   - Examples (optional)
3. **Document in this README**: Add section above
4. **Test thoroughly**: Ensure it works in multiple scenarios
5. **Keep generic**: Use placeholders like `{{REPO_NAME}}`

### Template Quality Standards

✅ **Good Template**:
- Clear placeholders (e.g., `{{TODO}}`, `{{REPLACE_ME}}`)
- Comprehensive comments
- Works out of the box after customization
- Includes usage documentation
- Provides examples

❌ **Poor Template**:
- Hardcoded values
- Missing documentation
- Assumes specific tools without checks
- No examples or guidance

---

## Usage Philosophy

These templates embody BlackRoad's core principles:

1. **Consistency**: Same patterns across all projects
2. **Discoverability**: Clear documentation and examples
3. **Extensibility**: Easy to customize and extend
4. **Simplicity**: No unnecessary complexity
5. **Practicality**: Battle-tested in production

When using these templates:

- **Don't blindly copy**: Understand what they do
- **Customize thoughtfully**: Adapt to your needs
- **Maintain quality**: Keep the same standards
- **Share improvements**: Contribute back when you find better approaches

---

## Template Versioning

Templates follow semantic versioning:

- **Major**: Breaking changes to structure or API
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, documentation updates

Current versions:

- `test-orchestrator`: v1.0.0 (2025-11-18)

---

## Support

- **Documentation**: Each template has its own README
- **Issues**: Report in BlackRoad Operating System repo
- **Questions**: Open a discussion in the main repo
- **AI Assistance**: Use PROMPTS.md files with Claude/Copilot

---

## License

Templates are provided as-is from BlackRoad Operating System.
Use freely in your own projects, commercial or personal.

Attribution appreciated but not required.

---

**Build amazing things! 🚀✨**
