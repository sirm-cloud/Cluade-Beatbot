"""
Command-line interface for the beatbot
"""

import sys
import argparse
from beatbot.sequencer import BeatSequencer
from beatbot.patterns import PRESET_PATTERNS, list_presets, get_preset


def create_pattern(args):
    """Create and display a new pattern"""
    sequencer = BeatSequencer(bpm=args.bpm, steps=args.steps)

    if args.pattern:
        # Load preset pattern
        preset = get_preset(args.pattern)
        if preset:
            sequencer.load_pattern(preset)
            print(f"Loaded preset pattern: {args.pattern}")
        else:
            print(f"Error: Pattern '{args.pattern}' not found")
            print(f"Available presets: {', '.join(list_presets())}")
            return
    elif args.random:
        # Generate random pattern
        sequencer.generate_random_pattern(density=args.density)
        print("Generated random pattern")
    else:
        # Empty pattern
        print("Created empty pattern")

    sequencer.print_pattern()

    if args.export:
        with open(args.export, 'w') as f:
            f.write(sequencer.export_pattern())
        print(f"\nPattern exported to: {args.export}")


def list_patterns(args):
    """List all available preset patterns"""
    print("\nAvailable Preset Patterns:")
    print("-" * 40)
    for name in list_presets():
        print(f"  - {name}")
    print("-" * 40)
    print(f"\nTotal: {len(list_presets())} presets")


def show_pattern(args):
    """Display a specific preset pattern"""
    preset = get_preset(args.name)
    if not preset:
        print(f"Error: Pattern '{args.name}' not found")
        print(f"Available presets: {', '.join(list_presets())}")
        return

    sequencer = BeatSequencer(bpm=args.bpm)
    sequencer.load_pattern(preset)
    print(f"\nPreset Pattern: {args.name}")
    sequencer.print_pattern()


def main():
    """Main entry point for the CLI"""
    parser = argparse.ArgumentParser(
        description="Cluade-Beatbot: A simple drum pattern generator and sequencer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  beatbot create --pattern basic_rock
  beatbot create --random --bpm 140
  beatbot create --random --density 0.5 --export my_pattern.txt
  beatbot list
  beatbot show hip_hop
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new beat pattern')
    create_parser.add_argument('-p', '--pattern', type=str, help='Load a preset pattern')
    create_parser.add_argument('-r', '--random', action='store_true', help='Generate a random pattern')
    create_parser.add_argument('-b', '--bpm', type=int, default=120, help='Tempo in BPM (default: 120)')
    create_parser.add_argument('-s', '--steps', type=int, default=16, help='Number of steps (default: 16)')
    create_parser.add_argument('-d', '--density', type=float, default=0.3, help='Density for random patterns (0.0-1.0, default: 0.3)')
    create_parser.add_argument('-e', '--export', type=str, help='Export pattern to file')
    create_parser.set_defaults(func=create_pattern)

    # List command
    list_parser = subparsers.add_parser('list', help='List all available preset patterns')
    list_parser.set_defaults(func=list_patterns)

    # Show command
    show_parser = subparsers.add_parser('show', help='Display a specific preset pattern')
    show_parser.add_argument('name', type=str, help='Name of the preset pattern')
    show_parser.add_argument('-b', '--bpm', type=int, default=120, help='Tempo in BPM (default: 120)')
    show_parser.set_defaults(func=show_pattern)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    args.func(args)


if __name__ == '__main__':
    main()
