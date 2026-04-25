# Documentation Deployment Guide

This guide explains how to build, test, and deploy the BlackRoad OS documentation (Codex).

---

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- Git
- GitHub repository access

---

## Quick Start

### 1. Install Dependencies

```bash
# Navigate to codex-docs directory
cd codex-docs

# Install MkDocs, Material theme, and Minify plugin
pip install mkdocs mkdocs-material pymdown-extensions mkdocs-minify-plugin
```

### 2. Test Locally

```bash
# Serve documentation locally
mkdocs serve

# Access at: http://localhost:8000
# Docs auto-reload on file changes
```

### 3. Build Documentation

```bash
# Build static site (strict mode catches errors)
mkdocs build --strict

# Output in: codex-docs/site/
```

### 4. Deploy to GitHub Pages

**Automatic (Recommended):**

Push changes to `main` branch. GitHub Actions workflow automatically builds and deploys.

**Manual:**

```bash
# Deploy to gh-pages branch
mkdocs gh-deploy

# This creates/updates the gh-pages branch with built site
```

---

## Configuration

### MkDocs Configuration

**File**: `codex-docs/mkdocs.yml`

Key settings:

```yaml
site_name: BlackRoad OS Codex
site_url: https://docs.blackroad.systems
repo_url: https://github.com/blackboxprogramming/BlackRoad-Operating-System

theme:
  name: material
  palette:
    scheme: slate  # Dark mode
    primary: deep purple
    accent: purple

nav:
  - Home: index.md
  - Architecture: architecture/
  - API Reference: api/
  - Guides: guides/
  - Agents: agents/
  - Contributing: contributing.md
```

### Material Theme Customization

**Custom CSS**: `codex-docs/docs/stylesheets/extra.css`

```css
/* Add custom styles here */
.md-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Click "Save"

### Step 2: Configure Custom Domain

**In GitHub:**

1. Settings → Pages → Custom domain
2. Enter: `docs.blackroad.systems`
3. ✅ Enforce HTTPS
4. Save

**In Cloudflare DNS:**

Add CNAME record:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | docs | blackboxprogramming.github.io | ✅ Proxied |

### Step 3: Wait for DNS Propagation

```bash
# Check DNS
dig docs.blackroad.systems

# Check HTTPS
curl -I https://docs.blackroad.systems
```

**Propagation time**: 5-10 minutes

---

## GitHub Actions Workflow

**File**: `.github/workflows/docs-deploy.yml`

Workflow triggers:

- Push to `main` branch (if `codex-docs/` changed)
- Manual dispatch (Actions tab → Run workflow)

Steps:

1. Checkout code
2. Install Python 3.11
3. Install MkDocs + Material + pymdown-extensions
4. Build with `mkdocs build --strict`
5. Deploy to `gh-pages` branch

### Manual Workflow Trigger

1. Go to repository → Actions
2. Select "Deploy Documentation" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

---

## Writing Documentation

### File Structure

```
codex-docs/
├── mkdocs.yml              # Configuration
├── docs/                   # Markdown files
│   ├── index.md            # Homepage
│   ├── architecture/       # Architecture docs
│   ├── api/                # API reference
│   ├── guides/             # User guides
│   ├── agents/             # Agent docs
│   └── contributing.md     # Contributing guide
└── site/                   # Built site (gitignored)
```

### Adding a New Page

1. Create markdown file in `docs/`
2. Add to navigation in `mkdocs.yml`:

```yaml
nav:
  - New Section:
      - Page Title: path/to/file.md
```

3. Test locally: `mkdocs serve`
4. Commit and push

### Markdown Extensions

**Admonitions** (callouts):

```markdown
!!! note "Title"
    This is a note.

!!! warning
    This is a warning.

!!! tip
    This is a tip.
```

**Code Blocks** with syntax highlighting:

````markdown
```python
def hello():
    print("Hello, world!")
```
````

**Tabs**:

```markdown
=== "Python"
    ```python
    print("Hello")
    ```

=== "JavaScript"
    ```javascript
    console.log("Hello");
    ```
