// PIXEL FOUNDRY — PLANTS / FLORA (with axes)
// flower, tree, bush, mushroom, cactus, grass, vine, fern

const PLANTS = {
  AXES: {
    flower:   { species: ['rose','tulip','daisy','sunflower','lily'], color: ['pink','amber','violet','blue','white','black'], size: ['s','m','l'] },
    tree:     { species: ['oak','pine','birch','willow','cherry','palm'], season: ['spring','summer','autumn','winter'] },
    bush:     { size: ['s','m','l'], flowering: ['no','yes'], color: ['pink','amber','violet','white'] },
    mushroom: { kind: ['classic','stem','button','coral'], color: ['pink','amber','violet','blue','white'] },
    cactus:   { kind: ['barrel','saguaro','prickly'], flower: ['no','yes'] },
    grass:    { length: ['short','long'], dry: ['no','yes'], flowers: ['no','yes'] },
    vine:     { length: ['s','m','l'], leafy: ['no','yes'], flowers: ['no','yes'] },
    fern:     { size: ['s','m','l'] }
  },

  _bloom: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90', center: '#F5A623' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b', center: '#FF1D6C' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6', center: '#F5A623' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff', center: '#F5A623' },
    white:  { main: '#f5f5f5', dark: '#c0c0c0', light: '#ffffff', center: '#F5A623' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a', center: '#FF1D6C' }
  },
  _leaf:  { dark: '#2a5a2a', mid: '#3a7a3a', light: '#4a9a4a', glow: '#7acc7a' },
  _bark:  { dark: '#3a2510', mid: '#5a3a1a', light: '#7a5028' },

  // FLOWER (28x40)
  flower(ctx, x, y, opts = {}, time = 0) {
    const c = this._bloom[opts.color || 'pink'];
    const sz = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const sway = Math.sin(time / 30) * 1;
    const cx = x + 14 + sway, base = y + 38;
    // Stem
    ctx.fillStyle = this._leaf.dark;
    ctx.fillRect(cx - 1 - sway / 2, y + 18, 2, 22);
    ctx.fillStyle = this._leaf.mid;
    ctx.fillRect(cx - sway / 2, y + 18, 1, 22);
    // Leaves on stem
    ctx.fillStyle = this._leaf.mid;
    ctx.fillRect(cx - 4, y + 28, 4, 2);
    ctx.fillRect(cx + 1, y + 32, 4, 2);
    ctx.fillStyle = this._leaf.light;
    ctx.fillRect(cx - 4, y + 28, 1, 1);
    ctx.fillRect(cx + 4, y + 32, 1, 1);
    // Bloom
    const r = 6 * sz;
    ctx.translate(cx, y + 14);
    if (opts.species === 'tulip') {
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(-r, 4); ctx.lineTo(0, -r);
      ctx.lineTo(r, 4); ctx.lineTo(r * 0.6, 6);
      ctx.lineTo(0, 4); ctx.lineTo(-r * 0.6, 6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 3); ctx.lineTo(0, -r * 0.8);
      ctx.lineTo(r * 0.7, 3); ctx.lineTo(0, 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(-1, -r * 0.5, 2, 4);
    } else if (opts.species === 'daisy') {
      // 6 petals
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillStyle = c.main;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, r * 0.5, r * 0.7, a, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.light;
        ctx.fillRect(Math.cos(a) * r - 1, Math.sin(a) * r - 1, 2, 1);
      }
      ctx.fillStyle = c.center;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
    } else if (opts.species === 'sunflower') {
      ctx.fillStyle = c.main;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, r * 0.4, r * 0.7, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#3a2510';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a3a1a';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillRect(Math.cos(a) * r * 0.4 - 1, Math.sin(a) * r * 0.4 - 1, 1, 1);
      }
    } else if (opts.species === 'lily') {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.5, r, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.main;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.4, r * 0.85, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = c.center;
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    } else { // rose default
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  // TREE (60x80)
  tree(ctx, x, y, opts = {}, time = 0) {
    const species = opts.species || 'oak';
    const season = opts.season || 'summer';
    const sway = Math.sin(time / 30) * 1;
    const leaf = season === 'autumn' ? { dark:'#a85a26', mid:'#d4823a', light:'#F5A623', glow:'#ffc46b' } :
                 season === 'winter' ? { dark:'#5a5a60', mid:'#7a7a80', light:'#a0a0a8', glow:'#ffffff' } :
                 season === 'spring' ? { dark:'#3a7a3a', mid:'#FF1D6C', light:'#ff5a90', glow:'#7acc7a' } :
                                       this._leaf;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(x + 30, y + 78, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Trunk
    const trunk = species === 'birch' ? { dark:'#9a9a9a', mid:'#d8d8d8', light:'#ffffff' } :
                  species === 'palm'  ? { dark:'#5a3a1a', mid:'#7a5028', light:'#9a6838' } :
                                        this._bark;
    ctx.fillStyle = trunk.dark;
    ctx.fillRect(x + 26, y + 50, 8, 28);
    ctx.fillStyle = trunk.mid;
    ctx.fillRect(x + 27, y + 50, 6, 28);
    if (species === 'birch') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 28, y + 56, 4, 1);
      ctx.fillRect(x + 27, y + 64, 4, 1);
      ctx.fillRect(x + 29, y + 70, 3, 1);
    }
    // Canopy
    if (species === 'pine') {
      ctx.fillStyle = leaf.dark;
      for (let i = 0; i < 4; i++) {
        const ww = 36 - i * 6;
        const yy = y + 4 + i * 12;
        ctx.beginPath();
        ctx.moveTo(x + 30 - ww / 2 + sway, yy + 14);
        ctx.lineTo(x + 30 + sway, yy);
        ctx.lineTo(x + 30 + ww / 2 + sway, yy + 14);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = leaf.mid;
        ctx.beginPath();
        ctx.moveTo(x + 30 - ww / 2 + 2 + sway, yy + 13);
        ctx.lineTo(x + 30 + sway, yy + 2);
        ctx.lineTo(x + 30 + ww / 2 - 2 + sway, yy + 13);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = leaf.dark;
      }
    } else if (species === 'palm') {
      // Coconuts
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 22, y + 42, 4, 4);
      ctx.fillRect(x + 34, y + 42, 4, 4);
      // Fronds
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI - Math.PI / 4;
        const ex = x + 30 + Math.cos(a) * 28 + sway;
        const ey = y + 16 + Math.sin(a) * 16;
        ctx.strokeStyle = leaf.dark;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x + 30, y + 16); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = leaf.mid;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 30, y + 16); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.lineWidth = 1;
    } else if (species === 'willow') {
      ctx.fillStyle = leaf.dark;
      ctx.beginPath(); ctx.arc(x + 30 + sway, y + 18, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leaf.mid;
      // Drooping strands
      for (let i = -3; i <= 3; i++) {
        ctx.fillRect(x + 30 + i * 5 + sway, y + 16, 1, 24 + (i & 1) * 6);
      }
      ctx.fillStyle = leaf.light;
      ctx.beginPath(); ctx.arc(x + 24 + sway, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    } else if (species === 'cherry' || (species === 'oak' && season === 'spring')) {
      // Round canopy with blossoms
      ctx.fillStyle = leaf.dark;
      ctx.beginPath(); ctx.arc(x + 30 + sway, y + 22, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leaf.mid;
      ctx.beginPath(); ctx.arc(x + 26 + sway, y + 18, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = species === 'cherry' ? '#FF1D6C' : leaf.light;
      ctx.beginPath(); ctx.arc(x + 32 + sway, y + 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leaf.glow;
      [[26, 14], [34, 22], [22, 26], [38, 18]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx + sway, y + dy, 2, 2);
      });
    } else { // oak / birch / default deciduous
      ctx.fillStyle = leaf.dark;
      ctx.beginPath(); ctx.arc(x + 30 + sway, y + 22, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leaf.mid;
      ctx.beginPath(); ctx.arc(x + 26 + sway, y + 18, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 36 + sway, y + 26, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leaf.light;
      ctx.beginPath(); ctx.arc(x + 22 + sway, y + 14, 8, 0, Math.PI * 2); ctx.fill();
      if (season === 'winter') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x + 22 + sway, y + 12, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 38 + sway, y + 22, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Falling autumn leaves
    if (season === 'autumn') {
      for (let i = 0; i < 3; i++) {
        const fy = (time / 4 + i * 30) % 60;
        ctx.fillStyle = ['#F5A623', '#c41758', '#c4851c'][i];
        ctx.fillRect(x + 10 + i * 18 + Math.sin(time / 10 + i) * 4, y + 20 + fy, 2, 2);
      }
    }
  },

  // BUSH (40x32)
  bush(ctx, x, y, opts = {}, time = 0) {
    const sz = { s: 0.7, m: 1, l: 1.2 }[opts.size || 'm'];
    const w = 40 * sz, h = 24 * sz;
    const cx = x + 20, cy = y + 16;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(cx, y + 30, w / 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._leaf.dark;
    ctx.beginPath(); ctx.arc(cx, cy, h * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - 6 * sz, cy + 4, h * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6 * sz, cy + 4, h * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._leaf.mid;
    ctx.beginPath(); ctx.arc(cx - 4 * sz, cy - 2, h * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 4 * sz, cy - 2, h * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._leaf.light;
    ctx.beginPath(); ctx.arc(cx, cy - 4, h * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._leaf.glow;
    ctx.fillRect(cx - 4, cy - 6, 2, 1);
    ctx.fillRect(cx + 6, cy - 2, 2, 1);
    if (opts.flowering === 'yes') {
      const c = this._bloom[opts.color || 'pink'];
      const sway = Math.sin(time / 20) * 0.5;
      [[-8, -2], [4, -6], [-2, 4], [10, 2], [-12, 6]].forEach(([dx, dy]) => {
        ctx.fillStyle = c.dark;
        ctx.beginPath(); ctx.arc(cx + dx * sz + sway, cy + dy * sz, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.main;
        ctx.beginPath(); ctx.arc(cx + dx * sz + sway, cy + dy * sz, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.center;
        ctx.fillRect(cx + dx * sz + sway, cy + dy * sz, 1, 1);
      });
    }
  },

  // MUSHROOM (24x32)
  mushroom(ctx, x, y, opts = {}, time = 0) {
    const c = this._bloom[opts.color || 'pink'];
    const kind = opts.kind || 'classic';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    if (kind === 'stem') {
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 10, y + 12, 4, 18);
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 12, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 11, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      [-3, 0, 3].forEach(dx => ctx.fillRect(x + 12 + dx, y + 10, 2, 1));
    } else if (kind === 'button') {
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 8, y + 18, 8, 12);
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.arc(x + 12, y + 18, 10, Math.PI, 0); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(x + 12, y + 18, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff';
      [[8, 14], [14, 12], [16, 16]].forEach(([sx, sy]) => ctx.fillRect(x + sx, y + sy, 2, 2));
    } else if (kind === 'coral') {
      // Branchy
      ctx.fillStyle = c.dark;
      [10, 12, 14].forEach((sx, i) => {
        ctx.fillRect(x + sx, y + 14 + i * 2, 2, 16 - i * 2);
      });
      ctx.fillStyle = c.main;
      [[8, 8], [16, 8], [12, 4], [6, 14], [18, 14]].forEach(([sx, sy]) => {
        ctx.fillRect(x + sx, y + sy, 2, 6);
      });
      ctx.fillStyle = c.light;
      [8, 12, 16].forEach(sx => ctx.fillRect(x + sx, y + 6, 2, 2));
    } else { // classic toadstool
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 9, y + 14, 6, 16);
      ctx.fillStyle = '#c4935a';
      ctx.fillRect(x + 9, y + 28, 6, 2);
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 14, 12, 10, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 14, 10, 8, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff';
      [[8, 8], [13, 6], [17, 10], [11, 11], [16, 13]].forEach(([sx, sy]) => {
        ctx.beginPath(); ctx.arc(x + sx, y + sy, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    }
  },

  // CACTUS (28x44)
  cactus(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'barrel';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 42, 20, 2);
    if (kind === 'saguaro') {
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(x + 11, y + 4, 6, 38);
      ctx.fillRect(x + 4, y + 18, 6, 12);
      ctx.fillRect(x + 18, y + 14, 6, 16);
      ctx.fillStyle = '#4a9a4a';
      ctx.fillRect(x + 12, y + 4, 4, 38);
      ctx.fillRect(x + 5, y + 18, 4, 10);
      ctx.fillRect(x + 19, y + 14, 4, 14);
      // Spines
      ctx.fillStyle = '#2a5a2a';
      for (let yy = 8; yy < 40; yy += 4) ctx.fillRect(x + 11, y + yy, 6, 1);
    } else if (kind === 'prickly') {
      ctx.fillStyle = '#3a7a3a';
      ctx.beginPath(); ctx.ellipse(x + 14, y + 32, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 10, y + 22, 7, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 18, y + 16, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      ctx.beginPath(); ctx.ellipse(x + 14, y + 32, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      [[8, 28], [16, 30], [12, 22], [20, 18]].forEach(([sx, sy]) => ctx.fillRect(x + sx, y + sy, 1, 1));
    } else { // barrel
      ctx.fillStyle = '#3a7a3a';
      ctx.beginPath(); ctx.ellipse(x + 14, y + 28, 10, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      ctx.beginPath(); ctx.ellipse(x + 13, y + 27, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a5a2a';
      [10, 13, 16].forEach(sx => ctx.fillRect(x + sx, y + 18, 1, 22));
    }
    if (opts.flower === 'yes') {
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 14, y + 6, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a90';
      ctx.beginPath(); ctx.arc(x + 14, y + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 13, y + 5, 2, 2);
    }
  },

  // GRASS (40x24)
  grass(ctx, x, y, opts = {}, time = 0) {
    const long = opts.length === 'long';
    const dry = opts.dry === 'yes';
    const blade = dry ? '#c4851c' : '#3a7a3a';
    const tip = dry ? '#daa86a' : '#4a9a4a';
    const h = long ? 20 : 12;
    const sway = Math.sin(time / 25) * 0.5;
    for (let i = 0; i < 18; i++) {
      const px = x + 2 + i * 2 + (i & 1);
      const variance = (i * 7) % 4;
      const bh = h - variance;
      ctx.fillStyle = blade;
      ctx.fillRect(px + sway * (i & 1 ? 1 : -1), y + 24 - bh, 1, bh);
      ctx.fillStyle = tip;
      ctx.fillRect(px + sway * (i & 1 ? 1 : -1), y + 24 - bh, 1, 2);
    }
    if (opts.flowers === 'yes') {
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 8, y + 24 - h, 2, 2);
      ctx.fillRect(x + 22, y + 24 - h - 1, 2, 2);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 30, y + 24 - h, 2, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 16, y + 24 - h - 2, 2, 2);
    }
  },

  // VINE (24x60)
  vine(ctx, x, y, opts = {}, time = 0) {
    const len = { s: 30, m: 50, l: 60 }[opts.length || 'm'];
    const sway = Math.sin(time / 25) * 1.5;
    ctx.strokeStyle = '#3a2510';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    for (let i = 0; i <= len; i += 4) {
      const wx = x + 12 + Math.sin(i / 8) * 4 + sway;
      ctx.lineTo(wx, y + i);
    }
    ctx.stroke();
    if (opts.leafy === 'yes') {
      for (let i = 6; i < len; i += 8) {
        const wx = x + 12 + Math.sin(i / 8) * 4 + sway;
        const side = (i / 8) & 1 ? 1 : -1;
        ctx.fillStyle = this._leaf.dark;
        ctx.beginPath();
        ctx.ellipse(wx + side * 4, y + i, 4, 2.5, side * Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this._leaf.mid;
        ctx.beginPath();
        ctx.ellipse(wx + side * 4, y + i, 3, 2, side * Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (opts.flowers === 'yes') {
      for (let i = 12; i < len; i += 16) {
        const wx = x + 12 + Math.sin(i / 8) * 4 + sway;
        ctx.fillStyle = '#FF1D6C';
        ctx.beginPath(); ctx.arc(wx, y + i, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F5A623';
        ctx.fillRect(wx - 1, y + i - 1, 2, 1);
      }
    }
  },

  // FERN (40x44)
  fern(ctx, x, y, opts = {}, time = 0) {
    const sz = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const sway = Math.sin(time / 28) * 1;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 8, y + 42, 24, 2);
    for (let frond = 0; frond < 5; frond++) {
      const a = -Math.PI / 2 + (frond / 4 - 0.5) * Math.PI * 0.7;
      const len = 28 * sz;
      const ex = x + 20 + Math.cos(a) * len + sway;
      const ey = y + 42 + Math.sin(a) * len;
      // Stem
      ctx.strokeStyle = this._leaf.dark;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 20, y + 42); ctx.lineTo(ex, ey); ctx.stroke();
      // Leaflets
      const steps = 8;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const lx = x + 20 + Math.cos(a) * len * t + sway * t;
        const ly = y + 42 + Math.sin(a) * len * t;
        const perp = a + Math.PI / 2;
        const lwidth = 4 * (1 - t * 0.5);
        ctx.fillStyle = this._leaf.mid;
        ctx.fillRect(lx + Math.cos(perp) * lwidth, ly + Math.sin(perp) * lwidth, 2, 1);
        ctx.fillRect(lx - Math.cos(perp) * lwidth, ly - Math.sin(perp) * lwidth, 2, 1);
        ctx.fillStyle = this._leaf.light;
        ctx.fillRect(lx, ly, 1, 1);
      }
    }
    ctx.lineWidth = 1;
  }
};

if (typeof module !== 'undefined') module.exports = PLANTS;
