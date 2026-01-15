// Example custom beat patterns
// Copy these into the patterns object in beatbot.js to use them

export const customPatterns = {
  // Heavy metal double-kick pattern
  metal: {
    name: 'Heavy Metal',
    bpm: 180,
    pattern: [
      {
        kick: [0, 2, 4, 6, 8, 10, 12, 14],  // Fast double-kick
        snare: [4, 12],
        hihat: [1, 3, 5, 7, 9, 11, 13, 15],
        tom: [8]
      }
    ]
  },

  // Reggae one-drop pattern
  reggae: {
    name: 'Reggae One-Drop',
    bpm: 80,
    pattern: [
      {
        kick: [4, 12],
        snare: [4, 12],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14],
        clap: [8]
      }
    ]
  },

  // Breakbeat pattern
  breakbeat: {
    name: 'Breakbeat',
    bpm: 140,
    pattern: [
      {
        kick: [0, 6, 11],
        snare: [4, 13],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14],
        clap: [4]
      }
    ]
  },

  // Trap pattern
  trap: {
    name: 'Trap',
    bpm: 140,
    pattern: [
      {
        kick: [0, 6],
        snare: [4, 12],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],  // Rapid hi-hats
        clap: [4, 8, 12]
      }
    ]
  },

  // Samba pattern
  samba: {
    name: 'Samba',
    bpm: 100,
    pattern: [
      {
        kick: [0, 3, 6, 9, 12, 15],
        snare: [2, 6, 10, 14],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14],
        clap: [4, 12]
      }
    ]
  },

  // Minimal techno
  minimal: {
    name: 'Minimal Techno',
    bpm: 125,
    pattern: [
      {
        kick: [0, 4, 8, 12],
        snare: [8],
        hihat: [2, 6, 10, 14],
        clap: [4, 12]
      }
    ]
  },

  // Drum and bass
  dnb: {
    name: 'Drum & Bass',
    bpm: 174,
    pattern: [
      {
        kick: [0, 6],
        snare: [4, 13],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      }
    ]
  },

  // Jazz swing
  jazz: {
    name: 'Jazz Swing',
    bpm: 120,
    pattern: [
      {
        kick: [0, 6, 10],
        snare: [4, 12],
        hihat: [0, 3, 6, 9, 12, 15],  // Swing feel
        tom: [14]
      }
    ]
  }
};

// How to use these patterns:
// 1. Copy the pattern object you want
// 2. Paste it into the 'patterns' object in beatbot.js
// 3. Run: node beatbot.js <pattern-name>
//
// Example:
//   node beatbot.js metal