```

**Diagrams** (Mermaid):

````markdown
```mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
```
````

---

## Troubleshooting

### Issue: Build fails with "Strict mode"

**Cause**: Broken links or missing files

**Fix**:

```bash
# Build with verbose output
mkdocs build --strict --verbose

# Check error message for specific issue
# Common issues:
# - Broken internal links
# - Missing images
# - Invalid YAML in frontmatter
```

### Issue: Changes not appearing

**Check**:

1. Workflow ran successfully (GitHub Actions)
2. `gh-pages` branch updated (check commit time)
3. Hard refresh browser (Ctrl+F5)
4. DNS cache cleared

**Debug**:

```bash
# Check workflow status
gh run list --workflow=docs-deploy.yml

# View workflow logs
gh run view <run-id> --log
```

### Issue: Custom domain not working

**Check**:

1. CNAME record in Cloudflare:
   ```
   dig docs.blackroad.systems
   # Should return: blackboxprogramming.github.io
   ```

2. GitHub Pages settings:
   - Custom domain: `docs.blackroad.systems`
   - Enforce HTTPS: ✅ enabled

3. Wait 5-10 minutes for DNS propagation

### Issue: CSS not loading

**Check**:

1. `extra_css` in `mkdocs.yml` points to correct file
2. CSS file exists in `docs/stylesheets/`
3. Hard refresh browser (Ctrl+Shift+R)

---

## Best Practices

### Documentation Writing

- **Clear titles**: Use descriptive H1 headings
- **TOC**: MkDocs auto-generates table of contents
- **Code examples**: Always include working examples
- **Screenshots**: Use when helpful, but keep file size < 500KB
- **Links**: Use relative links for internal pages

### Maintenance

- **Update on feature changes**: New API endpoints, config options
- **Version docs**: (future) Use mike for versioning
- **Test locally**: Always `mkdocs serve` before pushing
- **Review workflow**: Check Actions tab after pushing

### Performance

- **Image optimization**: Use compressed images (PNG/WebP)
- **Lazy loading**: Material theme handles this
- **CDN**: GitHub Pages + Cloudflare provide global CDN

---

## Advanced Features

### Search Configuration

**File**: `mkdocs.yml`

```yaml
plugins:
  - search:
      separator: '[\s\-,:!=\[\]()"`/]+|\.(?!\d)|&[lg]t;|(?!\b)(?=[A-Z][a-z])'
```

### Analytics (Future)

**File**: `mkdocs.yml`

```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX  # Replace with actual ID
```

### Versioning (Future - Phase 2+)

Use **mike** for version management:

```bash
# Install mike
pip install mike

# Deploy v1.0
mike deploy 1.0 latest -u

# Set default version
mike set-default latest
```

---

## Deployment Checklist

Before deploying:

- [ ] All markdown files render correctly locally
- [ ] No broken links (`mkdocs build --strict` passes)
- [ ] Navigation structure is logical
- [ ] Code examples are tested
- [ ] Images are optimized
- [ ] Frontmatter is valid (if used)

After deploying:

- [ ] Workflow completed successfully (GitHub Actions)
- [ ] Site accessible at https://docs.blackroad.systems
- [ ] Search works
- [ ] Navigation works
- [ ] Mobile responsive (test on phone)
- [ ] SSL enabled (green padlock)

---

## Resources

### MkDocs

- **Documentation**: https://www.mkdocs.org
- **Material Theme**: https://squidfunk.github.io/mkdocs-material/
- **Extensions**: https://facelessuser.github.io/pymdown-extensions/

### GitHub Pages

- **Documentation**: https://docs.github.com/en/pages
- **Custom domains**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

### Markdown

- **CommonMark Spec**: https://commonmark.org
- **GitHub Flavored Markdown**: https://github.github.com/gfm/

---

## Support

- **Issues**: Report documentation issues on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Pull Requests**: Contributions welcome!

---

**Where AI meets the open road.** 🛣️

*Documentation deployment guide for BlackRoad OS Codex*
