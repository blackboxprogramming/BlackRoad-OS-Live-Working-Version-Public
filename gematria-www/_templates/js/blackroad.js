/* ═══════════════════════════════════════════════════════════
   BLACKROAD OS — Component Library (Vanilla JS)
   Deploy to: cdn.blackroad.io/js/blackroad.js
   Version: 1.0.0
   ═══════════════════════════════════════════════════════════ */

const BR = {
  colors: ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'],
  colorNames: ['ember', 'fuse', 'pulse', 'drift', 'signal', 'arc'],

  // Spectrum bars (nav logo mark)
  spectrumBars(size = 'default') {
    const w = size === 'lg' ? 5 : 3;
    const h = size === 'lg' ? 20 : 14;
    return `<div class="spectrum-bars ${size === 'lg' ? 'spectrum-bars-lg' : ''}">${this.colors.map(c => `<div style="background:${c};width:${w}px;height:${h}px"></div>`).join('')}</div>`;
  },

  // Spectrum dots (section markers)
  spectrumDots() {
    return `<div class="spectrum-dots">${this.colors.map(c => `<div style="background:${c}"></div>`).join('')}</div>`;
  },

  // Gradient bar
  gradBar(height = 1) {
    return `<div class="grad-bar${height > 1 ? '-' + height : ''}"></div>`;
  },

  // Navigation
  nav(title, subtitle = '', links = [], tabs = []) {
    return `
      <div class="grad-bar"></div>
      <nav class="nav">
        <div class="nav-brand">
          ${this.spectrumBars()}
          <span class="nav-brand-name">${title}</span>
          ${subtitle ? `<span class="nav-brand-sub">${subtitle}</span>` : ''}
        </div>
        ${links.length ? `<div class="nav-links hide-mobile">${links.map(l => `<a href="#${l.toLowerCase()}" class="nav-link">${l}</a>`).join('')}</div>` : ''}
        ${tabs.length ? `<div class="nav-tabs">${tabs.map((t, i) => `<button class="nav-tab${i === 0 ? ' active' : ''}" data-tab="${t.toLowerCase()}">${t}</button>`).join('')}</div>` : ''}
      </nav>`;
  },

  // Section label + title
  sectionHead(label, title, desc = '') {
    return `
      <div class="section-label">${label}</div>
      <h2 class="headline h-page mb-${desc ? '12' : '24'}">${title}</h2>
      ${desc ? `<p class="body-text mb-24" style="max-width:480px">${desc}</p>` : ''}`;
  },

  // Stat strip
  statStrip(stats, cols = 4) {
    return `<div class="stat-strip stat-strip-${cols > 3 ? '4' : '3'}">${stats.map(s => `
      <div class="stat-cell">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('')}</div>`;
  },

  // Card
  card(content, { accent = null, accentGradient = false, accentLeft = null, highlight = false, pad = true, cls = '' } = {}) {
    return `<div class="card${highlight ? ' card-highlight' : ''} ${cls}">
      ${accentGradient ? '<div class="card-accent card-accent-gradient"></div>' : ''}
      ${accent ? `<div class="card-accent" style="background:${accent}"></div>` : ''}
      ${accentLeft ? `<div class="card-accent-left" style="background:${accentLeft}"></div>` : ''}
      ${pad ? `<div class="card-pad">${content}</div>` : content}
    </div>`;
  },

  // Button
  btn(label, variant = 'primary', { size = '', block = false, cls = '' } = {}) {
    return `<button class="btn btn-${variant}${size ? ' btn-' + size : ''}${block ? ' btn-block' : ''} ${cls}">${label}</button>`;
  },

  // Tag
  tag(label, tierColor = null) {
    return `<span class="tag">${tierColor ? `<span class="tag-pip" style="background:${tierColor}"></span>` : ''}${label}</span>`;
  },

  // Status dot
  dot(status = 'active') {
    return `<div class="dot dot-${status}"></div>`;
  },

  // Progress bar
  progress(pct, { height = 4, color = null } = {}) {
    return `<div class="progress${height > 4 ? ' progress-6' : ''}"><div class="progress-fill" style="width:${pct}%${color ? ';background:' + color : ''}"></div></div>`;
  },

  // Terminal block
  terminal(title, lines) {
    return `<div class="card">
      <div class="terminal-header">
        <div class="terminal-dot"></div><div class="terminal-dot"></div><div class="terminal-dot"></div>
        <span class="terminal-title">${title}</span>
      </div>
      <div class="terminal-body">${lines.map(l => {
        if (l.type === 'cmd') return `<div class="terminal-cmd">${l.text}</div>`;
        if (l.type === 'out') return `<div class="terminal-out">${l.text}</div>`;
        if (l.type === 'val') return `<div class="terminal-out"><span class="terminal-val">${l.text}</span></div>`;
        return `<div style="color:var(--t-ghost)">${l.text}</div>`;
      }).join('')}</div>
    </div>`;
  },

  // Footer
  footer(label = 'BlackRoad OS', sub = 'blackroad.io', links = ['Home', 'Docs', 'GitHub']) {
    return `
      <footer class="footer">
        <div style="max-width:var(--max-w);margin:0 auto">
          <div class="grad-bar"></div>
          <div class="footer-inner">
            <div>
              <div class="flex items-center gap-8 mb-4">
                ${this.spectrumBars()}
                <span class="footer-brand">${label}</span>
              </div>
              <div class="footer-sub">${sub}</div>
            </div>
            <div class="footer-links">${links.map(l => `<a href="#" class="footer-link">${l}</a>`).join('')}</div>
          </div>
        </div>
      </footer>`;
  },

  // Tab switching
  initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const tabs = container.querySelectorAll('.nav-tab, .filter-tab');
    const panels = container.querySelectorAll('[data-panel]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        panels.forEach(p => p.style.display = p.dataset.panel === target ? '' : 'none');
      });
    });
  },

  // Stagger animation on scroll
  initStagger() {
    const items = document.querySelectorAll('[data-stagger]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.dataset.stagger) || 0;
          entry.target.style.animation = `stagger-in 0.5s ease ${delay}s both`;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(item => observer.observe(item));
  },

  // Initialize everything
  init() {
    this.initStagger();
    document.querySelectorAll('[data-tabs]').forEach(el => this.initTabs(`[data-tabs="${el.dataset.tabs}"]`));
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => BR.init());
