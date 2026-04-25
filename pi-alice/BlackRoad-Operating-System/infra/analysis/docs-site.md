# Service Analysis: docs-site

**Status**: ✅ ACTIVE (GitHub Pages)
**Last Analyzed**: 2025-11-19
**Service Type**: Static Documentation Site
**Platform**: GitHub Pages + Cloudflare CDN

---

## Overview

Technical documentation site built with MkDocs Material theme. Deployed to GitHub Pages and served via Cloudflare CDN at `docs.blackroad.systems`.

---

## Technology Stack

### Static Site Generator
- **Tool**: MkDocs 1.5+
- **Theme**: Material for MkDocs
- **Plugins**: search, minify, git-revision-date

### Build Process
```bash
cd codex-docs
mkdocs build --strict
# Output: site/
```

---

## Content Structure

### Documentation Categories
- **Architecture**: System design, decisions, deployment
- **API Reference**: Endpoint documentation, schemas
- **Guides**: Quickstart, development, deployment
- **Agents**: Agent ecosystem, creating agents
- **Contributing**: Contribution guidelines

### Source Location
- **Root**: `codex-docs/`
- **Config**: `codex-docs/mkdocs.yml`
- **Docs**: `codex-docs/docs/`
- **Build Output**: `codex-docs/site/` (gitignored)

---

## Deployment

### Platform
- **Primary**: GitHub Pages
- **Branch**: `gh-pages` (auto-generated)
- **CDN**: Cloudflare (proxied)

### CI/CD
```yaml
# .github/workflows/docs-deploy.yml
on:
  push:
    branches: [main]
    paths: ['codex-docs/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pip install mkdocs mkdocs-material
      - name: Build docs
        run: cd codex-docs && mkdocs build --strict
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./codex-docs/site
```

---

## Domain Configuration

### DNS (Cloudflare)
```
Type: CNAME
Name: docs
Value: blackboxprogramming.github.io
Proxy: Enabled (Orange cloud)
TTL: Auto
```

### GitHub Pages
```
Repository Settings → Pages
Source: gh-pages branch
Custom domain: docs.blackroad.systems
HTTPS: Enforced
```

---

## Performance

### Metrics
- **Build Time**: ~10-20 seconds
- **Deploy Time**: ~30-60 seconds
- **Page Load**: < 1s (CDN cached)
- **Size**: ~5-10 MB (all pages)

### Optimizations
- Minified HTML/CSS/JS
- Image optimization
- Cloudflare CDN caching
- Gzip compression

---

## Maintenance

### Regular Tasks
- Update documentation with code changes
- Review for outdated content
- Check broken links
- Update screenshots

### Versioning
- Current: Single version (latest)
- Future: Multi-version support with mike

---

## Troubleshooting

### Build Failures
1. Check MkDocs config syntax
2. Verify all referenced files exist
3. Look for broken internal links
4. Check plugin compatibility

### DNS Issues
1. Verify CNAME record in Cloudflare
2. Check GitHub Pages custom domain setting
3. Wait for DNS propagation (up to 24h)

---

*Analysis Date: 2025-11-19*
*Next Review: 2025-12-19*
