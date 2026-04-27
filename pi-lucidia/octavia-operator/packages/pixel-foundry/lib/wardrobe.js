// PIXEL FOUNDRY — WARDROBE (with axes)
// hat, shirt, pants, shoes, glasses, bag, scarf

const WARDROBE = {
  AXES: {
    hat:     { style: ['cap','beanie','sunhat','wizard','cowboy'], color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    shirt:   { style: ['tee','hoodie','tank','dress'],             color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    pants:   { style: ['jeans','shorts','skirt'],                  color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    shoes:   { style: ['sneaker','boot','sandal','heel'],          color: ['pink','amber','violet','blue','white','black'] },
    glasses: { style: ['round','square','aviator','cat'],          color: ['amber','violet','blue','black'] },
    bag:     { style: ['tote','backpack','clutch'],                color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    scarf:   { style: ['plain','striped','knit'],                  color: ['pink','amber','violet','blue','white','black'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    stone:  { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' }
  },

  // HAT (32x24)
  hat(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const s = opts.style || 'cap';
    if (s === 'cap') {
      // Crown
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 6, 16, 12);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 7, 14, 10);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 9, y + 7, 14, 2);
      // Brim
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 16, 22, 3);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 16, 22, 1);
      // Logo
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 14, y + 10, 4, 4);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 15, y + 11, 2, 2);
    } else if (s === 'beanie') {
      // Pom
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 16, y + 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8e8e8';
      ctx.beginPath(); ctx.arc(x + 16, y + 4, 2, 0, Math.PI * 2); ctx.fill();
      // Body
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 6, 20, 14);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 7, y + 7, 18, 12);
      // Knit stripes
      ctx.fillStyle = c.dark;
      [10, 13, 16].forEach(yy => ctx.fillRect(x + 7, y + yy, 18, 1));
      // Cuff
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 18, 20, 3);
    } else if (s === 'sunhat') {
      // Wide brim
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 17, 15, 3, 0, 0, Math.PI * 2); ctx.fill();
      // Crown
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 12, 8, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 12, 7, 7, 0, 0, Math.PI * 2); ctx.fill();
      // Ribbon
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 16, 16, 2);
    } else if (s === 'wizard') {
      // Tall cone
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 16, y - 2);
      ctx.lineTo(x + 26, y + 18);
      ctx.lineTo(x + 6, y + 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 16, y);
      ctx.lineTo(x + 24, y + 17);
      ctx.lineTo(x + 8, y + 17);
      ctx.closePath(); ctx.fill();
      // Brim
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 18, 28, 3);
      // Stars
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 14, y + 8, 2, 2);
      ctx.fillRect(x + 12, y + 14, 2, 2);
      ctx.fillRect(x + 18, y + 12, 2, 2);
    } else if (s === 'cowboy') {
      // Wide brim
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 17, 13, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 4, y + 15, 24, 1);
      // Crown — pinched
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 9, y + 4, 14, 12);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 10, y + 5, 12, 10);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 6, 4, 8);
      // Band
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 9, y + 13, 14, 2);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 18, y + 13, 2, 2);
    }
  },

  // SHIRT (32x36)
  shirt(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const s = opts.style || 'tee';
    if (s === 'tee') {
      // Sleeves
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 4, 6, 12);
      ctx.fillRect(x + 24, y + 4, 6, 12);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 5, 4, 10);
      ctx.fillRect(x + 25, y + 5, 4, 10);
      // Body
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 4, 20, 30);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 7, y + 5, 18, 28);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 7, y + 5, 18, 1);
      // Neckline
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 13, y + 4, 6, 2);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 13, y + 6, 6, 1);
    } else if (s === 'hoodie') {
      // Hood
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + 8, y); ctx.lineTo(x + 24, y); ctx.lineTo(x + 24, y + 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 1, 14, 7);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 4, 4, 4);
      // Body + sleeves
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 8, 32, 26);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 9, 30, 24);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 9, 30, 1);
      // Pocket
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 18, 16, 8);
      ctx.fillRect(x + 16, y + 19, 1, 7);
      // Strings
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 13, y + 8, 1, 8);
      ctx.fillRect(x + 18, y + 8, 1, 8);
    } else if (s === 'tank') {
      // Body only
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 2, 20, 32);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 7, y + 3, 18, 30);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 7, y + 3, 18, 1);
      // Neck/arm cutouts
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 11, y + 2, 10, 3);
      ctx.fillRect(x + 5, y + 4, 4, 8);
      ctx.fillRect(x + 23, y + 4, 4, 8);
    } else if (s === 'dress') {
      // Bodice
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 2, 20, 14);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 7, y + 3, 18, 12);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 7, y + 3, 18, 1);
      // Skirt — flared
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 14); ctx.lineTo(x + 26, y + 14);
      ctx.lineTo(x + 30, y + 34); ctx.lineTo(x + 2, y + 34);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 15); ctx.lineTo(x + 25, y + 15);
      ctx.lineTo(x + 29, y + 33); ctx.lineTo(x + 3, y + 33);
      ctx.closePath(); ctx.fill();
      // Pleats
      ctx.fillStyle = c.dark;
      [10, 16, 22].forEach(px => ctx.fillRect(x + px, y + 16, 1, 17));
    }
  },

  // PANTS (24x36)
  pants(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'blue'];
    const s = opts.style || 'jeans';
    if (s === 'jeans') {
      // Waist
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y, 20, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 1, 18, 2);
      // Legs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 4, 8, 32);
      ctx.fillRect(x + 14, y + 4, 8, 32);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 4, 6, 31);
      ctx.fillRect(x + 15, y + 4, 6, 31);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 4, 6, 1);
      ctx.fillRect(x + 15, y + 4, 6, 1);
      // Belt
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 2, y + 4, 20, 1);
      // Pockets
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 8, 4, 6);
      ctx.fillRect(x + 16, y + 8, 4, 6);
      // Button
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 11, y + 2, 2, 2);
    } else if (s === 'shorts') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y, 20, 4);
      ctx.fillRect(x + 2, y + 4, 8, 16);
      ctx.fillRect(x + 14, y + 4, 8, 16);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 4, 6, 15);
      ctx.fillRect(x + 15, y + 4, 6, 15);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 4, 6, 1);
      ctx.fillRect(x + 15, y + 4, 6, 1);
      // Belt
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 2, y + 4, 20, 1);
      // Cuffs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 18, 8, 2);
      ctx.fillRect(x + 14, y + 18, 8, 2);
    } else if (s === 'skirt') {
      // Waist
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y, 20, 4);
      // Flared
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 4); ctx.lineTo(x + 22, y + 4);
      ctx.lineTo(x + 26, y + 24); ctx.lineTo(x - 2, y + 24);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 5); ctx.lineTo(x + 21, y + 5);
      ctx.lineTo(x + 25, y + 23); ctx.lineTo(x - 1, y + 23);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 5, 18, 1);
      // Pleats
      ctx.fillStyle = c.dark;
      [6, 12, 18].forEach(px => ctx.fillRect(x + px, y + 6, 1, 17));
    }
  },

  // SHOES (32x16) — pair side by side
  shoes(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const s = opts.style || 'sneaker';
    const drawOne = (sx) => {
      if (s === 'sneaker') {
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx, y + 6, 14, 8);
        ctx.fillStyle = c.main;
        ctx.fillRect(sx + 1, y + 7, 12, 6);
        ctx.fillStyle = c.light;
        ctx.fillRect(sx + 1, y + 7, 12, 1);
        // Sole
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx, y + 12, 14, 2);
        // Laces
        ctx.fillStyle = '#fff';
        [3, 6, 9].forEach(dy => ctx.fillRect(sx + 4, y + 7 + dy / 3, 6, 1));
        // Swoosh
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx + 5, y + 9, 5, 1);
      } else if (s === 'boot') {
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx, y, 12, 14);
        ctx.fillStyle = c.main;
        ctx.fillRect(sx + 1, y + 1, 10, 13);
        ctx.fillStyle = c.light;
        ctx.fillRect(sx + 1, y + 1, 10, 1);
        // Heel
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(sx, y + 12, 14, 2);
        // Laces
        ctx.fillStyle = '#fff';
        [4, 7, 10].forEach(dy => {
          ctx.fillRect(sx + 3, y + dy, 6, 1);
        });
      } else if (s === 'sandal') {
        // Foot (skin)
        ctx.fillStyle = '#e6c8a8';
        ctx.fillRect(sx, y + 8, 14, 6);
        // Straps
        ctx.fillStyle = c.main;
        ctx.fillRect(sx + 2, y + 8, 10, 2);
        ctx.fillRect(sx + 4, y + 6, 6, 2);
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx + 6, y + 8, 2, 2);
        // Sole
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx, y + 13, 14, 1);
      } else if (s === 'heel') {
        ctx.fillStyle = c.dark;
        // Toe box
        ctx.beginPath();
        ctx.moveTo(sx + 12, y + 14);
        ctx.lineTo(sx + 14, y + 6);
        ctx.lineTo(sx + 4, y + 8);
        ctx.lineTo(sx, y + 14);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.main;
        ctx.beginPath();
        ctx.moveTo(sx + 11, y + 13);
        ctx.lineTo(sx + 13, y + 7);
        ctx.lineTo(sx + 5, y + 9);
        ctx.lineTo(sx + 1, y + 13);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.light;
        ctx.fillRect(sx + 6, y + 9, 6, 1);
        // Heel spike
        ctx.fillStyle = c.dark;
        ctx.fillRect(sx + 12, y + 14, 2, 2);
      }
    };
    drawOne(x + 1);
    drawOne(x + 17);
  },

  // GLASSES (28x12)
  glasses(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    const s = opts.style || 'round';
    ctx.fillStyle = c.main;
    if (s === 'round') {
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.main;
      ctx.beginPath(); ctx.arc(x + 7, y + 6, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 21, y + 6, 5, 0, Math.PI * 2); ctx.stroke();
      // Bridge
      ctx.fillRect(x + 11, y + 6, 6, 1);
      ctx.lineWidth = 1;
      // Lenses
      ctx.fillStyle = 'rgba(122,200,234,0.3)';
      ctx.beginPath(); ctx.arc(x + 7, y + 6, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 21, y + 6, 4, 0, Math.PI * 2); ctx.fill();
    } else if (s === 'square') {
      ctx.fillRect(x + 1, y + 2, 12, 8);
      ctx.fillRect(x + 15, y + 2, 12, 8);
      ctx.fillStyle = 'rgba(122,200,234,0.3)';
      ctx.fillRect(x + 2, y + 3, 10, 6);
      ctx.fillRect(x + 16, y + 3, 10, 6);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 13, y + 5, 2, 2);
    } else if (s === 'aviator') {
      // Teardrop shape
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 7, y + 6, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 21, y + 6, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Lenses
      ctx.fillStyle = 'rgba(245,166,35,0.4)';
      ctx.beginPath(); ctx.ellipse(x + 7, y + 6, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 21, y + 6, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 11, y + 5, 6, 1);
    } else if (s === 'cat') {
      // Pointed corners
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x, y + 4); ctx.lineTo(x + 14, y + 4);
      ctx.lineTo(x + 13, y + 10); ctx.lineTo(x + 1, y + 10);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 4); ctx.lineTo(x + 28, y + 4);
      ctx.lineTo(x + 27, y + 10); ctx.lineTo(x + 15, y + 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,40,140,0.4)';
      ctx.fillRect(x + 1, y + 5, 12, 4);
      ctx.fillRect(x + 15, y + 5, 12, 4);
    }
  },

  // BAG (32x40)
  bag(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const s = opts.style || 'tote';
    if (s === 'tote') {
      // Handles
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + 11, y + 8, 5, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 21, y + 8, 5, Math.PI, 0); ctx.stroke();
      // Body
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 12, 24, 26);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 13, 22, 24);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 5, y + 13, 22, 1);
      // Stitching
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 5, y + 16, 22, 1);
      // Logo / accent
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 12, y + 22, 8, 6);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 24, 4, 2);
      ctx.lineWidth = 1;
    } else if (s === 'backpack') {
      // Straps
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 4, 22);
      ctx.fillRect(x + 24, y + 4, 4, 22);
      // Body
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 6, 28, 32);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 7, 26, 30);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 7, 26, 1);
      // Top flap
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 6, 28, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 7, 26, 6);
      // Buckle
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 14, y + 12, 4, 4);
      // Front pocket
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 22, 16, 12);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 23, 14, 10);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 9, y + 23, 14, 1);
    } else if (s === 'clutch') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 16, 28, 16);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 17, 26, 14);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 17, 26, 1);
      // Flap
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 16); ctx.lineTo(x + 30, y + 16);
      ctx.lineTo(x + 16, y + 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + 28, y + 16);
      ctx.lineTo(x + 16, y + 24); ctx.closePath(); ctx.fill();
      // Clasp
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 14, y + 22, 4, 2);
    }
  },

  // SCARF (40x16)
  scarf(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const s = opts.style || 'plain';
    const sway = Math.sin(time / 30) * 1;
    // Wrapped section
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 2, 32, 6);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 4, y + 3, 32, 4);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 4, y + 3, 32, 1);
    // Hanging tails
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 6 + sway, y + 8, 4, 8);
    ctx.fillRect(x + 14 - sway, y + 8, 4, 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 7 + sway, y + 9, 2, 6);
    ctx.fillRect(x + 15 - sway, y + 9, 2, 6);
    // Pattern
    if (s === 'striped') {
      ctx.fillStyle = c.dark;
      [5, 12, 19, 26, 33].forEach(sx => ctx.fillRect(x + sx, y + 3, 2, 4));
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 7 + sway, y + 11, 2, 1);
      ctx.fillRect(x + 15 - sway, y + 11, 2, 1);
    } else if (s === 'knit') {
      ctx.fillStyle = c.dark;
      for (let yy = 4; yy < 7; yy += 2) {
        for (let xx = 5; xx < 36; xx += 2) {
          ctx.fillRect(x + xx + ((yy / 2) & 1), y + yy, 1, 1);
        }
      }
    }
    // Fringe
    ctx.fillStyle = c.dark;
    [6, 8, 14, 16].forEach(sx => {
      ctx.fillRect(x + sx + (sx > 12 ? -sway : sway), y + 14, 1, 2);
    });
  }
};

if (typeof module !== 'undefined') module.exports = WARDROBE;
