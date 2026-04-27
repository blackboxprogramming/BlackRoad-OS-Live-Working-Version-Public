// PIXEL FOUNDRY — ANIMALS (wild)
// deer, fox, rabbit, owl, butterfly, frog, snail, bear, raccoon, squirrel

const ANIMALS = {
  AXES: {
    rabbit:    { color: ['brown','white','black','grey'], pose: ['standing','sitting'] },
    butterfly: { color: ['pink','amber','violet','blue','white','black'] },
    bear:      { color: ['brown','black','polar'], pose: ['standing','walking'] },
    owl:       { color: ['brown','white','grey'] },
    frog:      { color: ['green','red','blue','amber'] }
  },

  // DEER (44x44)
  deer(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 42, 36, 2);
    // Body
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 8, y + 22, 24, 14);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 8, y + 22, 24, 4);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 10, y + 22, 1, 12);
    // Spots
    ctx.fillStyle = '#fff';
    [12, 18, 24, 28].forEach((dx, i) => ctx.fillRect(x + dx, y + 26 + (i & 1) * 4, 2, 1));
    // Legs
    ctx.fillStyle = '#5a3a1a';
    [10, 14, 24, 28].forEach(lx => ctx.fillRect(x + lx, y + 36, 2, 6));
    // Neck + head
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 28, y + 14, 6, 14);
    ctx.fillRect(x + 32, y + 10, 8, 10);
    // Snout
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 38, y + 14, 4, 4);
    // Ear
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 32, y + 6, 3, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 33, y + 8, 1, 3);
    // Antlers
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 35, y + 4, 1, 8);
    ctx.fillRect(x + 33, y + 6, 1, 2);
    ctx.fillRect(x + 37, y + 6, 1, 2);
    ctx.fillRect(x + 35, y + 2, 3, 2);
    // Eye
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 36, y + 12, 1, 1);
    // Tail
    const wag = Math.floor(time / 30) % 2;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 20 + wag, 3, 4);
  },

  // FOX (32x24)
  fox(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 22, 24, 2);
    // Tail (with sway)
    const tail = Math.sin(time / 12) * 2;
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 22 + tail, y + 8, 8, 6);
    ctx.fillRect(x + 26 + tail, y + 6, 4, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 28 + tail, y + 8, 2, 4);
    // Body
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 6, y + 12, 18, 10);
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 6, y + 18, 18, 4);
    // Legs
    ctx.fillStyle = '#1a1a1a';
    [8, 12, 18, 22].forEach(lx => ctx.fillRect(x + lx, y + 20, 2, 4));
    // Head
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x, y + 10, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y + 16, 6, 4);
    // Ears
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x, y + 6, 3, 4);
    ctx.fillRect(x + 7, y + 6, 3, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 6, 1, 2);
    ctx.fillRect(x + 9, y + 6, 1, 2);
    // Eyes / nose
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 13, 1, 1);
    ctx.fillRect(x + 7, y + 13, 1, 1);
    ctx.fillRect(x, y + 16, 2, 1);
  },

  // RABBIT (24x32)
  rabbit(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'white' ? '#f0f0f0'
            : opts.color === 'black' ? '#1a1a1a'
            : opts.color === 'grey'  ? '#a0a0a8'
                                     : '#a67c3d';
    const cd = opts.color === 'white' ? '#c0c0c0'
            :  opts.color === 'black' ? '#0a0a0a'
            :  opts.color === 'grey'  ? '#7a7a80'
                                      : '#7a5028';
    const sitting = opts.pose === 'sitting';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    // Ears
    ctx.fillStyle = cd;
    ctx.fillRect(x + 6, y, 3, 12);
    ctx.fillRect(x + 15, y, 3, 12);
    ctx.fillStyle = c;
    ctx.fillRect(x + 7, y + 1, 1, 10);
    ctx.fillRect(x + 16, y + 1, 1, 10);
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 7, y + 4, 1, 4);
    ctx.fillRect(x + 16, y + 4, 1, 4);
    // Head
    ctx.fillStyle = c;
    ctx.fillRect(x + 5, y + 10, 14, 10);
    ctx.fillStyle = cd;
    ctx.fillRect(x + 5, y + 18, 14, 2);
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 14, 2, 2);
    ctx.fillRect(x + 14, y + 14, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 14, 1, 1);
    ctx.fillRect(x + 15, y + 14, 1, 1);
    // Nose
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 11, y + 17, 2, 1);
    // Body
    if (sitting) {
      ctx.fillStyle = c;
      ctx.fillRect(x + 4, y + 18, 16, 12);
      ctx.fillStyle = cd;
      ctx.fillRect(x + 4, y + 26, 16, 4);
    } else {
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y + 20, 18, 8);
      ctx.fillStyle = cd;
      ctx.fillRect(x + 3, y + 26, 18, 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 5, y + 28, 2, 2);
      ctx.fillRect(x + 17, y + 28, 2, 2);
    }
    // Tail puff
    const wiggle = Math.sin(time / 8) * 1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 1 + wiggle, y + 22, 3, 3);
  },

  // OWL (24x32)
  owl(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'white' ? '#f0f0f0'
            : opts.color === 'grey'  ? '#a0a0a8'
                                     : '#7a5028';
    const cd = opts.color === 'white' ? '#c0c0c0'
            :  opts.color === 'grey'  ? '#7a7a80'
                                      : '#5a3a1a';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    // Body
    ctx.fillStyle = cd;
    ctx.fillRect(x + 4, y + 8, 16, 22);
    ctx.fillStyle = c;
    ctx.fillRect(x + 5, y + 9, 14, 20);
    // Belly chevrons
    ctx.fillStyle = cd;
    [12, 16, 20, 24].forEach(yy => {
      ctx.fillRect(x + 7, y + yy, 2, 1);
      ctx.fillRect(x + 11, y + yy + 1, 2, 1);
      ctx.fillRect(x + 15, y + yy, 2, 1);
    });
    // Wings
    ctx.fillStyle = cd;
    ctx.fillRect(x + 3, y + 12, 3, 12);
    ctx.fillRect(x + 18, y + 12, 3, 12);
    // Ear tufts
    ctx.fillStyle = cd;
    ctx.fillRect(x + 5, y + 4, 3, 5);
    ctx.fillRect(x + 16, y + 4, 3, 5);
    // Face disc
    ctx.fillStyle = c;
    ctx.fillRect(x + 6, y + 8, 12, 8);
    // Eyes (blink occasionally)
    const blink = Math.floor(time / 60) % 30 === 0;
    if (!blink) {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 9, y + 12, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 15, y + 12, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 8, y + 11, 2, 2);
      ctx.fillRect(x + 14, y + 11, 2, 2);
    } else {
      ctx.fillStyle = cd;
      ctx.fillRect(x + 7, y + 12, 4, 1);
      ctx.fillRect(x + 13, y + 12, 4, 1);
    }
    // Beak
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 11, y + 14, 2, 3);
    // Feet
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 8, y + 30, 3, 2);
    ctx.fillRect(x + 13, y + 30, 3, 2);
  },

  // BUTTERFLY (32x24)
  butterfly(ctx, x, y, opts = {}, time = 0) {
    const c = { pink: ['#FF1D6C','#c41758','#ff5a90'],
                amber: ['#F5A623','#c4851c','#ffc46b'],
                violet:['#9C27B0','#7b1f8c','#c34dd6'],
                blue:  ['#2979FF','#1f5fcc','#5a9fff'],
                white: ['#f5f5f5','#c0c0c0','#ffffff'],
                black: ['#1a1a1a','#0a0a0a','#3a3a3a'] }[opts.color || 'pink'];
    const flap = Math.sin(time / 4);
    const wingScale = 0.6 + Math.abs(flap) * 0.4;
    ctx.save();
    ctx.translate(x + 16, y + 12);
    // Wings (4)
    [-1, 1].forEach(side => {
      // Upper
      ctx.fillStyle = c[1];
      ctx.beginPath();
      ctx.ellipse(side * 6 * wingScale, -3, 7 * wingScale, 5, side * Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c[0];
      ctx.beginPath();
      ctx.ellipse(side * 6 * wingScale, -3, 5.5 * wingScale, 4, side * Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c[2];
      ctx.fillRect(side * 5 * wingScale - 1, -5, 2, 2);
      // Lower
      ctx.fillStyle = c[1];
      ctx.beginPath();
      ctx.ellipse(side * 5 * wingScale, 5, 5 * wingScale, 4, side * -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c[0];
      ctx.beginPath();
      ctx.ellipse(side * 5 * wingScale, 5, 4 * wingScale, 3, side * -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      // Wing dots
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(side * 6 * wingScale - 1, -3, 2, 2);
    });
    // Body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-1, -8, 2, 16);
    // Head
    ctx.beginPath(); ctx.arc(0, -8, 2, 0, Math.PI * 2); ctx.fill();
    // Antennae
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-3, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(3, -12); ctx.stroke();
    ctx.fillStyle = c[0];
    ctx.fillRect(-4, -13, 1, 1);
    ctx.fillRect(3, -13, 1, 1);
    ctx.restore();
  },

  // FROG (24x20)
  frog(ctx, x, y, opts = {}, time = 0) {
    const main = { green: '#3a7a3a', red: '#c41758', blue: '#2979FF', amber: '#F5A623' }[opts.color || 'green'];
    const dark = { green: '#2a5a2a', red: '#7a0a28', blue: '#1f5fcc', amber: '#c4851c' }[opts.color || 'green'];
    const light = { green: '#4a9a4a', red: '#FF5A90', blue: '#5a9fff', amber: '#ffc46b' }[opts.color || 'green'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 18, 16, 2);
    // Body
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(x + 12, y + 14, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = main;
    ctx.beginPath(); ctx.ellipse(x + 12, y + 13, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = light;
    ctx.fillRect(x + 8, y + 16, 8, 2);
    // Legs
    ctx.fillStyle = main;
    ctx.fillRect(x + 2, y + 14, 4, 4);
    ctx.fillRect(x + 18, y + 14, 4, 4);
    // Eyes
    ctx.fillStyle = main;
    ctx.beginPath(); ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16, y + 8, 3, 0, Math.PI * 2); ctx.fill();
    const blink = Math.floor(time / 50) % 30 === 0;
    if (!blink) {
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 7, y + 7, 2, 2);
      ctx.fillRect(x + 15, y + 7, 2, 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 7, y + 8, 1, 1);
      ctx.fillRect(x + 15, y + 8, 1, 1);
    }
    // Mouth
    ctx.fillStyle = dark;
    ctx.fillRect(x + 9, y + 14, 6, 1);
  },

  // SNAIL (28x20)
  snail(ctx, x, y, time = 0) {
    const drift = (time / 30) % 2;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4 + drift, y + 18, 18, 2);
    // Body
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 2 + drift, y + 14, 18, 4);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 2 + drift, y + 16, 18, 2);
    // Head bump
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + drift, y + 11, 5, 5);
    // Antennae
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 1 + drift, y + 8, 1, 4);
    ctx.fillRect(x + 3 + drift, y + 8, 1, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 1 + drift, y + 7, 1, 1);
    ctx.fillRect(x + 3 + drift, y + 7, 1, 1);
    // Shell
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 14 + drift, y + 10, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 14 + drift, y + 10, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF5A90';
    ctx.beginPath(); ctx.arc(x + 14 + drift, y + 10, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a0a28';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + 14 + drift, y + 10, 6, 0, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 14 + drift, y + 10, 4, 0, Math.PI * 1.5); ctx.stroke();
  },

  // BEAR (40x32)
  bear(ctx, x, y, opts = {}, time = 0) {
    const fur = { brown: '#5a3a1a', black: '#1a1a1a', polar: '#f0f0f0' }[opts.color || 'brown'];
    const furD = { brown: '#3a2510', black: '#0a0a0a', polar: '#c0c0c0' }[opts.color || 'brown'];
    const furL = { brown: '#7a5028', black: '#3a3a3a', polar: '#ffffff' }[opts.color || 'brown'];
    const walking = opts.pose === 'walking';
    const lift = walking ? Math.sin(time / 8) * 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 32, 2);
    // Body
    ctx.fillStyle = furD;
    ctx.fillRect(x + 6, y + 14, 28, 16);
    ctx.fillStyle = fur;
    ctx.fillRect(x + 7, y + 14, 26, 14);
    ctx.fillStyle = furL;
    ctx.fillRect(x + 8, y + 14, 24, 2);
    // Legs
    ctx.fillStyle = furD;
    ctx.fillRect(x + 8, y + 28 + lift, 5, 4);
    ctx.fillRect(x + 16, y + 28 - lift, 5, 4);
    ctx.fillRect(x + 24, y + 28 + lift, 5, 4);
    ctx.fillRect(x + 30, y + 28 - lift, 4, 4);
    // Head
    ctx.fillStyle = furD;
    ctx.fillRect(x, y + 12, 14, 14);
    ctx.fillStyle = fur;
    ctx.fillRect(x + 1, y + 13, 12, 12);
    // Ears
    ctx.fillStyle = furD;
    ctx.fillRect(x + 1, y + 9, 4, 4);
    ctx.fillRect(x + 9, y + 9, 4, 4);
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 2, y + 10, 2, 2);
    ctx.fillRect(x + 10, y + 10, 2, 2);
    // Snout
    ctx.fillStyle = furL;
    ctx.fillRect(x + 2, y + 18, 8, 6);
    // Eyes / nose
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 3, y + 15, 2, 2);
    ctx.fillRect(x + 9, y + 15, 2, 2);
    ctx.fillRect(x + 4, y + 19, 4, 2);
    // Mouth
    ctx.fillRect(x + 6, y + 22, 2, 1);
  },

  // RACCOON (32x24)
  raccoon(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 22, 24, 2);
    // Tail with rings
    const tail = Math.sin(time / 10) * 1.5;
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 22 + tail, y + 8, 8, 6);
    ctx.fillRect(x + 26 + tail, y + 6, 6, 8);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 24 + tail, y + 9, 6, 1);
    ctx.fillRect(x + 28 + tail, y + 11, 4, 1);
    // Body
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 6, y + 12, 18, 10);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 6, y + 12, 18, 4);
    // Legs
    ctx.fillStyle = '#1a1a1a';
    [8, 12, 18, 22].forEach(lx => ctx.fillRect(x + lx, y + 20, 2, 4));
    // Head
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x, y + 8, 12, 12);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 2, y + 14, 8, 4);
    // Ears
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x, y + 4, 4, 4);
    ctx.fillRect(x + 8, y + 4, 4, 4);
    // Mask
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 1, y + 11, 10, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y + 12, 2, 1);
    ctx.fillRect(x + 8, y + 12, 2, 1);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 12, 1, 1);
    ctx.fillRect(x + 8, y + 12, 1, 1);
    // Nose
    ctx.fillRect(x, y + 16, 2, 1);
  },

  // SQUIRREL (24x28)
  squirrel(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 26, 16, 2);
    // Tail (curly, fluffy)
    const flick = Math.sin(time / 12) * 1;
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 14 + flick, y, 6, 8);
    ctx.fillRect(x + 16 + flick, y + 4, 6, 16);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 16 + flick, y + 6, 4, 14);
    // Body
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 4, y + 14, 12, 12);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 4, y + 14, 12, 4);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 6, y + 22, 8, 4);
    // Head
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 2, y + 10, 10, 8);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 4, y + 14, 6, 4);
    // Ear
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 4, y + 7, 3, 4);
    // Eye
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 13, 1, 1);
    // Nose
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 2, y + 15, 1, 1);
    // Acorn in paws
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 10, y + 18, 4, 4);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 10, y + 18, 4, 1);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 11, y + 17, 2, 1);
  }
};

if (typeof module !== 'undefined') module.exports = ANIMALS;
