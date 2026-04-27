// BLACKROAD OS - AGENT PRESETS (extended identity roster)
// Brand-safe palette only

const AGENT_EXTRA = {
  presets: {
    CORDELIA: { skin: 'light',  hair: 'red',    hairLong: true, eyes: 'green', shirt: '#FF1D6C', shirtDark: '#c41758' },
    GAIA:     { skin: 'medium', hair: 'brown',  hairLong: true, eyes: 'green', shirt: '#3a8a4a', shirtDark: '#2a6a3a' },
    CECILIA:  { skin: 'light',  hair: 'blonde', hairLong: true, eyes: 'blue',  shirt: '#F5A623', shirtDark: '#c4851c' },
    GEMATRIA: { skin: 'medium', hair: 'black',  hairLong: true, eyes: 'brown', shirt: '#9C27B0', shirtDark: '#7b1f8c' },
    ARIA:     { skin: 'light',  hair: 'brown',                  eyes: 'blue',  shirt: '#2979FF', shirtDark: '#1f5fcc' },
    SHELLFISH:{ skin: 'dark',   hair: 'black',                  eyes: 'brown', shirt: '#1a1a1a', shirtDark: '#0a0a0a' },
    OCTAVIA2: { skin: 'medium', hair: 'gray',   hairLong: true, eyes: 'gray',  shirt: '#9C27B0', shirtDark: '#7b1f8c' },
    ALEXA:    { skin: 'light',  hair: 'blonde', hairLong: true, eyes: 'blue',  shirt: '#FFFFFF', shirtDark: '#cccccc' }
  }
};

if (typeof module !== 'undefined') module.exports = AGENT_EXTRA;
