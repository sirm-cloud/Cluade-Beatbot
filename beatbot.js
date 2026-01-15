#!/usr/bin/env node

import { setTimeout } from 'timers/promises';

// ANSI color codes for pretty terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Drum instruments with their visual representations
const instruments = {
  kick: { symbol: '🥁', name: 'Kick', color: colors.red },
  snare: { symbol: '🎵', name: 'Snare', color: colors.yellow },
  hihat: { symbol: '⚡', name: 'Hi-Hat', color: colors.cyan },
  clap: { symbol: '👏', name: 'Clap', color: colors.green },
  tom: { symbol: '🔊', name: 'Tom', color: colors.magenta }
};

// Pre-defined beat patterns
const patterns = {
  basic: {
    name: 'Basic Rock',
    bpm: 120,
    pattern: [
      { kick: [0, 4, 8, 12], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14] }
    ]
  },
  funky: {
    name: 'Funky Groove',
    bpm: 110,
    pattern: [
      { kick: [0, 3, 6, 10], snare: [4, 12], hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], clap: [8] }
    ]
  },
  electronic: {
    name: 'Electronic',
    bpm: 130,
    pattern: [
      { kick: [0, 4, 8, 12], snare: [4, 12], hihat: [2, 6, 10, 14], clap: [4, 12] }
    ]
  },
  hiphop: {
    name: 'Hip-Hop',
    bpm: 90,
    pattern: [
      { kick: [0, 6, 10], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], clap: [4, 12] }
    ]
  }
};

class BeatBot {
  constructor(patternName = 'basic', steps = 16) {
    this.steps = steps;
    this.currentStep = 0;
    this.isPlaying = false;

    if (patterns[patternName]) {
      const p = patterns[patternName];
      this.pattern = p.pattern[0];
      this.bpm = p.bpm;
      this.patternName = p.name;
    } else {
      this.pattern = patterns.basic.pattern[0];
      this.bpm = 120;
      this.patternName = 'Basic Rock';
    }

    this.stepDuration = (60 / this.bpm / 4) * 1000; // in milliseconds
  }

  drawPattern() {
    console.clear();
    console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║      🎵 CLUADE BEATBOT v1.0 🎵        ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.bright}Pattern: ${colors.yellow}${this.patternName}${colors.reset}`);
    console.log(`${colors.bright}BPM: ${colors.green}${this.bpm}${colors.reset}\n`);

    // Draw the step indicators
    let stepIndicators = '    ';
    for (let i = 0; i < this.steps; i++) {
      if (i === this.currentStep) {
        stepIndicators += `${colors.bright}${colors.green}▼${colors.reset} `;
      } else if (i % 4 === 0) {
        stepIndicators += `${colors.bright}|${colors.reset} `;
      } else {
        stepIndicators += '. ';
      }
    }
    console.log(stepIndicators + '\n');

    // Draw each instrument line
    Object.keys(this.pattern).forEach(instrumentKey => {
      const instrument = instruments[instrumentKey];
      if (!instrument) return;

      const steps = this.pattern[instrumentKey];
      let line = `${instrument.color}${instrument.symbol} ${instrument.name.padEnd(8)}${colors.reset}`;

      for (let i = 0; i < this.steps; i++) {
        if (steps.includes(i)) {
          if (i === this.currentStep) {
            line += `${colors.bright}${instrument.color}█${colors.reset} `;
          } else {
            line += `${instrument.color}▓${colors.reset} `;
          }
        } else {
          line += '░ ';
        }
      }
      console.log(line);
    });

    console.log(`\n${colors.bright}${colors.blue}Press Ctrl+C to stop${colors.reset}`);
  }

  async play(bars = null) {
    this.isPlaying = true;
    let barCount = 0;

    while (this.isPlaying && (bars === null || barCount < bars)) {
      this.drawPattern();

      // Check which instruments hit on this step
      const hitsOnThisStep = [];
      Object.keys(this.pattern).forEach(instrumentKey => {
        const steps = this.pattern[instrumentKey];
        if (steps.includes(this.currentStep)) {
          hitsOnThisStep.push(instrumentKey);
        }
      });

      // Move to next step
      this.currentStep = (this.currentStep + 1) % this.steps;

      if (this.currentStep === 0) {
        barCount++;
      }

      await setTimeout(this.stepDuration);
    }
  }

  stop() {
    this.isPlaying = false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}${colors.cyan}Cluade BeatBot - Interactive Drum Machine${colors.reset}

${colors.bright}Usage:${colors.reset}
  node beatbot.js [pattern] [options]

${colors.bright}Patterns:${colors.reset}
  basic       - Basic Rock beat (120 BPM)
  funky       - Funky Groove (110 BPM)
  electronic  - Electronic beat (130 BPM)
  hiphop      - Hip-Hop beat (90 BPM)

${colors.bright}Options:${colors.reset}
  --demo      - Play all patterns once
  --help, -h  - Show this help message

${colors.bright}Examples:${colors.reset}
  node beatbot.js basic
  node beatbot.js funky
  node beatbot.js --demo
`);
    return;
  }

  if (args.includes('--demo')) {
    console.log(`${colors.bright}${colors.cyan}Playing all patterns...${colors.reset}\n`);
    for (const patternName of Object.keys(patterns)) {
      const bot = new BeatBot(patternName);
      await bot.play(2); // Play 2 bars of each
      await setTimeout(1000);
    }
    console.log(`\n${colors.bright}${colors.green}Demo complete!${colors.reset}`);
    return;
  }

  const patternName = args[0] || 'basic';
  const bot = new BeatBot(patternName);

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    bot.stop();
    console.log(`\n\n${colors.bright}${colors.yellow}Beatbot stopped. Thanks for jamming! 🎵${colors.reset}\n`);
    process.exit(0);
  });

  await bot.play();
}

main().catch(console.error);
