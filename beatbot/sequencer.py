"""
Drum pattern sequencer for generating and playing beats
"""

import numpy as np
from typing import List, Dict, Tuple


class BeatSequencer:
    """A simple drum pattern sequencer"""

    INSTRUMENTS = ["kick", "snare", "hihat", "clap", "tom"]

    def __init__(self, bpm: int = 120, steps: int = 16):
        """
        Initialize the beat sequencer

        Args:
            bpm: Beats per minute (tempo)
            steps: Number of steps in the pattern (typically 16 for one bar)
        """
        self.bpm = bpm
        self.steps = steps
        self.pattern = {instrument: [0] * steps for instrument in self.INSTRUMENTS}

    def set_bpm(self, bpm: int):
        """Set the tempo in BPM"""
        self.bpm = max(40, min(240, bpm))

    def set_step(self, instrument: str, step: int, velocity: int = 1):
        """
        Set a step in the pattern

        Args:
            instrument: Name of the instrument
            step: Step number (0-indexed)
            velocity: Hit strength (0=off, 1=on)
        """
        if instrument in self.pattern and 0 <= step < self.steps:
            self.pattern[instrument][step] = velocity

    def clear_pattern(self):
        """Clear all steps in the pattern"""
        for instrument in self.pattern:
            self.pattern[instrument] = [0] * self.steps

    def load_pattern(self, pattern: Dict[str, List[int]]):
        """
        Load a pattern from a dictionary

        Args:
            pattern: Dictionary mapping instrument names to step lists
        """
        for instrument, steps in pattern.items():
            if instrument in self.pattern:
                self.pattern[instrument] = steps[:self.steps]

    def get_pattern(self) -> Dict[str, List[int]]:
        """Get the current pattern"""
        return self.pattern.copy()

    def generate_random_pattern(self, density: float = 0.3):
        """
        Generate a random drum pattern

        Args:
            density: Probability of a step being active (0.0 to 1.0)
        """
        self.clear_pattern()

        # Kick - usually on beats 1 and 3 (steps 0, 4, 8, 12)
        for step in [0, 4, 8, 12]:
            if np.random.random() < 0.8:
                self.pattern["kick"][step] = 1

        # Snare - usually on beats 2 and 4 (steps 4, 12)
        for step in [4, 12]:
            if np.random.random() < 0.7:
                self.pattern["snare"][step] = 1

        # Hi-hat - more frequent, often on every step or every other step
        for step in range(self.steps):
            if np.random.random() < density * 2:
                self.pattern["hihat"][step] = 1

        # Clap - sparse
        for step in range(self.steps):
            if np.random.random() < density * 0.5:
                self.pattern["clap"][step] = 1

        # Tom - very sparse
        for step in range(self.steps):
            if np.random.random() < density * 0.3:
                self.pattern["tom"][step] = 1

    def print_pattern(self):
        """Print the pattern in a grid format"""
        print(f"\nBeat Pattern (BPM: {self.bpm})")
        print("-" * (self.steps * 2 + 10))

        for instrument in self.INSTRUMENTS:
            row = f"{instrument:6} | "
            for step in self.pattern[instrument]:
                row += "X " if step else "- "
            print(row)
        print("-" * (self.steps * 2 + 10))

    def export_pattern(self) -> str:
        """Export pattern as a formatted string"""
        lines = []
        lines.append(f"BPM: {self.bpm}")
        lines.append(f"Steps: {self.steps}")
        for instrument in self.INSTRUMENTS:
            steps_str = "".join(str(s) for s in self.pattern[instrument])
            lines.append(f"{instrument}: {steps_str}")
        return "\n".join(lines)

    def get_step_duration(self) -> float:
        """Calculate the duration of one step in seconds"""
        # One beat = 60/bpm seconds
        # Assuming 16 steps = 4 beats (one bar in 4/4 time)
        beat_duration = 60.0 / self.bpm
        steps_per_beat = self.steps / 4
        return beat_duration / steps_per_beat
