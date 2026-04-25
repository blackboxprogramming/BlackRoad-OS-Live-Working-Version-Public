# BlackRoad OS — HTML Template System

**24 templates. 1 CSS file. 1 JS library. Deploy anywhere.**

## Structure

```
blackroad-html/
├── css/
│   └── blackroad.css      ← Full design system (tokens + components + utilities + animations)
├── js/
│   └── blackroad.js       ← Component helpers + tab switching + stagger animations
├── pages/
│   └── index.html          ← Landing page template (blackroad.io)
└── README.md
```

## Usage

### 1. Drop into any repo

Copy `css/blackroad.css` and `js/blackroad.js` into your project. Reference them:

```html
<link rel="stylesheet" href="css/blackroad.css">
<script src="js/blackroad.js"></script>
```

Or use the CDN (once deployed to cdn.blackroad.io):

```html
<link rel="stylesheet" href="https://cdn.blackroad.io/css/blackroad.css">
<script src="https://cdn.blackroad.io/js/blackroad.js"></script>
```

### 2. Build any page

Every page follows this skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page — BlackRoad OS</title>
  <link rel="stylesheet" href="css/blackroad.css">
</head>
<body>

  <!-- Gradient bar at top — always -->
  <div class="grad-bar"></div>

  <!-- Nav — always 52px, spectrum bars, brand name -->
  <nav class="nav">
    <div class="nav-brand">
      <div class="spectrum-bars"><!-- 6 colored divs --></div>
      <span class="nav-brand-name">BlackRoad</span>
    </div>
    <div class="nav-links"><!-- links here --></div>
  </nav>

  <!-- Content sections -->
  <section class="section">
    <div class="page">
      <div class="section-label">Category</div>
      <h2 class="headline h-page">Title</h2>
      <p class="body-text">Description.</p>
      <!-- Components -->
    </div>
  </section>

  <!-- Gradient bar between sections -->
  <div class="grad-bar"></div>

  <!-- Footer — always -->
  <footer class="footer"><!-- see template --></footer>

  <script src="js/blackroad.js"></script>
</body>
</html>
```

## CSS Classes Reference

### Layout
| Class | Description |
|-------|-------------|
| `.page` | Max 720px centered container |
| `.page-wide` | Max 960px for dashboards |
| `.section` | 48px vertical padding |
| `.section-hero` | 56px top, 48px bottom |

### Typography
| Class | Description |
|-------|-------------|
| `.headline` | Space Grotesk 700 |
| `.h-display` | 32-52px responsive |
| `.h-page` | 28-40px responsive |
| `.h-section` | 24-36px responsive |
| `.h-card` | 20px |
| `.h-item` | 17px |
| `.section-label` | JetBrains Mono 11px uppercase #525252 |
| `.body-text` | Inter 15px #737373 |
| `.body-sm` | Inter 14px |
| `.body-xs` | Inter 13px #525252 |
| `.mono-label` | JetBrains 10px uppercase #333 |
| `.mono-data` | JetBrains 12px #a3a3a3 |
| `.mono-sm` | JetBrains 11px #404040 |

### Cards
| Class | Description |
|-------|-------------|
| `.card` | #131313 bg, #1a1a1a border, 10px radius |
| `.card-lg` | 14px radius |
| `.card-pad` | 20px padding |
| `.card-pad-lg` | 28px padding |
| `.card-accent` | 2px top bar (add gradient/color inline) |
| `.card-accent-left` | 3px left bar |

### Buttons
| Class | Description |
|-------|-------------|
| `.btn` | Base button styles |
| `.btn-primary` | White bg, dark text |
| `.btn-secondary` | Transparent, gray border |
| `.btn-ghost` | Transparent, subtle border |
| `.btn-sm` | Smaller padding |
| `.btn-xs` | Smallest |
| `.btn-block` | Full width |

### Data
| Class | Description |
|-------|-------------|
| `.stat-strip` | 1px-gap grid of stat cells |
| `.stat-cell` | Single stat with value + label |
| `.progress` | 4px bar container |
| `.progress-6` | 6px variant |
| `.progress-fill` | Fill bar (set width inline) |
| `.dot` + `.dot-active/idle/offline` | Status indicators |
| `.tag` | Mono uppercase badge |

### Terminal
| Class | Description |
|-------|-------------|
| `.terminal-header` | Dots + title |
| `.terminal-body` | Mono content area |
| `.terminal-cmd` | Command text (#333) |
| `.terminal-out` | Output text (#525252) |
| `.terminal-val` | Highlighted value (#a3a3a3) |

## Domain → Repo Mapping

| Domain | Repo | Template |
|--------|------|----------|
| blackroad.io | BlackRoad-OS/blackroad-os-home | Landing page |
| app.blackroad.io | BlackRoad-OS/blackroad-os-web | Dashboard |
| docs.blackroad.io | BlackRoad-OS/blackroad-os-docs | Documentation |
| status.blackroad.io | BlackRoad-OS/blackroad-os-beacon | Status page |
| console.blackroad.io | BlackRoad-OS/blackroad-os-prism-console | Dashboard |
| lucidia.earth | BlackRoad-AI/lucidia-landing | Landing page |
| lucidia.studio | BlackRoad-Studio/studio-landing | Landing page |
| roadchain.io | BlackRoad-OS/roadchain-landing | Landing page |
| roadcoin.io | BlackRoad-OS/roadcoin-landing | Landing page |
| blackroadinc.us | BlackRoad-OS/corporate-site | About/Leadership |
| blackroad.company | BlackRoad-OS/company-site | About/Leadership |

## Rules

### DO
- Text: grayscale only (#f5f5f5 → #262626)
- Colors on bars, dots, dividers — never text
- JetBrains Mono for data, labels, code, badges
- Space Grotesk 700 for headlines only
- Inter for body, buttons, descriptions
- Cards: #131313 bg, #1a1a1a border, 10-14px radius
- Gradient bar between major sections
- maxWidth: 720px centered

### DON'T
- Never color text
- No gradient text
- No border-radius > 14px
- No system fonts
- No drop shadows
- No more than 2 accent colors per component
