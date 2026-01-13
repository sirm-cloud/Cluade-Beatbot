# Cluade-Beatbot

A simple yet powerful drum pattern generator and sequencer for creating rhythmic beats programmatically.

## Features

- **Pattern Sequencer**: Create custom drum patterns with 5 instruments (kick, snare, hihat, clap, tom)
- **Preset Patterns**: 6 built-in patterns including basic rock, four-on-floor, breakbeat, hip-hop, jungle, and minimal techno
- **Random Generation**: Generate random drum patterns with configurable density
- **BPM Control**: Set tempo from 40 to 240 BPM
- **Pattern Export**: Export patterns to text files
- **CLI Interface**: Easy-to-use command-line interface
- **Python API**: Use as a library in your own projects

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd Cluade-Beatbot

# Install dependencies
pip install -r requirements.txt

# Install the package
pip install -e .
```

## Quick Start

### Command Line Usage

```bash
# List all available preset patterns
beatbot list

# Show a specific preset pattern
beatbot show hip_hop

# Create a pattern from a preset
beatbot create --pattern basic_rock --bpm 130

# Generate a random pattern
beatbot create --random --bpm 140 --density 0.5

# Export a pattern to a file
beatbot create --pattern jungle --export my_beat.txt
```

### Python API Usage

```python
from beatbot import BeatSequencer, PRESET_PATTERNS

# Create a sequencer
sequencer = BeatSequencer(bpm=128, steps=16)

# Build a pattern manually
sequencer.set_step("kick", 0, 1)
sequencer.set_step("kick", 4, 1)
sequencer.set_step("snare", 4, 1)
sequencer.set_step("hihat", 2, 1)

# Or load a preset
sequencer.load_pattern(PRESET_PATTERNS["hip_hop"])

# Or generate randomly
sequencer.generate_random_pattern(density=0.4)

# Display the pattern
sequencer.print_pattern()
```

## Available Instruments

- **kick**: Bass drum
- **snare**: Snare drum
- **hihat**: Hi-hat cymbal
- **clap**: Hand clap
- **tom**: Tom drum

## Preset Patterns

- **basic_rock**: Classic rock drum beat
- **four_on_floor**: Electronic dance music staple
- **breakbeat**: Syncopated break beat
- **hip_hop**: Hip-hop drum pattern
- **jungle**: Fast-paced jungle/drum & bass
- **minimal_techno**: Minimal techno groove

## Examples

Check out the `examples/` directory for more detailed usage examples:

```bash
python examples/basic_usage.py
```

## CLI Commands

### `create`
Create a new beat pattern

Options:
- `-p, --pattern NAME`: Load a preset pattern
- `-r, --random`: Generate a random pattern
- `-b, --bpm BPM`: Set tempo (default: 120)
- `-s, --steps STEPS`: Number of steps (default: 16)
- `-d, --density DENSITY`: Density for random patterns (0.0-1.0, default: 0.3)
- `-e, --export FILE`: Export pattern to file

### `list`
List all available preset patterns

### `show NAME`
Display a specific preset pattern

Options:
- `-b, --bpm BPM`: Set tempo (default: 120)

## Development

```bash
# Run the example script
python examples/basic_usage.py

# Use the CLI directly
python -m beatbot.cli create --pattern breakbeat
```

## Pattern Format

Patterns are represented as dictionaries where:
- Keys are instrument names
- Values are lists of 0s and 1s (0 = off, 1 = on)
- Default pattern length is 16 steps (one bar in 4/4 time)

Example:
```python
{
    "kick":  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    "snare": [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    "hihat": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    "clap":  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "tom":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT License

## Future Enhancements

Potential features for future development:
- Audio playback with actual drum samples
- MIDI export functionality
- More complex time signatures
- Swing/groove control
- Pattern variations and fills
- Web interface
- Real-time playback with visual feedback