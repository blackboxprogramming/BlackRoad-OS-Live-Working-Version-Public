// PIXEL FOUNDRY — variant explosion helper
// Usage: variants(KITCHEN.fridge, { finish: ['steel', 'white'], size: ['m', 'l'] })
// → returns array of { label, opts, draw } combos

const VARIANTS = {
  // Cartesian product over named axes
  expand(axes) {
    const keys = Object.keys(axes);
    if (keys.length === 0) return [{}];
    const out = [];
    const walk = (i, acc) => {
      if (i === keys.length) { out.push({ ...acc }); return; }
      for (const v of axes[keys[i]]) walk(i + 1, { ...acc, [keys[i]]: v });
    };
    walk(0, {});
    return out;
  },

  // Build a list of variant tiles for a base function that takes (ctx, x, y, opts, time)
  build(baseFn, axes, baseLabel) {
    return this.expand(axes).map(opts => ({
      label: baseLabel + ' · ' + Object.values(opts).join(' · '),
      opts,
      axes,
      draw: (ctx, x, y, time) => baseFn(ctx, x, y, opts, time)
    }));
  },

  // Quick palette — 8 brand-safe colorways
  palette: {
    pink:    { name: 'pink',    main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:   { name: 'amber',   main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet:  { name: 'violet',  main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:    { name: 'blue',    main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:   { name: 'white',   main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:   { name: 'black',   main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:    { name: 'wood',    main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    stone:   { name: 'stone',   main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' }
  },

  // Sizes (multiplier on base sprite dims)
  size: { s: 0.75, m: 1, l: 1.5 }
};

if (typeof module !== 'undefined') module.exports = VARIANTS;
