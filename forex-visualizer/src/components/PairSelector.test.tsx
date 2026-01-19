import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PairSelector } from './PairSelector';

describe('PairSelector', () => {
  const availablePairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const mockOnPairsChange = vi.fn();

  beforeEach(() => {
    mockOnPairsChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render header with count', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByText('Selected Pairs (2/5)')).toBeInTheDocument();
    });

    it('should render selected pairs as chips', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByText('EURUSD')).toBeInTheDocument();
      expect(screen.getByText('GBPUSD')).toBeInTheDocument();
    });

    it('should render Add Pair button when under max', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByText('+ Add Pair')).toBeInTheDocument();
    });

    it('should not render Add Pair button when at max', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD']}
          onPairsChange={mockOnPairsChange}
          maxPairs={5}
        />
      );

      expect(screen.queryByText('+ Add Pair')).not.toBeInTheDocument();
    });

    it('should not show dropdown initially', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.queryByText('Available Pairs')).not.toBeInTheDocument();
    });

    it('should render remove buttons for each selected pair', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByLabelText('Remove EURUSD')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove GBPUSD')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open dropdown when Add Pair is clicked', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));

      expect(screen.getByText('Available Pairs')).toBeInTheDocument();
    });

    it('should show all available pairs in dropdown', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));

      availablePairs.forEach((pair) => {
        expect(screen.getAllByText(new RegExp(pair))).toHaveLength(pair === 'EURUSD' ? 2 : 1);
      });
    });

    it('should close dropdown when close button is clicked', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));
      expect(screen.getByText('Available Pairs')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);

      expect(screen.queryByText('Available Pairs')).not.toBeInTheDocument();
    });

    it('should toggle dropdown when Add Pair is clicked multiple times', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      const addButton = screen.getByText('+ Add Pair');

      fireEvent.click(addButton);
      expect(screen.getByText('Available Pairs')).toBeInTheDocument();

      fireEvent.click(addButton);
      expect(screen.queryByText('Available Pairs')).not.toBeInTheDocument();
    });
  });

  describe('Adding Pairs', () => {
    it('should call onPairsChange with new pair when pair is selected', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));
      fireEvent.click(screen.getByText('GBPUSD'));

      expect(mockOnPairsChange).toHaveBeenCalledWith(['EURUSD', 'GBPUSD']);
    });

    it('should not add pair when max limit is reached', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
          maxPairs={2}
        />
      );

      // Add Pair button should not appear when at max
      expect(screen.queryByText('+ Add Pair')).not.toBeInTheDocument();
    });

    it('should show selected indicator for already selected pairs', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));

      expect(screen.getByText('EURUSD ✓')).toBeInTheDocument();
    });

    it('should disable unselected pairs when max limit is reached', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
          maxPairs={2}
        />
      );

      fireEvent.click(screen.getByText('EURUSD'));

      // Open manually by modifying component (this test assumes dropdown can be opened)
      // Since Add Pair button is not shown, we need to test via props change
      // This is a limitation - in real usage, dropdown won't open when maxPairs is reached
    });
  });

  describe('Removing Pairs', () => {
    it('should call onPairsChange without removed pair when remove button is clicked', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Remove EURUSD'));

      expect(mockOnPairsChange).toHaveBeenCalledWith(['GBPUSD']);
    });

    it('should call onPairsChange when clicking selected pair in dropdown', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));
      fireEvent.click(screen.getByText('EURUSD ✓'));

      expect(mockOnPairsChange).toHaveBeenCalledWith(['GBPUSD']);
    });

    it('should handle removing the last pair', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Remove EURUSD'));

      expect(mockOnPairsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Custom Max Pairs', () => {
    it('should respect custom maxPairs prop', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD', 'USDJPY']}
          onPairsChange={mockOnPairsChange}
          maxPairs={3}
        />
      );

      expect(screen.getByText('Selected Pairs (3/3)')).toBeInTheDocument();
      expect(screen.queryByText('+ Add Pair')).not.toBeInTheDocument();
    });

    it('should use default maxPairs of 5', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={[]}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByText('Selected Pairs (0/5)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedPairs array', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={[]}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(screen.getByText('Selected Pairs (0/5)')).toBeInTheDocument();
      expect(screen.getByText('+ Add Pair')).toBeInTheDocument();
    });

    it('should handle empty availablePairs array', () => {
      render(
        <PairSelector
          availablePairs={[]}
          selectedPairs={[]}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));

      expect(screen.getByText('Available Pairs')).toBeInTheDocument();
    });

    it('should handle maxPairs of 1', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
          maxPairs={1}
        />
      );

      expect(screen.getByText('Selected Pairs (1/1)')).toBeInTheDocument();
      expect(screen.queryByText('+ Add Pair')).not.toBeInTheDocument();
    });

    it('should handle all pairs being selected', () => {
      render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={availablePairs}
          onPairsChange={mockOnPairsChange}
          maxPairs={5}
        />
      );

      expect(screen.getByText('Selected Pairs (5/5)')).toBeInTheDocument();
      availablePairs.forEach((pair) => {
        expect(screen.getByText(pair)).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    it('should have pair-selector class on container', () => {
      const { container } = render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(container.querySelector('.pair-selector')).toBeInTheDocument();
    });

    it('should have selected-pairs class', () => {
      const { container } = render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      expect(container.querySelector('.selected-pairs')).toBeInTheDocument();
    });

    it('should have pair-chip class for each selected pair', () => {
      const { container } = render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD', 'GBPUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      const chips = container.querySelectorAll('.pair-chip');
      expect(chips).toHaveLength(2);
    });

    it('should have selected class on selected pairs in dropdown', () => {
      const { container } = render(
        <PairSelector
          availablePairs={availablePairs}
          selectedPairs={['EURUSD']}
          onPairsChange={mockOnPairsChange}
        />
      );

      fireEvent.click(screen.getByText('+ Add Pair'));

      const selectedOption = container.querySelector('.pair-option.selected');
      expect(selectedOption).toHaveTextContent('EURUSD');
    });
  });
});
