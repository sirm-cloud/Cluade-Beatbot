#!/usr/bin/env python3
"""
Example usage of the Cluade-Beatbot library
"""

from beatbot import BeatSequencer, PRESET_PATTERNS


def main():
    print("=== Cluade-Beatbot Examples ===\n")

    # Example 1: Create an empty sequencer and build a pattern manually
    print("1. Creating a custom pattern manually:")
    sequencer = BeatSequencer(bpm=128, steps=16)

    # Add kicks on beats 1, 5, 9, 13 (downbeats)
    for step in [0, 4, 8, 12]:
        sequencer.set_step("kick", step, 1)

    # Add snares on beats 5, 13 (backbeats)
    sequencer.set_step("snare", 4, 1)
    sequencer.set_step("snare", 12, 1)

    # Add hi-hats on every other step
    for step in range(0, 16, 2):
        sequencer.set_step("hihat", step, 1)

    sequencer.print_pattern()

    # Example 2: Load a preset pattern
    print("\n2. Loading a preset pattern (hip_hop):")
    sequencer2 = BeatSequencer(bpm=95)
    sequencer2.load_pattern(PRESET_PATTERNS["hip_hop"])
    sequencer2.print_pattern()

    # Example 3: Generate a random pattern
    print("\n3. Generating a random pattern:")
    sequencer3 = BeatSequencer(bpm=140)
    sequencer3.generate_random_pattern(density=0.4)
    sequencer3.print_pattern()

    # Example 4: Export pattern
    print("\n4. Exporting pattern to string:")
    export_str = sequencer2.export_pattern()
    print(export_str)

    # Example 5: List all available presets
    print("\n5. Available preset patterns:")
    for pattern_name in PRESET_PATTERNS.keys():
        print(f"   - {pattern_name}")

    # Example 6: Change tempo
    print("\n6. Changing tempo:")
    sequencer.set_bpm(180)
    print(f"New BPM: {sequencer.bpm}")
    step_duration = sequencer.get_step_duration()
    print(f"Step duration: {step_duration:.4f} seconds")


if __name__ == "__main__":
    main()
