"""
Cluade-Beatbot: A simple drum pattern generator and sequencer
"""

__version__ = "0.1.0"

from beatbot.sequencer import BeatSequencer
from beatbot.patterns import PRESET_PATTERNS

__all__ = ["BeatSequencer", "PRESET_PATTERNS"]
