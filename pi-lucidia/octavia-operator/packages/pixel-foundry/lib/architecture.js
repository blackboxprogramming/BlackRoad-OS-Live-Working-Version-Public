// PIXEL FOUNDRY — ARCHITECTURE
// Floors, walls, doors, windows, roofs, paths — all options-object pattern
// Each base fn: (ctx, x, y, opts, time) => void. Opts has axes the variant explorer iterates.

const ARCHITECTURE = {
  AXES: {
    floor:  { pattern: ['plain','checker','herringbone','parquet','tile','marble'], color: ['wood','stone','pink','amber','violet','blue','white','black'] },
    wall:   { material: ['drywall','brick','wood','stone','panel','glass'], color: ['white','wood','stone','pink','amber','violet','blue','black'] },
    door:   { style: ['panel','sliding','double','arch'], color: ['wood','pink','amber','violet','blue','white','black'], state: ['closed','open'] },
    window: { style: ['rect','arch','circle','grid','bay'], time: ['day','dusk','night'] },
    roof:   { pitch: ['flat','gable','hip','shed'], material: ['shingle','tile','metal','thatch'], color: ['pink','amber','violet','blue','black','stone'] },
    path:   { surface: ['stone','wood','brick','dirt','tile'], pattern: ['straight','curve','cross'] }
  },

  _palette: {
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a', edge: '#7a5a28' },
    stone:  { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8', edge: '#3a3a3e' },
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90', edge: '#5a0a28' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b', edge: '#5a3a0a' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6', edge: '#3a0a4a' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff', edge: '#0a1f5a' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff', edge: '#888' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a', edge: '#000' }
  },

  // FLOOR (64x64 base)
  floor(ctx, x, y, opts = {}, time = 0) {
    const pattern = opts.pattern || 'plain';
    const c = this._palette[opts.color || 'wood'];
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 64, 64);
    if (pattern === 'plain') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 1, 62, 62);
      ctx.fillStyle = c.light;
      for (let i = 4; i < 64; i += 8) ctx.fillRect(x + i, y + 1, 1, 62);
    } else if (pattern === 'checker') {
      for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
        ctx.fillStyle = ((xx + yy) / 16) & 1 ? c.main : c.light;
        ctx.fillRect(x + xx + 1, y + yy + 1, 14, 14);
      }
    } else if (pattern === 'herringbone') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 1, 62, 62);
      ctx.fillStyle = c.dark;
      for (let yy = 0; yy < 64; yy += 8) for (let xx = (yy % 16 === 0) ? 0 : 4; xx < 64; xx += 8) {
        ctx.fillRect(x + xx, y + yy, 4, 1);
        ctx.fillRect(x + xx + 3, y + yy, 1, 4);
      }
    } else if (pattern === 'parquet') {
      for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
        const horiz = ((xx + yy) / 16) & 1;
        for (let i = 0; i < 16; i += 4) {
          ctx.fillStyle = i & 4 ? c.main : c.light;
          if (horiz) ctx.fillRect(x + xx, y + yy + i, 16, 3);
          else       ctx.fillRect(x + xx + i, y + yy, 3, 16);
        }
      }
    } else if (pattern === 'tile') {
      for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
        ctx.fillStyle = c.main;
        ctx.fillRect(x + xx + 1, y + yy + 1, 14, 14);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + xx + 1, y + yy + 1, 14, 1);
        ctx.fillStyle = c.edge;
        ctx.fillRect(x + xx + 1, y + yy + 14, 14, 1);
      }
    } else if (pattern === 'marble') {
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 1, 62, 62);
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (i * 11) % 64, y);
        ctx.bezierCurveTo(x + 20 + i * 5, y + 22, x + 40 - i * 4, y + 40, x + (i * 13) % 64, y + 64);
        ctx.stroke();
      }
    }
    // border
    ctx.strokeStyle = c.edge;
    ctx.strokeRect(x + 0.5, y + 0.5, 63, 63);
  },

  // WALL (96x72 base)
  wall(ctx, x, y, opts = {}, time = 0) {
    const material = opts.material || 'drywall';
    const c = this._palette[opts.color || 'white'];
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 96, 72);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 1, 94, 70);
    if (material === 'drywall') {
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 1, 94, 4);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 1, y + 67, 94, 4);
    } else if (material === 'brick') {
      ctx.fillStyle = c.dark;
      for (let yy = 0; yy < 72; yy += 8) {
        const offset = (yy / 8) & 1 ? 8 : 0;
        for (let xx = -offset; xx < 96; xx += 16) {
          ctx.fillRect(x + xx + 1, y + yy + 7, 14, 1);
          ctx.fillRect(x + xx + 14, y + yy, 1, 8);
        }
      }
      ctx.fillStyle = c.light;
      for (let yy = 0; yy < 72; yy += 8) {
        const offset = (yy / 8) & 1 ? 8 : 0;
        for (let xx = -offset; xx < 96; xx += 16) {
          ctx.fillRect(x + xx + 1, y + yy + 1, 2, 1);
        }
      }
    } else if (material === 'wood') {
      ctx.fillStyle = c.dark;
      for (let i = 0; i < 96; i += 12) ctx.fillRect(x + i, y + 1, 1, 70);
      ctx.fillStyle = c.light;
      for (let i = 4; i < 96; i += 12) ctx.fillRect(x + i, y + 8, 1, 4);
      for (let i = 8; i < 96; i += 12) ctx.fillRect(x + i, y + 40, 1, 6);
    } else if (material === 'stone') {
      ctx.fillStyle = c.dark;
      const stones = [[2,2,18,12],[22,2,16,14],[40,2,20,12],[62,2,14,14],[78,2,16,12],
                     [2,16,14,16],[18,18,22,14],[42,18,16,16],[60,16,18,16],[80,18,14,14],
                     [2,34,20,16],[24,34,18,14],[44,34,20,18],[66,34,16,14],[84,34,10,16],
                     [2,52,16,18],[20,50,18,20],[40,52,18,18],[60,50,18,20],[80,52,14,18]];
      stones.forEach(([sx, sy, sw, sh]) => {
        ctx.fillRect(x + sx, y + sy, sw, sh);
        ctx.fillStyle = c.main;
        ctx.fillRect(x + sx + 1, y + sy + 1, sw - 2, sh - 2);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + sx + 1, y + sy + 1, sw - 2, 1);
        ctx.fillStyle = c.dark;
      });
    } else if (material === 'panel') {
      ctx.fillStyle = c.dark;
      [12, 36, 60, 84].forEach(px => ctx.fillRect(x + px, y + 1, 1, 70));
      ctx.fillStyle = c.light;
      [13, 37, 61, 85].forEach(px => ctx.fillRect(x + px, y + 1, 1, 70));
    } else if (material === 'glass') {
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 1, y + 1, 94, 70);
      ctx.fillStyle = '#dceaf2';
      ctx.fillRect(x + 1, y + 1, 94, 12);
      ctx.fillStyle = c.dark;
      [24, 48, 72].forEach(px => ctx.fillRect(x + px, y + 1, 1, 70));
      [18, 36, 54].forEach(py => ctx.fillRect(x + 1, y + py, 94, 1));
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 4, y + 4, 12, 24);
    }
    // floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + 70, 96, 2);
  },

  // DOOR (44x72 base)
  door(ctx, x, y, opts = {}, time = 0) {
    const style = opts.style || 'panel';
    const c = this._palette[opts.color || 'wood'];
    const open = opts.state === 'open';
    // Frame
    ctx.fillStyle = c.edge;
    ctx.fillRect(x, y, 44, 72);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 2, 40, 68);
    if (open) {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(x + 4, y + 4, 36, 64);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 4, 8, 64);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 4, y + 4, 8, 2);
      return;
    }
    if (style === 'panel') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 4, 36, 64);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 8, 28, 24);
      ctx.fillRect(x + 8, y + 36, 28, 28);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 9, y + 9, 26, 1);
      ctx.fillRect(x + 9, y + 37, 26, 1);
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(x + 34, y + 38, 2, 4);
    } else if (style === 'sliding') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 4, 18, 64);
      ctx.fillRect(x + 22, y + 4, 18, 64);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 22, y + 4, 1, 64);
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 6, y + 10, 14, 50);
      ctx.fillRect(x + 24, y + 10, 14, 50);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 7, y + 12, 4, 30);
      ctx.fillRect(x + 25, y + 12, 4, 30);
    } else if (style === 'double') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 4, 18, 64);
      ctx.fillRect(x + 22, y + 4, 18, 64);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 12, 12, 18);
      ctx.fillRect(x + 24, y + 12, 12, 18);
      ctx.fillRect(x + 8, y + 36, 12, 24);
      ctx.fillRect(x + 24, y + 36, 12, 24);
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(x + 19, y + 38, 2, 4);
      ctx.fillRect(x + 23, y + 38, 2, 4);
    } else if (style === 'arch') {
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 72);
      ctx.lineTo(x + 4, y + 20);
      ctx.quadraticCurveTo(x + 22, y + 4, x + 40, y + 20);
      ctx.lineTo(x + 40, y + 72);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 30, 28, 30);
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(x + 34, y + 44, 2, 4);
    }
  },

  // WINDOW (60x52 base)
  window(ctx, x, y, opts = {}, time = 0) {
    const style = opts.style || 'rect';
    const tod = opts.time || 'day';
    const sky = tod === 'day'   ? ['#bcd2dc', '#dceaf2'] :
                tod === 'dusk'  ? ['#FF5A90', '#F5A623'] :
                                  ['#0a0a3a', '#1a1a5a'];
    // Frame
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x, y, 60, 52);
    ctx.fillStyle = '#7a5a28';
    ctx.fillRect(x + 1, y + 1, 58, 50);
    if (style === 'rect') {
      const grd = ctx.createLinearGradient(x, y, x, y + 52);
      grd.addColorStop(0, sky[1]); grd.addColorStop(1, sky[0]);
      ctx.fillStyle = grd;
      ctx.fillRect(x + 4, y + 4, 52, 44);
      // Mullions
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 29, y + 4, 2, 44);
      ctx.fillRect(x + 4, y + 24, 52, 2);
    } else if (style === 'arch') {
      ctx.fillStyle = sky[0];
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 48);
      ctx.lineTo(x + 4, y + 18);
      ctx.quadraticCurveTo(x + 30, y + 4, x + 56, y + 18);
      ctx.lineTo(x + 56, y + 48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 29, y + 4, 2, 44);
    } else if (style === 'circle') {
      ctx.fillStyle = sky[0];
      ctx.beginPath();
      ctx.arc(x + 30, y + 26, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 8, y + 25, 44, 2);
      ctx.fillRect(x + 29, y + 4, 2, 44);
    } else if (style === 'grid') {
      ctx.fillStyle = sky[0];
      ctx.fillRect(x + 4, y + 4, 52, 44);
      ctx.fillStyle = '#3a2510';
      [16, 30, 44].forEach(px => ctx.fillRect(x + px, y + 4, 2, 44));
      [16, 30].forEach(py => ctx.fillRect(x + 4, y + py, 52, 2));
    } else if (style === 'bay') {
      ctx.fillStyle = sky[0];
      ctx.fillRect(x + 4, y + 4, 14, 44);
      ctx.fillRect(x + 22, y + 8, 16, 40);
      ctx.fillRect(x + 42, y + 4, 14, 44);
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 18, y + 4, 4, 44);
      ctx.fillRect(x + 38, y + 4, 4, 44);
    }
    // Sill
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x - 2, y + 48, 64, 4);
    // Time-of-day glow
    if (tod === 'night') {
      ctx.fillStyle = 'rgba(245,166,35,0.18)';
      ctx.fillRect(x + 4, y + 4, 52, 44);
    } else if (tod === 'dusk') {
      ctx.fillStyle = 'rgba(255,29,108,0.15)';
      ctx.fillRect(x + 4, y + 4, 52, 44);
    }
  },

  // ROOF (96x44 base) — silhouette is clipped so material textures stay inside
  roof(ctx, x, y, opts = {}, time = 0) {
    const pitch = opts.pitch || 'gable';
    const material = opts.material || 'shingle';
    const c = this._palette[opts.color || 'amber'];

    // Silhouette path — used for both fill and clip
    const silhouette = () => {
      ctx.beginPath();
      if (pitch === 'flat') {
        ctx.rect(x - 4, y + 4, 104, 12);
      } else if (pitch === 'gable') {
        // peak at 1/3 width-height ratio, with eave overhang
        ctx.moveTo(x - 4, y + 36);
        ctx.lineTo(x + 48, y + 6);
        ctx.lineTo(x + 100, y + 36);
        ctx.lineTo(x + 100, y + 42);
        ctx.lineTo(x - 4, y + 42);
        ctx.closePath();
      } else if (pitch === 'hip') {
        ctx.moveTo(x - 4, y + 36);
        ctx.lineTo(x + 26, y + 8);
        ctx.lineTo(x + 70, y + 8);
        ctx.lineTo(x + 100, y + 36);
        ctx.lineTo(x + 100, y + 42);
        ctx.lineTo(x - 4, y + 42);
        ctx.closePath();
      } else if (pitch === 'shed') {
        ctx.moveTo(x - 4, y + 12);
        ctx.lineTo(x + 100, y + 4);
        ctx.lineTo(x + 100, y + 14);
        ctx.lineTo(x - 4, y + 38);
        ctx.closePath();
      }
    };

    // Drop shadow under eaves
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x - 4, y + 42, 108, 3);

    // Outer (darker) silhouette
    ctx.fillStyle = c.dark;
    silhouette();
    ctx.fill();

    // Inner (main color) inset
    ctx.save();
    silhouette();
    ctx.clip();

    if (pitch === 'flat') {
      ctx.fillStyle = c.main;
      ctx.fillRect(x - 2, y + 6, 100, 8);
      ctx.fillStyle = c.light;
      ctx.fillRect(x - 2, y + 6, 100, 1);
    } else if (pitch === 'gable') {
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x - 1, y + 36);
      ctx.lineTo(x + 48, y + 9);
      ctx.lineTo(x + 97, y + 36);
      ctx.closePath();
      ctx.fill();
      // Ridge highlight
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 46, y + 8, 4, 2);
    } else if (pitch === 'hip') {
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x - 1, y + 36);
      ctx.lineTo(x + 28, y + 11);
      ctx.lineTo(x + 68, y + 11);
      ctx.lineTo(x + 97, y + 36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 28, y + 10, 40, 2);
    } else if (pitch === 'shed') {
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x - 1, y + 14);
      ctx.lineTo(x + 97, y + 6);
      ctx.lineTo(x + 97, y + 12);
      ctx.lineTo(x - 1, y + 38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x - 1, y + 14, 98, 1);
    }

    // Material texture — clipped to silhouette
    if (material === 'shingle') {
      ctx.fillStyle = c.dark;
      for (let yy = 6; yy < 42; yy += 5) {
        const off = ((yy - 6) / 5) & 1 ? 4 : 0;
        for (let xx = -4 + off; xx < 100; xx += 8) {
          ctx.fillRect(x + xx, y + yy, 7, 1);
        }
      }
      ctx.fillStyle = c.light;
      for (let yy = 7; yy < 42; yy += 5) {
        const off = ((yy - 7) / 5) & 1 ? 4 : 0;
        for (let xx = -4 + off; xx < 100; xx += 8) {
          ctx.fillRect(x + xx, y + yy, 1, 1);
        }
      }
    } else if (material === 'tile') {
      ctx.fillStyle = c.dark;
      for (let yy = 6; yy < 42; yy += 4) {
        const off = ((yy - 6) / 4) & 1 ? 3 : 0;
        for (let xx = -4 + off; xx < 100; xx += 6) {
          ctx.fillRect(x + xx, y + yy, 5, 2);
          ctx.fillStyle = c.light;
          ctx.fillRect(x + xx, y + yy, 5, 1);
          ctx.fillStyle = c.dark;
        }
      }
    } else if (material === 'metal') {
      ctx.fillStyle = c.dark;
      for (let xx = -4; xx < 100; xx += 8) ctx.fillRect(x + xx, y, 1, 44);
      ctx.fillStyle = c.light;
      for (let xx = -2; xx < 100; xx += 8) ctx.fillRect(x + xx, y, 1, 44);
    } else if (material === 'thatch') {
      ctx.fillStyle = c.dark;
      for (let yy = 4; yy < 42; yy += 3) {
        for (let xx = (yy & 1) ? -3 : -4; xx < 100; xx += 2) {
          ctx.fillRect(x + xx, y + yy, 1, 2);
        }
      }
      ctx.fillStyle = c.edge;
      for (let xx = -4; xx < 100; xx += 6) ctx.fillRect(x + xx, y + 38, 1, 4);
    }

    ctx.restore();

    // Fascia line under eaves
    ctx.fillStyle = c.edge;
    ctx.fillRect(x - 4, y + 42, 108, 1);
  },

  // PATH (64x32 base)
  path(ctx, x, y, opts = {}, time = 0) {
    const surface = opts.surface || 'stone';
    const pattern = opts.pattern || 'straight';
    const c = surface === 'stone' ? this._palette.stone :
              surface === 'wood'  ? this._palette.wood :
              surface === 'brick' ? this._palette.pink :
              surface === 'dirt'  ? { main: '#7a5028', dark: '#4a3018', light: '#9a6838', edge: '#3a2510' } :
                                    this._palette.white;
    // Grass border
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x, y, 64, 32);
    if (pattern === 'straight') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 6, 64, 22);
      ctx.fillStyle = c.main;
      ctx.fillRect(x, y + 8, 64, 18);
    } else if (pattern === 'curve') {
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 26);
      ctx.bezierCurveTo(x + 16, y + 4, x + 48, y + 26, x + 68, y + 4);
      ctx.lineTo(x + 68, y + 14);
      ctx.bezierCurveTo(x + 48, y + 36, x + 16, y + 14, x - 4, y + 36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x - 2, y + 28);
      ctx.bezierCurveTo(x + 16, y + 6, x + 48, y + 28, x + 66, y + 6);
      ctx.lineTo(x + 66, y + 12);
      ctx.bezierCurveTo(x + 48, y + 34, x + 16, y + 12, x - 2, y + 34);
      ctx.closePath();
      ctx.fill();
    } else if (pattern === 'cross') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 6, 64, 22);
      ctx.fillRect(x + 22, y, 22, 32);
      ctx.fillStyle = c.main;
      ctx.fillRect(x, y + 8, 64, 18);
      ctx.fillRect(x + 24, y, 18, 32);
    }
    // Texture
    if (surface === 'stone') {
      ctx.fillStyle = c.edge;
      for (let xx = 4; xx < 64; xx += 12) for (let yy = 10; yy < 26; yy += 8) {
        ctx.fillRect(x + xx + (yy & 8 ? 4 : 0), y + yy, 8, 6);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + xx + (yy & 8 ? 5 : 1), y + yy + 1, 1, 1);
        ctx.fillStyle = c.edge;
      }
    } else if (surface === 'wood') {
      ctx.fillStyle = c.edge;
      for (let xx = 0; xx < 64; xx += 8) ctx.fillRect(x + xx, y + 8, 1, 18);
    } else if (surface === 'brick') {
      ctx.fillStyle = c.edge;
      for (let yy = 10; yy < 26; yy += 4) {
        const offset = (yy / 4) & 1 ? 4 : 0;
        for (let xx = -offset; xx < 64; xx += 8) {
          ctx.fillRect(x + xx + 7, y + yy, 1, 4);
          ctx.fillRect(x + xx, y + yy + 3, 8, 1);
        }
      }
    } else if (surface === 'dirt') {
      ctx.fillStyle = c.edge;
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(x + ((i * 13) % 64), y + 8 + ((i * 7) % 18), 1, 1);
      }
    }
  }
};

if (typeof module !== 'undefined') module.exports = ARCHITECTURE;
