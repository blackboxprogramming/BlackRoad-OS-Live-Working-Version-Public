// PIXEL FOUNDRY — BREAKFAST
// eggs, bacon, pancakes, waffle, toast, cereal, omelet, smoothie, bagel, croissant

const BREAKFAST = {
  AXES: {
    eggs:     { style: ['sunnyside','scrambled','boiled'] },
    pancakes: { count: ['short','tall'], topping: ['butter','syrup','berry'] },
    toast:    { topping: ['butter','jam','avocado','honey'] },
    cereal:   { color: ['pink','amber','violet','blue','green'] },
    smoothie: { color: ['pink','amber','violet','blue','green'] },
    bagel:    { topping: ['plain','sesame','everything','poppy'] }
  },

  // EGGS (40x32)
  eggs(ctx, x, y, opts = {}, time = 0) {
    const style = opts.style || 'sunnyside';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (style === 'sunnyside') {
      // Two eggs side by side
      [12, 28].forEach(cx => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + cx, y + 18, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.ellipse(x + cx - 1, y + 19, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Yolk
        ctx.fillStyle = '#F5A623';
        ctx.beginPath(); ctx.arc(x + cx, y + 18, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffe080';
        ctx.beginPath(); ctx.arc(x + cx - 1, y + 17, 1, 0, Math.PI * 2); ctx.fill();
      });
    } else if (style === 'scrambled') {
      // Yellow chunky pile
      ctx.fillStyle = '#c4851c';
      ctx.beginPath(); ctx.ellipse(x + 20, y + 18, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      [[10, 16], [16, 14], [24, 16], [22, 18], [14, 18], [28, 14]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#ffe080';
      [[12, 16], [20, 14], [26, 16]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 1, 0, Math.PI * 2); ctx.fill();
      });
      // Pepper
      ctx.fillStyle = '#1a1a1a';
      [[14, 14], [22, 16], [16, 18], [26, 18]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
    } else if (style === 'boiled') {
      // 2 halves
      [12, 28].forEach(cx => {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x + cx, y + 16, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath(); ctx.arc(x + cx, y + 17, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F5A623';
        ctx.beginPath(); ctx.arc(x + cx, y + 16, 3, 0, Math.PI * 2); ctx.fill();
      });
    }
  },

  // BACON (44x16)
  bacon(ctx, x, y, time = 0) {
    // Two strips
    [2, 8].forEach((sy, i) => {
      ctx.fillStyle = '#7a3a1a';
      ctx.beginPath();
      const baseY = y + sy;
      ctx.moveTo(x, baseY);
      for (let xx = 0; xx <= 44; xx += 4) {
        ctx.lineTo(x + xx, baseY + Math.sin(xx / 4 + i) * 1);
      }
      ctx.lineTo(x + 44, baseY + 6);
      for (let xx = 44; xx >= 0; xx -= 4) {
        ctx.lineTo(x + xx, baseY + 6 + Math.sin(xx / 4 + i) * 1);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a85a26';
      ctx.fillRect(x + 2, baseY + 1, 40, 4);
      // Fat stripes
      ctx.fillStyle = '#FF5A90';
      for (let xx = 4; xx < 40; xx += 6) ctx.fillRect(x + xx, baseY + 2, 2, 2);
      ctx.fillStyle = '#fff';
      [6, 18, 30].forEach(xx => ctx.fillRect(x + xx, baseY + 3, 1, 1));
    });
  },

  // PANCAKES (48x40)
  pancakes(ctx, x, y, opts = {}, time = 0) {
    const tall = opts.count === 'tall';
    const top = opts.topping || 'syrup';
    const stack = tall ? 4 : 2;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 38, 40, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 24, y + 36, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Pancake stack
    for (let i = 0; i < stack; i++) {
      const py = y + 30 - i * 5;
      ctx.fillStyle = '#7a5028';
      ctx.beginPath(); ctx.ellipse(x + 24, py + 2, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#daa86a';
      ctx.beginPath(); ctx.ellipse(x + 24, py, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c4935a';
      ctx.fillRect(x + 8, py - 1, 32, 1);
    }
    // Topping
    const topY = y + 30 - (stack - 1) * 5;
    if (top === 'butter') {
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + 20, topY - 6, 8, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 21, topY - 5, 6, 1);
      // Melt
      ctx.fillStyle = '#ffc46b';
      ctx.fillRect(x + 22, topY - 1, 4, 2);
    } else if (top === 'syrup') {
      ctx.fillStyle = '#5a3a1a';
      // Drips
      [[12, -2], [20, 0], [28, -1], [34, 1]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx, topY - 4 + dy, 4, 4);
        ctx.fillRect(x + dx + 1, topY + dy, 2, 6);
      });
      ctx.fillStyle = '#7a5028';
      ctx.fillRect(x + 14, topY - 4, 20, 2);
    } else if (top === 'berry') {
      ctx.fillStyle = '#9C27B0';
      [[14, -4], [22, -6], [30, -4], [16, -2], [28, -2], [22, 0]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, topY + dy, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#c34dd6';
      [[14, -4], [22, -6], [30, -4]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx - 1, topY - 1 + dy, 1, 1);
      });
    }
  },

  // WAFFLE (40x32)
  waffle(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 26, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Waffle
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 6, y + 8, 28, 18);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 7, y + 9, 26, 16);
    // Grid pattern
    ctx.fillStyle = '#7a5028';
    for (let xx = 10; xx < 34; xx += 4) ctx.fillRect(x + xx, y + 9, 2, 16);
    for (let yy = 12; yy < 24; yy += 4) ctx.fillRect(x + 7, y + yy, 26, 2);
    ctx.fillStyle = '#c4935a';
    for (let xx = 10; xx < 34; xx += 4) for (let yy = 12; yy < 24; yy += 4) {
      ctx.fillRect(x + xx + 2, y + yy + 2, 2, 2);
    }
    // Berries on top
    ctx.fillStyle = '#FF1D6C';
    [[12, 6], [18, 4], [24, 6], [28, 4]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#fff';
    [[11, 5], [17, 3], [23, 5], [27, 3]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
    // Whipped cream
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 20, y + 6, 4, 0, Math.PI * 2); ctx.fill();
  },

  // TOAST (32x32)
  toast(ctx, x, y, opts = {}, time = 0) {
    const top = opts.topping || 'butter';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 28, 2);
    // Bread shape
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 30);
    ctx.lineTo(x + 4, y + 12);
    ctx.quadraticCurveTo(x + 4, y + 4, x + 14, y + 4);
    ctx.lineTo(x + 18, y + 4);
    ctx.quadraticCurveTo(x + 28, y + 4, x + 28, y + 12);
    ctx.lineTo(x + 28, y + 30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 28);
    ctx.lineTo(x + 6, y + 12);
    ctx.quadraticCurveTo(x + 6, y + 6, x + 14, y + 6);
    ctx.lineTo(x + 18, y + 6);
    ctx.quadraticCurveTo(x + 26, y + 6, x + 26, y + 12);
    ctx.lineTo(x + 26, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 6, y + 28, 20, 1);
    // Topping
    if (top === 'butter') {
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + 12, y + 14, 8, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 13, y + 15, 4, 1);
    } else if (top === 'jam') {
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 16);
      [12, 14, 18, 22].forEach((dx, i) => ctx.lineTo(x + dx, y + 14 + (i & 1) * 4));
      ctx.lineTo(x + 22, y + 18);
      ctx.lineTo(x + 10, y + 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c41758';
      ctx.fillRect(x + 12, y + 17, 8, 1);
    } else if (top === 'avocado') {
      ctx.fillStyle = '#3acc3a';
      ctx.beginPath(); ctx.ellipse(x + 16, y + 16, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7acc7a';
      ctx.beginPath(); ctx.ellipse(x + 16, y + 16, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      // Mash texture
      ctx.fillStyle = '#3acc3a';
      [[12, 16], [16, 15], [20, 16]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
      // Pepper flakes
      ctx.fillStyle = '#1a1a1a';
      [[14, 16], [18, 15], [16, 17]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
    } else if (top === 'honey') {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 14);
      for (let xx = 10; xx <= 22; xx += 2) ctx.lineTo(x + xx, y + 14 + Math.sin(xx) * 1);
      ctx.lineTo(x + 22, y + 18); ctx.lineTo(x + 10, y + 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffc46b';
      ctx.fillRect(x + 12, y + 14, 8, 1);
    }
  },

  // CEREAL BOWL (44x36)
  cereal(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:'#FF1D6C', amber:'#F5A623', violet:'#9C27B0', blue:'#2979FF', green:'#3acc3a' }[opts.color || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 40, 2);
    // Bowl
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + 42, y + 14);
    ctx.quadraticCurveTo(x + 40, y + 32, x + 22, y + 34);
    ctx.quadraticCurveTo(x + 4, y + 32, x + 2, y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 16, 36, 2);
    // Milk
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 14, 19, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 13, 18, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Cereal pieces
    const colors = ['#F5A623', '#FF1D6C', '#9C27B0', '#2979FF', '#3acc3a'];
    [[8, 14], [14, 12], [20, 13], [26, 11], [32, 14], [16, 15], [28, 14], [12, 13], [22, 14], [18, 11], [30, 12], [24, 13]].forEach(([dx, dy], i) => {
      ctx.fillStyle = colors[i % 5];
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    // Spoon handle
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 36, y, 2, 12);
    ctx.beginPath(); ctx.ellipse(x + 37, y + 12, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
  },

  // OMELET (44x32)
  omelet(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 40, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 24, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Folded omelet
    ctx.fillStyle = '#c4851c';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 22);
    ctx.bezierCurveTo(x + 4, y + 12, x + 16, y + 8, x + 22, y + 12);
    ctx.bezierCurveTo(x + 30, y + 8, x + 40, y + 14, x + 38, y + 22);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 21);
    ctx.bezierCurveTo(x + 6, y + 13, x + 16, y + 10, x + 22, y + 14);
    ctx.bezierCurveTo(x + 30, y + 10, x + 38, y + 14, x + 36, y + 21);
    ctx.closePath(); ctx.fill();
    // Fold line
    ctx.fillStyle = '#c4851c';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 18);
    ctx.bezierCurveTo(x + 18, y + 16, x + 26, y + 16, x + 32, y + 18);
    ctx.lineTo(x + 32, y + 19);
    ctx.bezierCurveTo(x + 26, y + 17, x + 18, y + 17, x + 12, y + 19);
    ctx.closePath(); ctx.fill();
    // Filling peeking — green
    ctx.fillStyle = '#3acc3a';
    [16, 22, 28].forEach(dx => ctx.fillRect(x + dx, y + 17, 2, 1));
    ctx.fillStyle = '#FF1D6C';
    [18, 26].forEach(dx => ctx.fillRect(x + dx, y + 17, 1, 1));
    // Cheese melt
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 12, y + 16, 4, 2);
    ctx.fillRect(x + 28, y + 16, 4, 2);
    // Garnish
    ctx.fillStyle = '#3acc3a';
    [[10, 22], [34, 22]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 1));
  },

  // SMOOTHIE (28x44)
  smoothie(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:['#FF1D6C','#c41758','#ff5a90'], amber:['#F5A623','#c4851c','#ffc46b'], violet:['#9C27B0','#7b1f8c','#c34dd6'], blue:['#2979FF','#1f5fcc','#5a9fff'], green:['#3acc3a','#2a8a2a','#7acc7a'] }[opts.color || 'pink'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 24, 2);
    // Glass
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 6, y + 42);
    ctx.lineTo(x + 22, y + 42); ctx.lineTo(x + 24, y + 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 6, y + 42);
    ctx.lineTo(x + 22, y + 42); ctx.lineTo(x + 24, y + 8);
    ctx.stroke();
    // Smoothie
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 9); ctx.lineTo(x + 7, y + 41);
    ctx.lineTo(x + 21, y + 41); ctx.lineTo(x + 23, y + 9);
    ctx.closePath(); ctx.clip();
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 4, y + 12, 20, 30);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 4, y + 14, 20, 28);
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 4, y + 14, 20, 2);
    // Foam
    ctx.fillStyle = '#fff';
    [6, 9, 12, 16, 19, 22].forEach(dx => {
      ctx.beginPath(); ctx.arc(x + dx, y + 14, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    // Straw
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y, 3, 18);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 14, y + 2, 3, 1);
    ctx.fillRect(x + 14, y + 5, 3, 1);
    ctx.fillRect(x + 14, y + 8, 3, 1);
    // Topping
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 8, y + 8, 4, 4);
  },

  // BAGEL (40x32)
  bagel(ctx, x, y, opts = {}, time = 0) {
    const top = opts.topping || 'sesame';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 32, 2);
    // Outer ring
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.arc(x + 20, y + 16, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.beginPath(); ctx.arc(x + 20, y + 16, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4935a';
    ctx.beginPath(); ctx.arc(x + 20, y + 18, 13, 0, Math.PI); ctx.fill();
    // Hole
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 20, y + 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath(); ctx.arc(x + 20, y + 16, 4, 0, Math.PI * 2); ctx.fill();
    // Toppings
    if (top === 'sesame') {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = 8 + (i % 3);
        ctx.fillRect(x + 20 + Math.cos(a) * r, y + 16 + Math.sin(a) * r, 2, 1);
      }
    } else if (top === 'everything') {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillRect(x + 20 + Math.cos(a) * 9, y + 16 + Math.sin(a) * 9, 2, 1);
      }
      ctx.fillStyle = '#1a1a1a';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8 + 0.0625) * Math.PI * 2;
        ctx.fillRect(x + 20 + Math.cos(a) * 8, y + 16 + Math.sin(a) * 8, 1, 1);
      }
      ctx.fillStyle = '#3acc3a';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4 + 0.125) * Math.PI * 2;
        ctx.fillRect(x + 20 + Math.cos(a) * 10, y + 16 + Math.sin(a) * 10, 2, 1);
      }
    } else if (top === 'poppy') {
      ctx.fillStyle = '#1a1a1a';
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = 8 + (i % 3);
        ctx.fillRect(x + 20 + Math.cos(a) * r, y + 16 + Math.sin(a) * r, 1, 1);
      }
    }
    // Cream cheese inside
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 20, y + 16, 3, 0, Math.PI * 2); ctx.fill();
  },

  // CROISSANT (40x28)
  croissant(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 26, 36, 2);
    // Crescent shape
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 24);
    ctx.bezierCurveTo(x, y + 16, x + 4, y + 4, x + 16, y + 4);
    ctx.lineTo(x + 24, y + 4);
    ctx.bezierCurveTo(x + 36, y + 4, x + 40, y + 16, x + 34, y + 24);
    ctx.bezierCurveTo(x + 28, y + 18, x + 12, y + 18, x + 6, y + 24);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 22);
    ctx.bezierCurveTo(x + 4, y + 16, x + 6, y + 6, x + 16, y + 6);
    ctx.lineTo(x + 24, y + 6);
    ctx.bezierCurveTo(x + 34, y + 6, x + 36, y + 16, x + 32, y + 22);
    ctx.bezierCurveTo(x + 28, y + 18, x + 12, y + 18, x + 8, y + 22);
    ctx.closePath(); ctx.fill();
    // Layered curves
    ctx.fillStyle = '#a67c3d';
    [12, 18, 24, 30].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px, y + 18);
      ctx.bezierCurveTo(x + px - 2, y + 14, x + px + 2, y + 10, x + px, y + 8);
      ctx.lineTo(x + px - 1, y + 8);
      ctx.bezierCurveTo(x + px - 3, y + 12, x + px - 1, y + 16, x + px - 2, y + 18);
      ctx.closePath(); ctx.fill();
    });
    // Highlight
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 14, y + 8, 2, 2);
    ctx.fillRect(x + 24, y + 7, 2, 2);
    // Flake bits
    ctx.fillStyle = '#7a5028';
    [[10, 16], [18, 14], [26, 14], [32, 16]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
  }
};

if (typeof module !== 'undefined') module.exports = BREAKFAST;
