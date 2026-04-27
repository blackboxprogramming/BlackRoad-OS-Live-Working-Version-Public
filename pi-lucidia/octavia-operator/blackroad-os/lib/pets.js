// BLACKROAD OS - PETS
// Cat, dog, bird, fish, hamster

const PETS = {
  // Cat (24x20)
  cat: function(ctx, x, y, color, time) {
    const tail = Math.sin(time / 12) * 2;
    const main = color === 'black' ? '#1a1a1a' : color === 'white' ? '#f0f0f0' : color === 'orange' ? '#F5A623' : '#5a3a1a';
    const dark = color === 'black' ? '#0a0a0a' : color === 'white' ? '#c0c0c0' : color === 'orange' ? '#c4851c' : '#3a2510';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 18, 20, 3);
    // Tail
    ctx.fillStyle = main;
    ctx.fillRect(x + 18 + tail, y + 6, 4, 4);
    ctx.fillRect(x + 20 + tail, y + 4, 3, 6);
    // Body
    ctx.fillStyle = main;
    ctx.fillRect(x + 4, y + 8, 16, 10);
    ctx.fillStyle = dark;
    ctx.fillRect(x + 4, y + 14, 16, 4);
    // Head
    ctx.fillStyle = main;
    ctx.fillRect(x, y + 4, 10, 8);
    // Ears
    ctx.fillRect(x, y, 3, 4);
    ctx.fillRect(x + 7, y, 3, 4);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 1, y + 1, 1, 2);
    ctx.fillRect(x + 8, y + 1, 1, 2);
    // Eyes
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 2, y + 6, 2, 2);
    ctx.fillRect(x + 6, y + 6, 2, 2);
    if (Math.floor(time / 30) % 25 === 0) {
      ctx.fillStyle = main;
      ctx.fillRect(x + 2, y + 6, 2, 2);
      ctx.fillRect(x + 6, y + 6, 2, 2);
    }
    // Nose / mouth
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 9, 2, 1);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 4, y + 10, 1, 1);
    ctx.fillRect(x + 5, y + 10, 1, 1);
    // Legs
    ctx.fillStyle = main;
    ctx.fillRect(x + 6, y + 18, 3, 2);
    ctx.fillRect(x + 14, y + 18, 3, 2);
  },

  // Dog (28x22)
  dog: function(ctx, x, y, time) {
    const tail = Math.sin(time / 6) * 3;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 20, 24, 3);
    // Tail
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 24 + tail / 2, y + 6, 3, 4);
    // Body
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 6, y + 8, 20, 12);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 6, y + 14, 20, 6);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 6, y + 18, 20, 2);
    // Spots
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 10, y + 10, 4, 3);
    ctx.fillRect(x + 18, y + 12, 3, 2);
    // Head
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x, y + 4, 12, 12);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x, y + 12, 12, 4);
    // Ears (floppy)
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x - 2, y + 4, 4, 8);
    ctx.fillRect(x + 10, y + 4, 4, 8);
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 8, 2, 2);
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 3, y + 8, 1, 1);
    ctx.fillRect(x + 9, y + 8, 1, 1);
    // Snout
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 2, y + 11, 8, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 4, y + 12, 4, 2);
    // Tongue
    if (Math.floor(time / 15) % 4 === 0) {
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 4, y + 14, 3, 2);
    }
    // Legs
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 8, y + 20, 3, 2);
    ctx.fillRect(x + 22, y + 20, 3, 2);
  },

  // Bird (16x14)
  bird: function(ctx, x, y, time) {
    const flap = Math.floor(time / 5) % 2;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 12, 12, 2);
    // Body
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 2, y + 4, 10, 8);
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x + 2, y + 9, 10, 3);
    ctx.fillStyle = '#5a9fff';
    ctx.fillRect(x + 3, y + 5, 7, 2);
    // Head
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 9, y + 2, 6, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 11, y + 4, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 12, y + 4, 1, 1);
    // Beak
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 14, y + 5, 2, 2);
    // Wing
    ctx.fillStyle = '#1f5fcc';
    if (flap) {
      ctx.fillRect(x + 4, y, 6, 4);
    } else {
      ctx.fillRect(x + 3, y + 6, 6, 4);
    }
    // Feet
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 5, y + 12, 1, 2);
    ctx.fillRect(x + 8, y + 12, 1, 2);
  },

  // Fish in tank (52x44)
  fishtank: function(ctx, x, y, time) {
    // Stand
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 2, y + 40, 48, 4);
    // Glass
    ctx.fillStyle = 'rgba(120,200,230,0.15)';
    ctx.fillRect(x, y + 4, 52, 38);
    ctx.fillStyle = '#0a3a5a';
    ctx.fillRect(x + 2, y + 6, 48, 34);
    ctx.fillStyle = '#1a5a8a';
    ctx.fillRect(x + 2, y + 6, 48, 14);
    ctx.fillStyle = '#2a7aaa';
    ctx.fillRect(x + 2, y + 6, 48, 4);
    // Frame
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 4, 52, 2);
    ctx.fillRect(x, y + 40, 52, 2);
    ctx.fillRect(x, y + 4, 2, 38);
    ctx.fillRect(x + 50, y + 4, 2, 38);
    // Sand
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 2, y + 34, 48, 6);
    ctx.fillStyle = '#c4935a';
    for (let i = 4; i < 50; i += 4) ctx.fillRect(x + i, y + 34, 2, 1);
    // Plant
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 8, y + 20, 2, 14);
    ctx.fillRect(x + 12, y + 24, 2, 10);
    ctx.fillStyle = '#4a9a4a';
    ctx.fillRect(x + 6, y + 22, 2, 4);
    ctx.fillRect(x + 14, y + 26, 2, 4);
    // Fish 1
    const f1x = (Math.sin(time / 30) * 14 + 25) | 0;
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + f1x, y + 16, 6, 4);
    ctx.fillRect(x + f1x - 2, y + 17, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + f1x + 4, y + 17, 1, 1);
    // Fish 2
    const f2x = (Math.cos(time / 25) * 12 + 25) | 0;
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + f2x, y + 26, 5, 3);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + f2x + 3, y + 27, 1, 1);
    // Bubbles
    if (Math.floor(time / 4) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(x + 40, y + 30 - (time % 22), 2, 2);
      ctx.fillRect(x + 38, y + 24 - (time % 18), 1, 1);
    }
  },

  // Hamster ball (28x28)
  hamsterBall: function(ctx, x, y, time) {
    const roll = Math.sin(time / 20) * 4;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 26, 24, 3);
    // Ball
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 14, y + 14, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    // Hamster inside
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 8 + roll, y + 12, 12, 8);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 8 + roll, y + 17, 12, 3);
    // Head
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 16 + roll, y + 10, 6, 6);
    // Ears
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 17 + roll, y + 9, 2, 2);
    // Eye
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 19 + roll, y + 12, 1, 1);
    // Highlight on ball
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 4, y + 6, 4, 4);
  }
};

if (typeof module !== 'undefined') module.exports = PETS;
