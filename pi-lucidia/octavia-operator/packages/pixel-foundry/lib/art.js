// PIXEL FOUNDRY — ART
// canvas, palette, easel, sculpture, charcoal, paintTube, brushSet, frame, museumBust, sketchbook

const ART = {
  AXES: {
    canvas:    { painting: ['abstract','landscape','portrait','blank'] },
    palette:   { used: ['fresh','used'] },
    paintTube: { color: ['pink','amber','violet','blue','white','black','green'] },
    frame:     { style: ['ornate','modern','vintage','rustic'], color: ['amber','black','wood','white'] },
    sculpture: { material: ['marble','bronze','wood'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    green:  { main: '#3acc3a', dark: '#2a8a2a', light: '#7acc7a' }
  },

  // CANVAS (40x44)
  canvas(ctx, x, y, opts = {}, time = 0) {
    const painting = opts.painting || 'abstract';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 42, 36, 2);
    // Frame
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 2, y + 2, 36, 38);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 3, y + 3, 34, 36);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 3, y + 3, 34, 1);
    // Canvas
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(x + 6, y + 6, 28, 30);
    if (painting === 'abstract') {
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 14, y + 14, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 24, y + 22, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(x + 8, y + 24, 10, 8);
      ctx.fillStyle = '#2979FF';
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 8); ctx.lineTo(x + 32, y + 12);
      ctx.lineTo(x + 28, y + 20);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 18);
      ctx.bezierCurveTo(x + 14, y + 30, x + 24, y + 14, x + 34, y + 26);
      ctx.stroke();
    } else if (painting === 'landscape') {
      // Sky
      const grd = ctx.createLinearGradient(x, y + 6, x, y + 24);
      grd.addColorStop(0, '#5a9fff');
      grd.addColorStop(1, '#FF5A90');
      ctx.fillStyle = grd;
      ctx.fillRect(x + 6, y + 6, 28, 18);
      // Sun
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 26, y + 12, 3, 0, Math.PI * 2); ctx.fill();
      // Mountains
      ctx.fillStyle = '#9C27B0';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 24); ctx.lineTo(x + 14, y + 14);
      ctx.lineTo(x + 20, y + 18); ctx.lineTo(x + 28, y + 12);
      ctx.lineTo(x + 34, y + 18); ctx.lineTo(x + 34, y + 24);
      ctx.closePath(); ctx.fill();
      // Ground
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 6, y + 24, 28, 12);
      ctx.fillStyle = '#7acc7a';
      [10, 18, 26, 32].forEach(px => ctx.fillRect(x + px, y + 28, 2, 2));
    } else if (painting === 'portrait') {
      // Background
      ctx.fillStyle = '#7b1f8c';
      ctx.fillRect(x + 6, y + 6, 28, 30);
      // Face
      ctx.fillStyle = '#e6c8a8';
      ctx.fillRect(x + 14, y + 12, 12, 14);
      ctx.fillStyle = '#c4a888';
      ctx.fillRect(x + 14, y + 22, 12, 4);
      // Hair
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 13, y + 8, 14, 6);
      // Eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 16, y + 16, 2, 2);
      ctx.fillRect(x + 22, y + 16, 2, 2);
      // Lips
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 18, y + 22, 4, 1);
      // Shoulders
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 10, y + 28, 20, 8);
    } else if (painting === 'blank') {
      // Slight texture
      ctx.fillStyle = '#e8e8e0';
      [10, 18, 26].forEach(yy => ctx.fillRect(x + 6, y + yy, 28, 1));
    }
  },

  // PALETTE (40x32)
  palette(ctx, x, y, opts = {}, time = 0) {
    const used = opts.used === 'used';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 30, 18, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Wooden palette
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 18, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 17, 17, 11, 0, 0, Math.PI * 2); ctx.fill();
    // Thumb hole
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(x + 32, y + 18, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Paint blobs
    const blobs = used
      ? [['#FF1D6C', 8, 14, 4], ['#F5A623', 14, 18, 3], ['#9C27B0', 20, 14, 4], ['#2979FF', 26, 18, 3], ['#fff', 12, 22, 3], ['#3acc3a', 22, 22, 3]]
      : [['#FF1D6C', 8, 14, 3], ['#F5A623', 14, 14, 3], ['#9C27B0', 20, 14, 3], ['#2979FF', 26, 14, 3], ['#fff', 11, 22, 3], ['#3acc3a', 17, 22, 3], ['#1a1a1a', 23, 22, 3]];
    blobs.forEach(([c, dx, dy, r]) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + dx - r + 1, y + dy - r + 1, 1, 1);
    });
    if (used) {
      // Smears
      ctx.fillStyle = 'rgba(156,39,176,0.4)';
      ctx.fillRect(x + 18, y + 18, 6, 1);
      ctx.fillStyle = 'rgba(255,29,108,0.4)';
      ctx.fillRect(x + 10, y + 16, 5, 1);
    }
  },

  // EASEL (44x68)
  easel(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 66, 36, 2);
    // Tripod legs
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 6, y + 14, 3, 52);
    ctx.fillRect(x + 35, y + 14, 3, 52);
    ctx.fillRect(x + 21, y + 14, 2, 52);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 7, y + 16, 1, 50);
    ctx.fillRect(x + 36, y + 16, 1, 50);
    // Crossbeam
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 6, y + 38, 32, 3);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 6, y + 38, 32, 1);
    // Canvas on easel
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 8, y + 4, 28, 36);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 9, y + 5, 26, 34);
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(x + 11, y + 7, 22, 30);
    // In-progress painting
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 20, y + 18, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 26, y + 22, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 13, y + 26);
    ctx.bezierCurveTo(x + 18, y + 30, x + 24, y + 24, x + 31, y + 28);
    ctx.stroke();
    // Brush on tray
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 14, y + 36, 14, 1);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 12, y + 36, 2, 1);
  },

  // SCULPTURE (32x52)
  sculpture(ctx, x, y, opts = {}, time = 0) {
    const m = opts.material || 'marble';
    const c = m === 'marble'  ? ['#fff', '#e8e8e8', '#a0a0a8']
            : m === 'bronze'  ? ['#a85a26', '#7a3a18', '#daa86a']
                              : ['#a67c3d', '#7a5028', '#daa86a'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 28, 2);
    // Base / pedestal
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 4, y + 44, 24, 6);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 5, y + 45, 22, 4);
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 5, y + 47, 22, 2);
    // Bust silhouette
    // Shoulders
    ctx.fillStyle = c[1];
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 44); ctx.lineTo(x + 8, y + 32);
    ctx.lineTo(x + 24, y + 32); ctx.lineTo(x + 26, y + 44);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c[0];
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 43); ctx.lineTo(x + 9, y + 33);
    ctx.lineTo(x + 23, y + 33); ctx.lineTo(x + 25, y + 43);
    ctx.closePath(); ctx.fill();
    // Neck
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 14, y + 26, 4, 8);
    // Head
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 12, y + 16, 8, 12);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 12, y + 16, 8, 10);
    // Hair / curl details
    ctx.fillStyle = c[1];
    [12, 14, 18, 20].forEach(dx => ctx.fillRect(x + dx, y + 14, 2, 2));
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 12, y + 14, 8, 1);
    // Eyes (closed / blank)
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 13, y + 19, 2, 1);
    ctx.fillRect(x + 17, y + 19, 2, 1);
    // Subtle shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 16, y + 16, 4, 12);
    // Material accent — bronze patina or marble veins
    if (m === 'bronze') {
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 11, y + 28, 1, 2);
      ctx.fillRect(x + 22, y + 30, 1, 2);
    } else if (m === 'marble') {
      ctx.strokeStyle = '#a0a0a8';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 18); ctx.bezierCurveTo(x + 16, y + 22, x + 18, y + 24, x + 20, y + 26);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#5a3a1a';
      [13, 17, 21].forEach(dy => ctx.fillRect(x + 8, y + 32 + dy, 16, 1));
    }
  },

  // CHARCOAL STICK (28x16)
  charcoal(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 14, 24, 2);
    // Stick
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 6, 24, 6);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 2, y + 6, 24, 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 2, y + 11, 24, 1);
    // Tips broken
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 1, y + 7, 1, 4);
    ctx.fillRect(x + 26, y + 7, 1, 4);
    // Smudge
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x + 8, y + 4, 12, 2);
    ctx.fillRect(x + 6, y + 12, 16, 2);
    // Highlight
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 4, y + 7, 6, 1);
  },

  // PAINT TUBE (40x16)
  paintTube(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    // Tube body (squeezed)
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 4, y + 12);
    ctx.lineTo(x + 30, y + 14); ctx.lineTo(x + 30, y + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d4';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 7); ctx.lineTo(x + 5, y + 11);
    ctx.lineTo(x + 29, y + 13); ctx.lineTo(x + 29, y + 5);
    ctx.closePath(); ctx.fill();
    // Crimped end
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x, y + 5, 4, 8);
    [0, 2].forEach(dx => {
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + dx, y + 5, 1, 8);
    });
    // Label
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 8, y + 7, 18, 4);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 9, y + 8, 16, 2);
    // Cap + nozzle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 30, y + 4, 6, 10);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 31, y + 5, 4, 8);
    // Paint coming out
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 36, y + 7, 3, 4);
    ctx.fillRect(x + 38, y + 9, 2, 4);
  },

  // BRUSH SET (44x32)
  brushSet(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 40, 2);
    // Holder
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 2, y + 22, 40, 8);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 3, y + 23, 38, 6);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 3, y + 27, 38, 1);
    // Brushes
    const brushes = [
      { x: 6, color: '#FF1D6C', tip: 'thick', paint: '#FF1D6C' },
      { x: 12, color: '#F5A623', tip: 'thin', paint: '#F5A623' },
      { x: 18, color: '#9C27B0', tip: 'flat', paint: null },
      { x: 24, color: '#2979FF', tip: 'thin', paint: '#2979FF' },
      { x: 30, color: '#3acc3a', tip: 'thick', paint: null },
      { x: 36, color: '#1a1a1a', tip: 'fan', paint: '#1a1a1a' }
    ];
    brushes.forEach(b => {
      // Handle
      ctx.fillStyle = b.color;
      ctx.fillRect(x + b.x, y + 8, 3, 14);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + b.x + 2, y + 8, 1, 14);
      // Ferrule
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + b.x, y + 6, 3, 3);
      // Bristles
      ctx.fillStyle = b.paint || '#daa86a';
      if (b.tip === 'thick') {
        ctx.fillRect(x + b.x - 1, y + 1, 5, 5);
      } else if (b.tip === 'thin') {
        ctx.fillRect(x + b.x + 1, y, 1, 6);
      } else if (b.tip === 'flat') {
        ctx.fillRect(x + b.x - 1, y + 2, 5, 4);
      } else if (b.tip === 'fan') {
        ctx.fillRect(x + b.x - 2, y + 3, 7, 3);
        [b.x - 1, b.x + 1, b.x + 3].forEach(dx => ctx.fillRect(x + dx, y, 1, 3));
      }
    });
  },

  // FRAME (60x60) — for hanging
  frame(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const style = opts.style || 'ornate';
    if (style === 'ornate') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 60, 60);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 2, y + 2, 56, 56);
      // Carved details
      ctx.fillStyle = c.light;
      [0, 12, 24, 36, 48].forEach(dx => {
        ctx.fillRect(x + dx, y, 2, 2);
        ctx.fillRect(x + dx, y + 58, 2, 2);
      });
      [0, 12, 24, 36, 48].forEach(dy => {
        ctx.fillRect(x, y + dy, 2, 2);
        ctx.fillRect(x + 58, y + dy, 2, 2);
      });
      // Inner lip
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 8, 44, 44);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 10, y + 10, 40, 40);
    } else if (style === 'modern') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 60, 60);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 1, 58, 58);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 1, 58, 1);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 4, y + 4, 52, 52);
    } else if (style === 'vintage') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 60, 60);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 3, 54, 54);
      // Filigree corners
      ctx.fillStyle = c.light;
      [[0, 0], [54, 0], [0, 54], [54, 54]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx, y + dy, 6, 6);
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + dx + 2, y + dy + 2, 2, 2);
        ctx.fillStyle = c.light;
      });
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 6, y + 6, 48, 48);
    } else if (style === 'rustic') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 60, 60);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 2, y + 2, 56, 56);
      // Wood grain
      ctx.fillStyle = c.dark;
      [4, 8, 12, 50, 54].forEach(dy => ctx.fillRect(x + 2, y + dy, 56, 1));
      [4, 8, 50, 54].forEach(dx => ctx.fillRect(x + dx, y + 2, 1, 56));
      // Knot holes
      ctx.fillStyle = '#3a2510';
      ctx.beginPath(); ctx.arc(x + 10, y + 50, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 50, y + 10, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 6, y + 6, 48, 48);
    }
    // Picture inside frame (simple landscape)
    if (style === 'ornate' || style === 'modern' || style === 'vintage' || style === 'rustic') {
      const innerX = style === 'ornate' ? x + 10 : style === 'modern' ? x + 4 : style === 'vintage' ? x + 6 : x + 6;
      const innerY = style === 'ornate' ? y + 10 : style === 'modern' ? y + 4 : style === 'vintage' ? y + 6 : y + 6;
      const innerW = style === 'ornate' ? 40 : style === 'modern' ? 52 : 48;
      const innerH = style === 'ornate' ? 40 : style === 'modern' ? 52 : 48;
      const grd = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
      grd.addColorStop(0, '#5a9fff'); grd.addColorStop(0.5, '#FF5A90'); grd.addColorStop(1, '#3acc3a');
      ctx.fillStyle = grd;
      ctx.fillRect(innerX, innerY, innerW, innerH);
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(innerX + innerW / 2, innerY + innerH / 3, innerW / 8, 0, Math.PI * 2); ctx.fill();
    }
  },

  // SKETCHBOOK (40x36)
  sketchbook(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Cover
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 2, 36, 32);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 3, y + 3, 34, 30);
    // Spiral binding
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 2, 4, 32);
    [4, 10, 16, 22, 28].forEach(dy => {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(x + 2, y + 4 + dy, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    // Title label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 6, 24, 6);
    ctx.fillStyle = '#1a1a1a';
    [10, 14, 18, 22, 26].forEach(dx => ctx.fillRect(x + dx, y + 8, 2, 2));
    // Doodle on cover
    ctx.strokeStyle = '#FF1D6C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 18);
    ctx.bezierCurveTo(x + 14, y + 22, x + 22, y + 16, x + 30, y + 22);
    ctx.stroke();
    ctx.strokeStyle = '#F5A623';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 24);
    ctx.bezierCurveTo(x + 18, y + 28, x + 24, y + 24, x + 30, y + 28);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    [[14, 20], [22, 18], [28, 24]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
    // Pencil sticking out
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 36, y + 14, 6, 2);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 42, y + 14, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 44, y + 14, 1, 2);
  }
};

if (typeof module !== 'undefined') module.exports = ART;
