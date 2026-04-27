// PIXEL FOUNDRY — GARDEN
// shovel, rake, hoe, wateringCan, gloves, wheelbarrow, seedPacket, plantPot, hose, gardenGnome

const GARDEN = {
  AXES: {
    shovel:      { color: ['amber','blue','red','black'] },
    wateringCan: { color: ['pink','amber','violet','blue','white','green'] },
    gloves:      { color: ['pink','amber','violet','blue','green','white'] },
    seedPacket:  { kind: ['rose','sunflower','carrot','tomato'] },
    plantPot:    { color: ['terra','pink','amber','violet','blue','stone'], plant: ['empty','sprout','flower','leafy'] },
    gardenGnome: { color: ['red','blue','amber','violet'] }
  },

  // SHOVEL (28x60)
  shovel(ctx, x, y, opts = {}, time = 0) {
    const handleColor = opts.color === 'amber' ? '#daa86a' : opts.color === 'blue' ? '#5a9fff' : opts.color === 'red' ? '#FF1D6C' : '#3a3a3e';
    // Handle
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 12, y, 4, 38);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 13, y, 2, 38);
    // T-grip
    ctx.fillStyle = handleColor;
    ctx.fillRect(x + 6, y, 16, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 4, 16, 1);
    // Ferrule
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 11, y + 38, 6, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 12, y + 39, 4, 1);
    // Blade
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 42); ctx.lineTo(x + 20, y + 42);
    ctx.lineTo(x + 22, y + 54); ctx.lineTo(x + 14, y + 60);
    ctx.lineTo(x + 6, y + 54);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 43); ctx.lineTo(x + 19, y + 43);
    ctx.lineTo(x + 21, y + 53); ctx.lineTo(x + 14, y + 58);
    ctx.lineTo(x + 7, y + 53);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 9, y + 44, 10, 2);
    // Dirt
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 10, y + 50, 8, 4);
    [11, 13, 15, 17].forEach(px => ctx.fillRect(x + px, y + 49, 1, 1));
  },

  // RAKE (32x60)
  rake(ctx, x, y, time = 0) {
    // Handle
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 14, y, 4, 50);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 15, y, 2, 50);
    // Grip
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 13, y, 6, 4);
    // Connector
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 12, y + 50, 8, 4);
    // Tines
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 54, 32, 2);
    [0, 5, 10, 15, 20, 25, 30].forEach(px => ctx.fillRect(x + px, y + 56, 2, 4));
    ctx.fillStyle = '#5a5a60';
    [0, 5, 10, 15, 20, 25, 30].forEach(px => ctx.fillRect(x + px + 1, y + 58, 1, 2));
    // Leaves caught in tines
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 8, y + 56, 3, 2);
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 22, y + 56, 3, 2);
  },

  // HOE (32x60)
  hoe(ctx, x, y, time = 0) {
    // Handle
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 14, y, 4, 48);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 15, y, 2, 48);
    // Grip
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 13, y, 6, 4);
    // Connector
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 12, y + 48, 8, 4);
    // Blade — flat angled
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 52); ctx.lineTo(x + 14, y + 56);
    ctx.lineTo(x + 4, y + 60); ctx.lineTo(x + 4, y + 56);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(x + 13, y + 53); ctx.lineTo(x + 13, y + 56);
    ctx.lineTo(x + 5, y + 59); ctx.lineTo(x + 5, y + 56);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 5, y + 56, 8, 1);
  },

  // WATERING CAN (44x36)
  wateringCan(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:'#FF1D6C', amber:'#F5A623', violet:'#9C27B0', blue:'#2979FF', white:'#f0f0f0', green:'#3acc3a' }[opts.color || 'green'];
    const cd = { pink:'#c41758', amber:'#c4851c', violet:'#7b1f8c', blue:'#1f5fcc', white:'#c0c0c0', green:'#2a8a2a' }[opts.color || 'green'];
    const cl = { pink:'#ff5a90', amber:'#ffc46b', violet:'#c34dd6', blue:'#5a9fff', white:'#ffffff', green:'#7acc7a' }[opts.color || 'green'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 34, 36, 2);
    // Body
    ctx.fillStyle = cd;
    ctx.fillRect(x + 6, y + 12, 24, 22);
    ctx.fillStyle = c;
    ctx.fillRect(x + 7, y + 13, 22, 20);
    ctx.fillStyle = cl;
    ctx.fillRect(x + 7, y + 13, 22, 2);
    // Handle (top)
    ctx.strokeStyle = cd;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + 18, y + 8, 7, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    // Side handle
    ctx.fillStyle = cd;
    ctx.fillRect(x + 28, y + 16, 2, 14);
    ctx.fillRect(x + 30, y + 18, 2, 10);
    // Spout
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 16); ctx.lineTo(x + 4, y + 12);
    ctx.lineTo(x, y + 6); ctx.lineTo(x + 2, y + 4);
    ctx.lineTo(x + 6, y + 8); ctx.lineTo(x + 8, y + 14);
    ctx.closePath(); ctx.fill();
    // Sprinkler head
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 4, 6, 4);
    [1, 3, 5].forEach(dx => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + dx, y + 5, 1, 2);
    });
    // Water stream
    if (Math.floor(time / 6) % 2) {
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 1, y + 8, 1, 16);
      ctx.fillRect(x + 3, y + 10, 1, 14);
      ctx.fillRect(x + 5, y + 8, 1, 16);
    }
  },

  // GLOVES (40x32)
  gloves(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:['#FF1D6C','#c41758'], amber:['#F5A623','#c4851c'], violet:['#9C27B0','#7b1f8c'], blue:['#2979FF','#1f5fcc'], green:['#3acc3a','#2a8a2a'], white:['#f0f0f0','#c0c0c0'] }[opts.color || 'green'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Left glove
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 2, y + 12, 16, 18);
    ctx.fillRect(x + 2, y + 8, 4, 8);
    ctx.fillRect(x + 6, y + 6, 3, 10);
    ctx.fillRect(x + 9, y + 4, 3, 12);
    ctx.fillRect(x + 12, y + 6, 3, 10);
    ctx.fillRect(x + 15, y + 8, 3, 8);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 3, y + 13, 14, 16);
    ctx.fillRect(x + 3, y + 8, 3, 7);
    ctx.fillRect(x + 7, y + 6, 1, 9);
    ctx.fillRect(x + 10, y + 4, 1, 11);
    ctx.fillRect(x + 13, y + 6, 1, 9);
    ctx.fillRect(x + 16, y + 8, 1, 7);
    // Cuff
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 2, y + 26, 16, 4);
    ctx.fillStyle = '#1a1a1a';
    [3, 7, 11, 15].forEach(px => ctx.fillRect(x + px, y + 27, 2, 2));
    // Right glove (mirror)
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 22, y + 12, 16, 18);
    ctx.fillRect(x + 34, y + 8, 4, 8);
    ctx.fillRect(x + 31, y + 6, 3, 10);
    ctx.fillRect(x + 28, y + 4, 3, 12);
    ctx.fillRect(x + 25, y + 6, 3, 10);
    ctx.fillRect(x + 22, y + 8, 3, 8);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 23, y + 13, 14, 16);
    // Cuff
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 22, y + 26, 16, 4);
    ctx.fillStyle = '#1a1a1a';
    [23, 27, 31, 35].forEach(px => ctx.fillRect(x + px, y + 27, 2, 2));
  },

  // WHEELBARROW (60x44)
  wheelbarrow(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 52, 2);
    // Wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 8, y + 32, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 8, y + 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath(); ctx.arc(x + 8, y + 32, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 7, y + 31, 2, 2);
    // Frame legs
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 36, y + 32, 4, 8);
    ctx.fillRect(x + 48, y + 32, 4, 8);
    // Tray
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28); ctx.lineTo(x + 16, y + 14);
    ctx.lineTo(x + 50, y + 14); ctx.lineTo(x + 56, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5a90';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 27); ctx.lineTo(x + 18, y + 16);
    ctx.lineTo(x + 49, y + 16); ctx.lineTo(x + 54, y + 27);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 6, y + 27, 48, 2);
    // Tray rim
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 16, y + 13, 34, 2);
    // Dirt + plant inside
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 16, y + 16, 34, 6);
    ctx.fillStyle = '#3acc3a';
    [22, 30, 38, 44].forEach(px => {
      ctx.fillRect(x + px, y + 12, 2, 6);
    });
    ctx.fillStyle = '#7acc7a';
    ctx.fillRect(x + 30, y + 10, 2, 4);
    // Handles
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 50, y + 16, 10, 3);
    ctx.fillRect(x + 52, y + 19, 8, 12);
  },

  // SEED PACKET (32x44)
  seedPacket(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'rose';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Packet
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 2, y + 4, 28, 38);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 3, y + 5, 26, 36);
    // Top fold
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 2, y + 4, 28, 4);
    [4, 8, 12, 16, 20, 24].forEach(px => {
      ctx.fillStyle = '#7a5028';
      ctx.fillRect(x + px, y + 4, 1, 4);
    });
    // Title bar
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 10, 24, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 11, 4, 2);
    ctx.fillRect(x + 12, y + 11, 4, 2);
    ctx.fillRect(x + 18, y + 11, 4, 2);
    // Illustration window
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 16, 24, 18);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 5, y + 17, 22, 16);
    if (kind === 'rose') {
      ctx.fillStyle = '#c41758';
      ctx.beginPath(); ctx.arc(x + 16, y + 24, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 16, y + 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a90';
      ctx.beginPath(); ctx.arc(x + 16, y + 24, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 15, y + 30, 2, 4);
      ctx.fillRect(x + 12, y + 32, 4, 2);
    } else if (kind === 'sunflower') {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 16, y + 24, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath(); ctx.arc(x + 16, y + 24, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 15, y + 30, 2, 4);
    } else if (kind === 'carrot') {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 22); ctx.lineTo(x + 18, y + 22);
      ctx.lineTo(x + 16, y + 33);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3acc3a';
      [13, 16, 19].forEach(px => ctx.fillRect(x + px, y + 18, 1, 4));
    } else if (kind === 'tomato') {
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 16, y + 26, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c41758';
      ctx.beginPath(); ctx.arc(x + 16, y + 26, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 14, y + 19, 4, 2);
      [13, 19].forEach(px => ctx.fillRect(x + px, y + 21, 1, 2));
    }
    // Info bar
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 4, y + 36, 24, 4);
    ctx.fillStyle = '#daa86a';
    [6, 12, 18, 24].forEach(px => ctx.fillRect(x + px, y + 37, 4, 1));
  },

  // PLANT POT (28x36)
  plantPot(ctx, x, y, opts = {}, time = 0) {
    const c = { terra:['#a85a26','#7a3a18','#daa86a'], pink:['#FF1D6C','#c41758','#ff5a90'], amber:['#F5A623','#c4851c','#ffc46b'], violet:['#9C27B0','#7b1f8c','#c34dd6'], blue:['#2979FF','#1f5fcc','#5a9fff'], stone:['#7a7a80','#5a5a60','#a0a0a8'] }[opts.color || 'terra'];
    const plant = opts.plant || 'sprout';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 24, 2);
    // Pot
    ctx.fillStyle = c[1];
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + 26, y + 14);
    ctx.lineTo(x + 23, y + 34); ctx.lineTo(x + 5, y + 34);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c[0];
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 15); ctx.lineTo(x + 25, y + 15);
    ctx.lineTo(x + 22, y + 33); ctx.lineTo(x + 6, y + 33);
    ctx.closePath(); ctx.fill();
    // Rim
    ctx.fillStyle = c[1];
    ctx.fillRect(x, y + 12, 28, 4);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 1, y + 13, 26, 2);
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 1, y + 13, 26, 1);
    // Soil
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 3, y + 13, 22, 4);
    ctx.fillStyle = '#5a3a1a';
    [4, 8, 12, 16, 20].forEach(px => ctx.fillRect(x + px, y + 14, 2, 1));
    // Plant
    if (plant === 'sprout') {
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 13, y + 6, 2, 8);
      ctx.fillStyle = '#7acc7a';
      ctx.fillRect(x + 9, y + 8, 4, 2);
      ctx.fillRect(x + 15, y + 6, 4, 2);
    } else if (plant === 'flower') {
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 13, y + 6, 2, 8);
      // Bloom
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 14, y + 4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a90';
      ctx.beginPath(); ctx.arc(x + 14, y + 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 13, y + 3, 2, 2);
    } else if (plant === 'leafy') {
      ctx.fillStyle = '#2a5a2a';
      [[8, 8, 5], [14, 4, 6], [20, 8, 5], [11, 0, 4], [17, 0, 4]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#3acc3a';
      [[8, 8], [14, 4], [20, 8]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#7acc7a';
      ctx.fillRect(x + 12, y + 4, 4, 2);
    }
  },

  // HOSE (52x40)
  hose(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 38, 44, 2);
    // Reel
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 16, y + 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath(); ctx.arc(x + 16, y + 20, 13, 0, Math.PI * 2); ctx.fill();
    // Hose coil rings
    ctx.strokeStyle = '#3acc3a';
    ctx.lineWidth = 2;
    [4, 6, 8, 10].forEach(r => {
      ctx.beginPath(); ctx.arc(x + 16, y + 20, r, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = '#7acc7a';
    ctx.lineWidth = 1;
    [4, 6, 8, 10].forEach(r => {
      ctx.beginPath(); ctx.arc(x + 16, y + 20, r, 0, Math.PI * 2); ctx.stroke();
    });
    // Center
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14, y + 18, 4, 4);
    // Crank
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 14, 4, 2);
    ctx.fillRect(x + 12, y + 14, 2, 4);
    // Stand
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 8, y + 36, 16, 2);
    ctx.fillRect(x + 14, y + 30, 4, 8);
    // Hose extending out
    ctx.strokeStyle = '#3acc3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 18);
    ctx.bezierCurveTo(x + 38, y + 16, x + 42, y + 28, x + 50, y + 28);
    ctx.stroke();
    ctx.strokeStyle = '#2a8a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 18);
    ctx.bezierCurveTo(x + 38, y + 16, x + 42, y + 28, x + 50, y + 28);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Nozzle
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 48, y + 26, 4, 6);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 49, y + 26, 2, 4);
    // Water
    if (Math.floor(time / 4) % 2) {
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 50, y + 26 - 4, 2, 4);
      ctx.fillRect(x + 51, y + 24 - 6, 1, 4);
    }
  },

  // GARDEN GNOME (32x44)
  gardenGnome(ctx, x, y, opts = {}, time = 0) {
    const hat = { red: '#c41758', blue: '#1f5fcc', amber: '#c4851c', violet: '#7b1f8c' }[opts.color || 'red'];
    const hatLight = { red: '#FF1D6C', blue: '#5a9fff', amber: '#F5A623', violet: '#c34dd6' }[opts.color || 'red'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 24, 2);
    // Boots
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 36, 6, 6);
    ctx.fillRect(x + 18, y + 36, 6, 6);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 8, y + 36, 6, 1);
    ctx.fillRect(x + 18, y + 36, 6, 1);
    // Pants
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 8, y + 28, 16, 10);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 9, y + 29, 14, 8);
    // Shirt
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 8, y + 22, 16, 8);
    ctx.fillStyle = '#4a9a4a';
    ctx.fillRect(x + 9, y + 23, 14, 6);
    // Belt
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 28, 16, 2);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 14, y + 28, 4, 2);
    // Beard
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 14); ctx.lineTo(x + 24, y + 14);
    ctx.lineTo(x + 22, y + 24); ctx.lineTo(x + 16, y + 26);
    ctx.lineTo(x + 10, y + 24);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    [10, 12, 16, 20, 22].forEach(px => ctx.fillRect(x + px, y + 22, 1, 3));
    // Face
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 12, y + 12, 8, 8);
    // Nose
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 14, 4, 4);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 15, y + 18, 2, 1);
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 12, y + 13, 1, 1);
    ctx.fillRect(x + 19, y + 13, 1, 1);
    // Hat (pointed)
    ctx.fillStyle = hat;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 14); ctx.lineTo(x + 24, y + 14);
    ctx.lineTo(x + 16, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = hatLight;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 14); ctx.lineTo(x + 22, y + 14);
    ctx.lineTo(x + 16, y + 2);
    ctx.closePath(); ctx.fill();
    // Hat tip
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 16, y, 2, 0, Math.PI * 2); ctx.fill();
    // Arms
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 4, y + 22, 4, 8);
    ctx.fillRect(x + 24, y + 22, 4, 8);
    // Hands
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 4, y + 28, 4, 3);
    ctx.fillRect(x + 24, y + 28, 4, 3);
  }
};

if (typeof module !== 'undefined') module.exports = GARDEN;
