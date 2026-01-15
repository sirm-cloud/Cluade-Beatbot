# Cluade-Beatbot 🎵

A simple, colorful, interactive drum machine and beat pattern generator for your terminal!

## Features

- 🥁 Visual beat sequencer in your terminal
- 🎨 Color-coded instruments with emoji representations
- 🎵 Pre-defined beat patterns (Rock, Funk, Electronic, Hip-Hop)
- ⚡ Adjustable BPM for each pattern
- 🔄 Smooth, animated playback
- 📝 Easy to extend with custom patterns

## Installation

```bash
git clone https://github.com/sirm-cloud/Cluade-Beatbot.git
cd Cluade-Beatbot
```

No dependencies required! Uses only Node.js built-in modules.

## Usage

### Play a beat pattern

```bash
node beatbot.js [pattern]
```

Available patterns:
- `basic` - Basic Rock beat (120 BPM)
- `funky` - Funky Groove (110 BPM)
- `electronic` - Electronic beat (130 BPM)
- `hiphop` - Hip-Hop beat (90 BPM)

### Examples

```bash
# Play basic rock pattern
node beatbot.js basic

# Play funky groove
node beatbot.js funky

# Demo all patterns
node beatbot.js --demo

# Show help
node beatbot.js --help
```

### Using npm scripts

```bash
npm start          # Run with default pattern
npm run demo       # Demo all patterns
```

## Instruments

The beatbot includes these instruments:

- 🥁 **Kick** - Bass drum
- 🎵 **Snare** - Snare drum
- ⚡ **Hi-Hat** - Hi-hat cymbal
- 👏 **Clap** - Hand clap
- 🔊 **Tom** - Tom drum

## How it Works

The beatbot displays a 16-step sequencer with different instruments on each row. When a step is active, it lights up and plays the corresponding sound (visually represented). The tempo is controlled by BPM (beats per minute).

```
    ▼ . . . | . . . | . . . | . . . |

🥁 Kick     █ ░ ░ ░ ▓ ░ ░ ░ ▓ ░ ░ ░ ▓ ░ ░ ░
🎵 Snare    ░ ░ ░ ░ ▓ ░ ░ ░ ░ ░ ░ ░ ▓ ░ ░ ░
⚡ Hi-Hat   ▓ ░ ▓ ░ ▓ ░ ▓ ░ ▓ ░ ▓ ░ ▓ ░ ▓ ░
```

## Requirements

- Node.js 14.0 or higher (for ES modules support)
- A terminal that supports ANSI colors

## Customization

You can easily add new patterns by editing the `patterns` object in `beatbot.js`:

```javascript
myPattern: {
  name: 'My Custom Pattern',
  bpm: 140,
  pattern: [
    {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14]
    }
  ]
}
```

Each number represents a step (0-15) where the instrument should play.

## License

MIT

## Contributing

Feel free to open issues or submit pull requests with new patterns, features, or improvements!