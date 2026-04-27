// PIXEL FOUNDRY — PARTICLES & FX
// Smoke, fire, sparkle, raindrop, snow, leaf, bubble, lightning, dust, glow, magic, electric

const PARTICLES = {
  // Smoke plume (32x48)
  smoke(ctx, x, y, time) {
    for (let i = 0; i < 6; i++) {
      const t = (time + i * 30) / 80;
      const py = y + 44 - (t * 6) % 44;
      const drift = Math.sin(t + i) * 4;
      const px = x + 16 + drift;
      const size = 2 + (t * 2) % 6;
      const alpha = 0.7 - ((time + i * 30) % 240) / 400;
      ctx.fillStyle = `rgba(180,180,180,${Math.max(0, alpha)})`;
      ctx.fillRect(px - size, py - size, size * 2, size * 2);
    }
    // Source
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 12, y + 44, 8, 4);
  },

  // Fire (28x40)
  fire(ctx, x, y, time) {
    // Base coals
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(x + 4, y + 34, 20, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 36, 16, 3);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 8, y + 37, 12, 1);
    // Flames
    for (let i = 0; i < 5; i++) {
      const flicker = Math.sin(time / 4 + i * 1.3) * 2;
      const fx = x + 6 + i * 4 + flicker;
      const fy = y + 12 + Math.cos(time / 6 + i) * 4;
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(fx, fy + 8, 4, 16);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(fx + 1, fy + 10, 2, 12);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(fx + 1, fy + 14, 1, 6);
    }
    // Tip flame
    const tipY = y + 4 + Math.sin(time / 5) * 3;
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 13, tipY, 2, 8);
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 13, tipY + 2, 2, 4);
    // Glow
    ctx.fillStyle = 'rgba(255,29,108,0.18)';
    ctx.fillRect(x - 4, y - 4, 36, 48);
  },

  // Sparkle (24x24)
  sparkle(ctx, x, y, time) {
    const phases = [0, 0.5, 1.2, 1.8, 2.4];
    phases.forEach((p, i) => {
      const t = (time / 30 + p) % (Math.PI * 2);
      const scale = Math.abs(Math.sin(t));
      if (scale < 0.2) return;
      const sx = x + 4 + ((i * 7) % 16);
      const sy = y + 4 + ((i * 11) % 16);
      const s = 1 + scale * 3;
      ctx.fillStyle = i % 2 ? '#ffffff' : '#F5A623';
      // Cross
      ctx.fillRect(sx - s, sy, s * 2, 1);
      ctx.fillRect(sx, sy - s, 1, s * 2);
      // Diagonal
      ctx.fillStyle = `rgba(255,255,255,${scale})`;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    });
  },

  // Raindrop streak (20x32)
  raindrop(ctx, x, y, time) {
    for (let i = 0; i < 8; i++) {
      const fall = (time / 2 + i * 30) % 36;
      const px = x + (i * 3) % 16;
      const py = y + fall;
      ctx.fillStyle = 'rgba(122,170,234,0.8)';
      ctx.fillRect(px, py, 1, 4);
      ctx.fillStyle = 'rgba(122,170,234,0.4)';
      ctx.fillRect(px, py - 4, 1, 4);
    }
  },

  // Snow (32x32)
  snow(ctx, x, y, time) {
    for (let i = 0; i < 12; i++) {
      const drift = Math.sin((time + i * 50) / 30) * 6;
      const fall = (time / 4 + i * 20) % 36;
      const px = x + 4 + ((i * 5) % 24) + drift;
      const py = y + fall;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, 2, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(px - 1, py, 1, 1);
      ctx.fillRect(px + 2, py, 1, 1);
      ctx.fillRect(px, py - 1, 1, 1);
      ctx.fillRect(px, py + 2, 1, 1);
    }
  },

  // Leaf flutter (32x32)
  leaf(ctx, x, y, time) {
    const colors = ['#F5A623', '#c41758', '#FF1D6C', '#c4851c'];
    for (let i = 0; i < 5; i++) {
      const drift = Math.sin((time + i * 40) / 20) * 8;
      const fall = (time / 6 + i * 25) % 36;
      const rot = (time / 10 + i) % (Math.PI * 2);
      const px = x + 4 + ((i * 6) % 20) + drift;
      const py = y + fall;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.fillStyle = colors[i % 4];
      ctx.fillRect(-2, -1, 4, 2);
      ctx.fillRect(-1, -2, 2, 4);
      ctx.restore();
    }
  },

  // Bubble (24x40)
  bubble(ctx, x, y, time) {
    for (let i = 0; i < 6; i++) {
      const rise = (time / 3 + i * 30) % 44;
      const drift = Math.sin((time + i * 20) / 15) * 3;
      const px = x + 4 + ((i * 4) % 16) + drift;
      const py = y + 40 - rise;
      const size = 2 + ((i * 3) % 4);
      ctx.fillStyle = 'rgba(160,220,240,0.4)';
      ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(px - size + 1, py - size + 1, 1, 1);
      ctx.strokeStyle = 'rgba(122,200,234,0.6)';
      ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.stroke();
    }
  },

  // Lightning bolt (24x60)
  lightning(ctx, x, y, time) {
    const flash = Math.floor(time / 60) % 8;
    if (flash !== 0) return;
    const intensity = (time % 60) < 8 ? 1 : 0.3;
    ctx.fillStyle = `rgba(255,255,255,${intensity})`;
    ctx.fillRect(x, y, 24, 60);
    ctx.fillStyle = `rgba(245,166,35,${intensity})`;
    // Bolt path
    const path = [[12, 0], [10, 8], [14, 16], [8, 24], [16, 32], [10, 40], [14, 48], [8, 60]];
    for (let i = 0; i < path.length - 1; i++) {
      const [px1, py1] = path[i];
      const [px2, py2] = path[i + 1];
      ctx.fillRect(x + Math.min(px1, px2), y + py1, Math.abs(px2 - px1) + 2, py2 - py1);
    }
    ctx.fillStyle = '#ffffff';
    path.forEach(([px, py]) => ctx.fillRect(x + px, y + py, 2, 2));
  },

  // Dust mote (32x32)
  dust(ctx, x, y, time) {
    for (let i = 0; i < 16; i++) {
      const drift = Math.sin((time + i * 30) / 25) * 4 + Math.cos((time + i * 17) / 18) * 3;
      const float = Math.cos((time + i * 22) / 30) * 6;
      const px = x + 8 + ((i * 7) % 18) + drift;
      const py = y + 8 + ((i * 11) % 18) + float;
      ctx.fillStyle = `rgba(245,166,35,${0.3 + (i % 4) * 0.1})`;
      ctx.fillRect(px, py, 1, 1);
    }
  },

  // Magic glow orb (28x28)
  magic(ctx, x, y, time) {
    const cx = x + 14, cy = y + 14;
    const pulse = Math.sin(time / 8) * 0.3 + 0.7;
    // Outer halo
    ctx.fillStyle = `rgba(156,39,176,${0.2 * pulse})`;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,29,108,${0.3 * pulse})`;
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    // Core
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
    // Orbiting sparks
    for (let i = 0; i < 4; i++) {
      const angle = time / 8 + (i / 4) * Math.PI * 2;
      const r = 10 + Math.sin(time / 12 + i) * 2;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      ctx.fillStyle = ['#F5A623', '#9C27B0', '#2979FF', '#FF1D6C'][i];
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
  },

  // Electric arc (40x32)
  electric(ctx, x, y, time) {
    // Anchors
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, y + 14, 4, 4);
    ctx.fillRect(x + 36, y + 14, 4, 4);
    // Arc
    if (Math.floor(time / 4) % 2) {
      const segments = 8;
      ctx.fillStyle = '#5a9fff';
      for (let i = 0; i < segments; i++) {
        const t1 = i / segments, t2 = (i + 1) / segments;
        const px1 = x + 4 + t1 * 32;
        const px2 = x + 4 + t2 * 32;
        const py1 = y + 16 + (Math.random() - 0.5) * 8;
        const py2 = y + 16 + (Math.random() - 0.5) * 8;
        ctx.fillRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1) + 1, Math.abs(py2 - py1) + 1);
      }
      // White hot inner
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const px = x + 4 + Math.random() * 32;
        const py = y + 16 + (Math.random() - 0.5) * 4;
        ctx.fillRect(px, py, 2, 1);
      }
      // Glow
      ctx.fillStyle = 'rgba(90,159,255,0.25)';
      ctx.fillRect(x, y + 8, 40, 16);
    }
  },

  // Heart pop (24x24)
  heart(ctx, x, y, time) {
    const pulse = 1 + Math.sin(time / 8) * 0.15;
    const cx = x + 12, cy = y + 14;
    ctx.fillStyle = '#FF1D6C';
    // Two circles + triangle
    ctx.beginPath(); ctx.arc(cx - 4 * pulse, cy - 2 * pulse, 5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 4 * pulse, cy - 2 * pulse, 5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 8 * pulse, cy);
    ctx.lineTo(cx + 8 * pulse, cy);
    ctx.lineTo(cx, cy + 9 * pulse);
    ctx.closePath(); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(cx - 6, cy - 4, 2, 2);
    // Floaters
    ctx.fillStyle = 'rgba(255,29,108,0.6)';
    for (let i = 0; i < 3; i++) {
      const t = (time / 4 + i * 30) % 24;
      ctx.fillRect(x + 4 + i * 8, y + 24 - t, 1, 1);
    }
  }
};

if (typeof module !== 'undefined') module.exports = PARTICLES;
