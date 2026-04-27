// PIXEL FOUNDRY — INSTRUMENTS (with axes)
// guitar, piano, drumKit, microphone, violin, vinyl, headphones, synthesizer

const INSTRUMENTS = {
  AXES: {
    guitar:     { kind: ['acoustic','electric','bass'], color: ['pink','amber','violet','blue','black','wood','white'] },
    microphone: { color: ['pink','amber','violet','blue','black','white'], stand: ['stand','handheld'] },
    vinyl:      { color: ['pink','amber','violet','blue','black','white'] },
    headphones: { color: ['pink','amber','violet','blue','black','white'] },
    synth:      { color: ['black','white','wood','pink','amber'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' }
  },

  // GUITAR (32x68)
  guitar(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const kind = opts.kind || 'acoustic';
    // Body shape
    if (kind === 'electric') {
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 38); ctx.lineTo(x + 4, y + 56);
      ctx.quadraticCurveTo(x + 4, y + 64, x + 12, y + 64);
      ctx.lineTo(x + 26, y + 64); ctx.lineTo(x + 28, y + 50);
      ctx.quadraticCurveTo(x + 28, y + 38, x + 20, y + 38);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 40); ctx.lineTo(x + 6, y + 54);
      ctx.quadraticCurveTo(x + 6, y + 62, x + 13, y + 62);
      ctx.lineTo(x + 25, y + 62); ctx.lineTo(x + 26, y + 50);
      ctx.quadraticCurveTo(x + 26, y + 40, x + 19, y + 40);
      ctx.closePath(); ctx.fill();
      // Pickups
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 10, y + 46, 12, 3);
      ctx.fillRect(x + 10, y + 52, 12, 3);
      ctx.fillStyle = '#a0a0a8';
      [11, 14, 17, 20].forEach(px => {
        ctx.fillRect(x + px, y + 47, 1, 1);
        ctx.fillRect(x + px, y + 53, 1, 1);
      });
      // Knobs
      ctx.fillStyle = '#1a1a1a';
      [12, 18].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 58, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    } else {
      // Acoustic / bass — figure 8
      const bw = kind === 'bass' ? 26 : 24;
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 40, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 56, bw / 2, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 40, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 56, bw / 2 - 1, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sound hole
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(x + 16, y + 48, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c.dark;
      ctx.beginPath(); ctx.arc(x + 16, y + 48, 5, 0, Math.PI * 2); ctx.stroke();
      // Bridge
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 12, y + 56, 8, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 13, y + 57, 6, 1);
    }
    // Neck
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 14, y + 6, 4, 32);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 15, y + 6, 2, 32);
    // Frets
    ctx.fillStyle = '#a0a0a8';
    [10, 14, 18, 22, 26, 30, 34].forEach(yy => ctx.fillRect(x + 14, y + yy, 4, 1));
    // Headstock
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 12, y, 8, 8);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 13, y + 1, 6, 6);
    // Tuners
    ctx.fillStyle = '#a0a0a8';
    [2, 5].forEach(dy => {
      ctx.fillRect(x + 11, y + dy, 2, 1);
      ctx.fillRect(x + 19, y + dy, 2, 1);
    });
    // Strings
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 15, y + 6, 1, 50);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 16, y + 6, 1, 50);
  },

  // PIANO (88x40)
  piano(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 84, 2);
    // Body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 88, 38);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 1, y + 1, 86, 36);
    // Top edge
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 88, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x, y, 88, 1);
    // Music stand
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 18, y + 4, 52, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 22, y + 6, 44, 4);
    ctx.fillStyle = '#1a1a1a';
    [25, 29, 33, 37, 41, 45].forEach(px => ctx.fillRect(x + px, y + 7, 2, 2));
    // White keys
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 14, 80, 22);
    // Key separators
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i <= 14; i++) {
      ctx.fillRect(x + 4 + i * 6 - 1, y + 14, 1, 22);
    }
    // Black keys (in groups of 2 and 3)
    const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13];
    blackKeys.forEach(idx => {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(x + 4 + idx * 6 - 2, y + 14, 4, 12);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 4 + idx * 6 - 2, y + 14, 4, 1);
    });
    // Pedals
    ctx.fillStyle = '#a0a0a8';
    [40, 44, 48].forEach(px => ctx.fillRect(x + px, y + 36, 3, 4));
  },

  // DRUM KIT (60x52)
  drumKit(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 56, 2);
    // Bass drum (back)
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 30, y + 30, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 30, y + 30, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 30, y + 30, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a3a3e';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + 30, y + 30, 10, 0, Math.PI * 2); ctx.stroke();
    // Tom toms
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 12, y + 16, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 12, y + 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 30, y + 12, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 30, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    // Snare
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath(); ctx.arc(x + 48, y + 22, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 48, y + 22, 5, 0, Math.PI * 2); ctx.fill();
    // Cymbals
    const wobble = Math.sin(time / 8) * 0.5;
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.ellipse(x + 6, y + 4 + wobble, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe080';
    ctx.beginPath(); ctx.ellipse(x + 6, y + 4 + wobble, 7, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 5, y + 4, 2, 14);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.ellipse(x + 54, y + 6 - wobble, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe080';
    ctx.beginPath(); ctx.ellipse(x + 54, y + 6 - wobble, 7, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 53, y + 6, 2, 14);
    // Drumsticks
    ctx.strokeStyle = '#daa86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 38, y + 44); ctx.lineTo(x + 56, y + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 44); ctx.lineTo(x + 4, y + 30);
    ctx.stroke();
    ctx.lineWidth = 1;
  },

  // MICROPHONE (28x52)
  microphone(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const handheld = opts.stand === 'handheld';
    if (!handheld) {
      // Stand
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 12, y + 16, 4, 32);
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 8, y + 46, 12, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 6, y + 50, 16, 2);
      // Boom arm
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 14, y + 16, 6, 2);
    }
    // Mic head
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 8, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 8, y + 8, 12, 14);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y + 18, 12, 4);
    // Grille (mesh)
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath(); ctx.arc(x + 14, y + 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    for (let yy = 4; yy < 12; yy += 2) {
      for (let xx = 9; xx < 19; xx += 2) {
        ctx.fillRect(x + xx, y + yy, 1, 1);
      }
    }
    // Highlight
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 9, y + 9, 3, 8);
    // Cable (handheld)
    if (handheld) {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 22);
      for (let yy = 22; yy < 50; yy += 3) {
        ctx.lineTo(x + 14 + Math.sin(yy / 4) * 4, y + yy);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  },

  // VIOLIN (28x60)
  violin(ctx, x, y, time = 0) {
    // Body
    ctx.fillStyle = '#7a3a1a';
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 24); ctx.lineTo(x + 6, y + 30);
    ctx.lineTo(x + 4, y + 42); ctx.lineTo(x + 6, y + 54);
    ctx.lineTo(x + 14, y + 58); ctx.lineTo(x + 22, y + 54);
    ctx.lineTo(x + 24, y + 42); ctx.lineTo(x + 22, y + 30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a85a26';
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 26); ctx.lineTo(x + 8, y + 31);
    ctx.lineTo(x + 6, y + 42); ctx.lineTo(x + 8, y + 53);
    ctx.lineTo(x + 14, y + 56); ctx.lineTo(x + 20, y + 53);
    ctx.lineTo(x + 22, y + 42); ctx.lineTo(x + 20, y + 31);
    ctx.closePath(); ctx.fill();
    // Highlights
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 9, y + 32, 3, 14);
    // F-holes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 9, y + 38, 1, 8);
    ctx.fillRect(x + 18, y + 38, 1, 8);
    // Bridge
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 11, y + 42, 6, 2);
    // Neck + fingerboard
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 12, y + 8, 4, 18);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 13, y + 8, 2, 18);
    // Scroll
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath(); ctx.arc(x + 14, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5028';
    ctx.beginPath(); ctx.arc(x + 14, y + 5, 2, 0, Math.PI * 2); ctx.fill();
    // Strings
    ctx.fillStyle = '#e8e8e8';
    [12, 13, 15, 16].forEach(px => ctx.fillRect(x + px, y + 8, 1, 36));
    // Bow
    ctx.strokeStyle = '#daa86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 30); ctx.lineTo(x + 28, y + 50);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 31); ctx.lineTo(x + 27, y + 49);
    ctx.stroke();
  },

  // VINYL RECORD (40x40)
  vinyl(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    const cx = x + 20, cy = y + 20;
    const spin = time / 8;
    // Disc
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2); ctx.fill();
    // Grooves
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 0.5;
    [16, 14, 12, 10].forEach(r => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.lineWidth = 1;
    // Highlight (rotating)
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.fillRect(-2, -16, 4, 12);
    ctx.restore();
    // Label
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.fillRect(-4, -1, 8, 2);
    ctx.restore();
    // Center hole
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath(); ctx.arc(cx, cy, 1, 0, Math.PI * 2); ctx.fill();
  },

  // HEADPHONES (44x44)
  headphones(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    // Headband arc
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x + 22, y + 22, 16, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = c.main;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 22, y + 22, 16, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Ear cups
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(x + 6, y + 26, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 38, y + 26, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.arc(x + 6, y + 26, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 38, y + 26, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 22, 4, 1);
    ctx.fillRect(x + 35, y + 22, 4, 1);
    // Inner cushions
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 6, y + 26, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 38, y + 26, 4, 0, Math.PI * 2); ctx.fill();
    // Brand dot
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 25, 2, 2);
    ctx.fillRect(x + 37, y + 25, 2, 2);
  },

  // SYNTHESIZER (72x32)
  synth(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 68, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 72, 30);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 1, 70, 28);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 1, y + 1, 70, 1);
    // Display
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 4, y + 4, 16, 6);
    ctx.fillStyle = Math.floor(time / 6) % 4 === 0 ? '#FF1D6C' : '#F5A623';
    ctx.fillRect(x + 5, y + 5, 14, 4);
    ctx.fillStyle = '#0a0a14';
    [8, 11, 14, 17].forEach(px => ctx.fillRect(x + px, y + 5, 1, 4));
    // Knobs row
    ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF', '#3acc3a', '#fff'].forEach((knob, i) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(x + 26 + i * 8, y + 7, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = knob;
      ctx.beginPath(); ctx.arc(x + 26 + i * 8, y + 7, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      const ang = (i / 6 + time / 120) * Math.PI * 2;
      ctx.fillRect(x + 26 + i * 8 + Math.cos(ang) * 1, y + 7 + Math.sin(ang) * 1, 1, 1);
    });
    // Mini keys
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 16, 64, 12);
    ctx.fillStyle = '#1a1a1a';
    for (let i = 1; i < 16; i++) ctx.fillRect(x + 4 + i * 4, y + 16, 1, 12);
    // Black keys
    [1, 2, 4, 5, 6, 8, 9, 11, 12, 13].forEach(idx => {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(x + 4 + idx * 4 - 1, y + 16, 2, 7);
    });
    // Pitch wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 64, y + 4, 6, 10);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 64, y + 4 + Math.sin(time / 12) * 2 + 4, 6, 2);
  }
};

if (typeof module !== 'undefined') module.exports = INSTRUMENTS;
