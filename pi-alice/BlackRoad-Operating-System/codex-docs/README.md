# BlackRoad OS Codex

Complete documentation for BlackRoad Operating System, built with MkDocs.

## Building the Docs

### Install Dependencies

```bash
pip install mkdocs mkdocs-material mkdocstrings pymdown-extensions
```

### Serve Locally

```bash
cd codex-docs
mkdocs serve
```

Visit `http://localhost:8000`

### Build Static Site

```bash
mkdocs build
```

Output in `site/` directory.

### Deploy to GitHub Pages

```bash
mkdocs gh-deploy
```

## Structure

```
codex-docs/
├── mkdocs.yml              # Configuration
├── docs/                   # Documentation source
│   ├── index.md            # Homepage
│   ├── architecture.md     # Architecture guide
│   ├── components.md       # Component overview
│   ├── infra.md            # Infrastructure
│   ├── modules/            # Module docs
│   ├── dev/                # Development guides
│   └── api/                # API reference
└── site/                   # Built site (gitignored)
```

## Features

- **Material Theme** - Modern, responsive design
- **Dark Mode** - Light/dark theme toggle
- **Search** - Full-text search
- **Code Highlighting** - Syntax highlighting for all languages
- **Navigation** - Tabbed navigation with sections
- **Mobile Friendly** - Responsive design

## License

Part of BlackRoad Operating System - MIT License
