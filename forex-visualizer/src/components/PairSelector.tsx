import { useState } from 'react';
import './PairSelector.css';

interface PairSelectorProps {
  availablePairs: string[];
  selectedPairs: string[];
  onPairsChange: (pairs: string[]) => void;
  maxPairs?: number;
}

export function PairSelector({
  availablePairs,
  selectedPairs,
  onPairsChange,
  maxPairs = 5,
}: PairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTogglePair = (pair: string) => {
    if (selectedPairs.includes(pair)) {
      onPairsChange(selectedPairs.filter((p) => p !== pair));
    } else {
      if (selectedPairs.length < maxPairs) {
        onPairsChange([...selectedPairs, pair]);
      }
    }
  };

  const handleRemovePair = (pair: string) => {
    onPairsChange(selectedPairs.filter((p) => p !== pair));
  };

  return (
    <div className="pair-selector">
      <div className="selected-pairs">
        <h3>Selected Pairs ({selectedPairs.length}/{maxPairs})</h3>
        <div className="pair-chips">
          {selectedPairs.map((pair) => (
            <div key={pair} className="pair-chip">
              {pair}
              <button
                className="remove-btn"
                onClick={() => handleRemovePair(pair)}
                aria-label={`Remove ${pair}`}
              >
                ×
              </button>
            </div>
          ))}
          {selectedPairs.length < maxPairs && (
            <button
              className="add-pair-btn"
              onClick={() => setIsOpen(!isOpen)}
            >
              + Add Pair
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="pair-dropdown">
          <div className="dropdown-header">
            <h4>Available Pairs</h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="pair-list">
            {availablePairs.map((pair) => (
              <button
                key={pair}
                className={`pair-option ${
                  selectedPairs.includes(pair) ? 'selected' : ''
                }`}
                onClick={() => handleTogglePair(pair)}
                disabled={
                  selectedPairs.length >= maxPairs &&
                  !selectedPairs.includes(pair)
                }
              >
                {pair}
                {selectedPairs.includes(pair) && ' ✓'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
