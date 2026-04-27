// BLACKROAD OS - FOOD & DRINK
// Coffee, donut, pizza, apple, cake, sandwich

const FOOD = {
  // Coffee mug (20x24)
  coffee: function(ctx, x, y, time) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 1, y + 22, 18, 3);
    // Handle
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x + 16, y + 8, 4, 10);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 18, y + 10, 2, 6);
    // Mug body
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x, y + 6, 18, 16);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x, y + 18, 18, 4);
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 1, y + 7, 16, 2);
    // Coffee surface
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(x + 1, y + 6, 16, 3);
    ctx.fillStyle = '#5a2a14';
    ctx.fillRect(x + 1, y + 6, 16, 1);
    // Steam
    if (Math.floor(time / 6) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 4, y + 2 - (time % 4), 2, 3);
      ctx.fillRect(x + 9, y - (time % 5), 2, 3);
      ctx.fillRect(x + 14, y + 1 - (time % 3), 2, 3);
    }
  },

  // Donut (28x28)
  donut: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 24, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Dough
    ctx.fillStyle = '#c4935a';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 12, 0, Math.PI); ctx.fill();
    // Frosting
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a90';
    ctx.beginPath(); ctx.arc(x + 14, y + 12, 9, 0, Math.PI, true); ctx.fill();
    // Hole
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 3, 0, Math.PI * 2); ctx.fill();
    // Sprinkles
    const sprinkles = [['#2979FF', 6, 8], ['#F5A623', 18, 6], ['#9C27B0', 8, 18], ['#FFFFFF', 20, 18], ['#2979FF', 22, 11], ['#F5A623', 4, 14]];
    sprinkles.forEach(([c, sx, sy]) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + sx, y + sy, 2, 1);
    });
  },

  // Pizza slice (40x36)
  pizza: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 32, 32, 3);
    // Crust
    ctx.fillStyle = '#c4935a';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 32);
    ctx.lineTo(x + 36, y + 32);
    ctx.lineTo(x + 20, y + 4);
    ctx.closePath();
    ctx.fill();
    // Cheese
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 30);
    ctx.lineTo(x + 32, y + 30);
    ctx.lineTo(x + 20, y + 8);
    ctx.closePath();
    ctx.fill();
    // Pepperoni
    ctx.fillStyle = '#c41758';
    [[16, 14], [24, 14], [20, 20], [14, 24], [26, 24]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(x + px, y + py, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#FF1D6C';
    [[16, 14], [24, 14], [20, 20], [14, 24], [26, 24]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(x + px, y + py, 1, 0, Math.PI * 2); ctx.fill();
    });
    // Crust shading
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 4, y + 30, 32, 2);
  },

  // Apple (20x24)
  apple: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(x + 10, y + 22, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 10, y + 14, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 8, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 5, y + 10, 3, 2);
    // Stem
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 10, y + 4, 2, 4);
    // Leaf
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 12, y + 4, 4, 2);
    ctx.fillStyle = '#4a9a4a';
    ctx.fillRect(x + 12, y + 5, 3, 1);
  },

  // Cake slice (32x32)
  cake: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 28, 3);
    // Layers
    ctx.fillStyle = '#c4935a';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 30);
    ctx.lineTo(x + 30, y + 30);
    ctx.lineTo(x + 28, y + 12);
    ctx.lineTo(x + 4, y + 12);
    ctx.closePath();
    ctx.fill();
    // Frosting layer 1
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 18, 24, 3);
    // Frosting layer 2 — top
    ctx.fillStyle = '#ff5a90';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 12);
    ctx.lineTo(x + 28, y + 12);
    ctx.lineTo(x + 22, y + 4);
    ctx.lineTo(x + 10, y + 4);
    ctx.closePath();
    ctx.fill();
    // Cherry
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 16, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a90';
    ctx.beginPath(); ctx.arc(x + 15, y + 5, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 18, y + 2, 2, 2);
    // Sprinkles
    [['#2979FF', 8, 14], ['#F5A623', 22, 14], ['#9C27B0', 14, 16]].forEach(([c, sx, sy]) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + sx, y + sy, 2, 1);
    });
  },

  // Sandwich (40x24)
  sandwich: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 22, 36, 3);
    // Bottom bread
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x, y + 16, 40, 6);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 1, y + 17, 38, 1);
    // Lettuce
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 1, y + 14, 38, 3);
    ctx.fillStyle = '#4a9a4a';
    for (let i = 1; i < 38; i += 4) ctx.fillRect(x + i, y + 13, 2, 2);
    // Tomato
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 2, y + 11, 36, 3);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 2, y + 11, 36, 1);
    // Cheese
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 1, y + 8, 38, 3);
    // Top bread
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x, y + 2, 40, 6);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x, y + 7, 40, 1);
    // Sesame seeds
    ctx.fillStyle = '#fff';
    [4, 12, 20, 28, 36].forEach(sx => ctx.fillRect(x + sx, y + 4, 2, 1));
    // Toothpick + olive
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 18, y - 2, 1, 8);
    ctx.fillStyle = '#3a7a3a';
    ctx.beginPath(); ctx.arc(x + 18, y - 2, 2, 0, Math.PI * 2); ctx.fill();
  }
};

if (typeof module !== 'undefined') module.exports = FOOD;
