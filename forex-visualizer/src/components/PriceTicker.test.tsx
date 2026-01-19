import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceTicker } from './PriceTicker';
import type { ForexPrice } from '../types/primeapi';

// Helper to create mock forex price
function createMockPrice(overrides?: Partial<ForexPrice>): ForexPrice {
  return {
    symbol: 'EURUSD',
    bid: 1.08500,
    ask: 1.08515,
    spread: 0.00015,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('PriceTicker', () => {
  describe('Rendering', () => {
    it('should render symbol', () => {
      const price = createMockPrice({ symbol: 'GBPUSD' });
      render(<PriceTicker price={price} />);

      expect(screen.getByText('GBPUSD')).toBeInTheDocument();
    });

    it('should render bid price', () => {
      const price = createMockPrice({ bid: 1.08500 });
      const { container } = render(<PriceTicker price={price} />);

      expect(screen.getByText('BID')).toBeInTheDocument();
      const bidSection = container.querySelector('.price-item.bid');
      expect(bidSection).toHaveTextContent('1');
      expect(bidSection).toHaveTextContent('.08500');
    });

    it('should render ask price', () => {
      const price = createMockPrice({ ask: 1.08515 });
      render(<PriceTicker price={price} />);

      expect(screen.getByText('ASK')).toBeInTheDocument();
      expect(screen.getByText('.08515')).toBeInTheDocument();
    });

    it('should render mid-price label', () => {
      const price = createMockPrice();
      render(<PriceTicker price={price} />);

      expect(screen.getByText('MID PRICE')).toBeInTheDocument();
    });

    it('should render spread label', () => {
      const price = createMockPrice();
      render(<PriceTicker price={price} />);

      expect(screen.getByText('SPREAD')).toBeInTheDocument();
    });

    it('should render timestamp', () => {
      const price = createMockPrice({ timestamp: new Date('2024-01-01T12:00:00').getTime() });
      render(<PriceTicker price={price} />);

      // Check that time is displayed (format will vary by locale)
      const time = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(time).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('should format prices with 5 decimal places', () => {
      const price = createMockPrice({ bid: 1.234567, ask: 1.234789 });
      render(<PriceTicker price={price} />);

      // Bid should be 1.23457 (rounded)
      expect(screen.getByText('.23457')).toBeInTheDocument();
      // Ask should be 1.23479 (rounded)
      expect(screen.getByText('.23479')).toBeInTheDocument();
    });

    it('should split price into whole and decimal parts', () => {
      const price = createMockPrice({ bid: 123.45678 });
      const { container } = render(<PriceTicker price={price} />);

      const wholePrice = container.querySelector('.price-whole');
      const decimalPrice = container.querySelector('.price-decimal');

      expect(wholePrice).toHaveTextContent('123');
      expect(decimalPrice).toHaveTextContent('.45678');
    });

    it('should handle zero values', () => {
      const price = createMockPrice({ bid: 0.00001, ask: 0.00002 });
      const { container } = render(<PriceTicker price={price} />);

      const bidSection = container.querySelector('.price-item.bid');
      const askSection = container.querySelector('.price-item.ask');

      expect(bidSection).toHaveTextContent('0');
      expect(bidSection).toHaveTextContent('.00001');
      expect(askSection).toHaveTextContent('0');
      expect(askSection).toHaveTextContent('.00002');
    });

    it('should handle large values', () => {
      const price = createMockPrice({ bid: 12345.67890 });
      render(<PriceTicker price={price} />);

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('.67890')).toBeInTheDocument();
    });
  });

  describe('Spread Calculation', () => {
    it('should display spread in pips', () => {
      // Spread of 0.00015 = 1.5 pips
      const price = createMockPrice({ spread: 0.00015 });
      render(<PriceTicker price={price} />);

      expect(screen.getByText('1.5 pips')).toBeInTheDocument();
    });

    it('should format spread with one decimal place', () => {
      const price = createMockPrice({ spread: 0.00023 });
      render(<PriceTicker price={price} />);

      // 0.00023 * 10000 = 2.3 pips
      expect(screen.getByText('2.3 pips')).toBeInTheDocument();
    });

    it('should handle whole number spread', () => {
      const price = createMockPrice({ spread: 0.00020 });
      render(<PriceTicker price={price} />);

      // 0.00020 * 10000 = 2.0 pips
      expect(screen.getByText('2.0 pips')).toBeInTheDocument();
    });

    it('should handle very small spread', () => {
      const price = createMockPrice({ spread: 0.00001 });
      render(<PriceTicker price={price} />);

      // 0.00001 * 10000 = 0.1 pips
      expect(screen.getByText('0.1 pips')).toBeInTheDocument();
    });

    it('should handle large spread for exotic pairs', () => {
      // USD/CNY might have larger spread
      const price = createMockPrice({ spread: 0.00500 });
      render(<PriceTicker price={price} />);

      // 0.00500 * 10000 = 50.0 pips
      expect(screen.getByText('50.0 pips')).toBeInTheDocument();
    });
  });

  describe('Mid-Price Calculation', () => {
    it('should calculate mid-price correctly', () => {
      const price = createMockPrice({ bid: 1.08500, ask: 1.08520 });
      render(<PriceTicker price={price} />);

      // Mid = (1.08500 + 1.08520) / 2 = 1.08510
      expect(screen.getByText('1.08510')).toBeInTheDocument();
    });

    it('should display mid-price with 5 decimals', () => {
      const price = createMockPrice({ bid: 1.234, ask: 1.236 });
      render(<PriceTicker price={price} />);

      // Mid = 1.235
      expect(screen.getByText('1.23500')).toBeInTheDocument();
    });
  });

  describe('Direction Indicators', () => {
    it('should initially show neutral indicator', () => {
      const price = createMockPrice();
      const { container } = render(<PriceTicker price={price} />);

      const changeText = container.querySelector('.ticker-change');
      expect(changeText).toHaveTextContent('−');
    });

    it('should show up arrow after price increase', () => {
      const price1 = createMockPrice({ bid: 1.08500, ask: 1.08515 });
      const { rerender } = render(<PriceTicker price={price1} />);

      // Update with higher price
      const price2 = createMockPrice({ bid: 1.08600, ask: 1.08615, timestamp: Date.now() + 1000 });
      rerender(<PriceTicker price={price2} />);

      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should show down arrow after price decrease', () => {
      const price1 = createMockPrice({ bid: 1.08500, ask: 1.08515 });
      const { rerender } = render(<PriceTicker price={price1} />);

      // Update with lower price
      const price2 = createMockPrice({ bid: 1.08400, ask: 1.08415, timestamp: Date.now() + 1000 });
      rerender(<PriceTicker price={price2} />);

      expect(screen.getByText('↓')).toBeInTheDocument();
    });
  });

  describe('Price Change Display', () => {
    it('should calculate price change correctly', () => {
      const price1 = createMockPrice({ bid: 1.08500, ask: 1.08515 });
      const { rerender } = render(<PriceTicker price={price1} />);

      // Update with price that increased (mid from 1.085075 to 1.086075 = +0.00100)
      const price2 = createMockPrice({ bid: 1.08600, ask: 1.08615, timestamp: Date.now() + 1000 });
      rerender(<PriceTicker price={price2} />);

      // Should show +0.00100
      expect(screen.getByText(/\+0\.00100/)).toBeInTheDocument();
    });

    it('should show percentage change', () => {
      const price1 = createMockPrice({ bid: 1.00000, ask: 1.00020 });
      const { rerender } = render(<PriceTicker price={price1} />);

      // Increase by 1% (mid from 1.00010 to 1.01010)
      const price2 = createMockPrice({ bid: 1.01000, ask: 1.01020, timestamp: Date.now() + 1000 });
      rerender(<PriceTicker price={price2} />);

      // Should show percentage
      expect(screen.getByText(/\(.*1\.00.*%\)/)).toBeInTheDocument();
    });

    it('should handle negative price change', () => {
      const price1 = createMockPrice({ bid: 1.08500, ask: 1.08515 });
      const { rerender } = render(<PriceTicker price={price1} />);

      // Decrease price (mid from 1.085075 to 1.084075 = -0.00100)
      const price2 = createMockPrice({ bid: 1.08400, ask: 1.08415, timestamp: Date.now() + 1000 });
      rerender(<PriceTicker price={price2} />);

      // Should show negative change
      expect(screen.getByText(/-0\.00100/)).toBeInTheDocument();
    });
  });

  describe('Different Currency Pairs', () => {
    it('should handle JPY pairs with larger values', () => {
      const price = createMockPrice({
        symbol: 'USDJPY',
        bid: 148.500,
        ask: 148.515,
        spread: 0.015
      });
      const { container } = render(<PriceTicker price={price} />);

      expect(screen.getByText('USDJPY')).toBeInTheDocument();
      const bidSection = container.querySelector('.price-item.bid');
      expect(bidSection).toHaveTextContent('148');
      expect(bidSection).toHaveTextContent('.50000');
    });

    it('should handle pairs with very small values', () => {
      const price = createMockPrice({
        symbol: 'AUDUSD',
        bid: 0.63500,
        ask: 0.63518,
        spread: 0.00018
      });
      const { container } = render(<PriceTicker price={price} />);

      expect(screen.getByText('AUDUSD')).toBeInTheDocument();
      const bidSection = container.querySelector('.price-item.bid');
      expect(bidSection).toHaveTextContent('0');
      expect(bidSection).toHaveTextContent('.63500');
    });

    it('should handle exotic pairs with large spreads', () => {
      const price = createMockPrice({
        symbol: 'USDKRW',
        bid: 1342.00,
        ask: 1342.50,
        spread: 0.50
      });
      render(<PriceTicker price={price} />);

      // Spread of 0.50 * 10000 = 5000 pips
      expect(screen.getByText('5000.0 pips')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should have price-ticker class on container', () => {
      const price = createMockPrice();
      const { container } = render(<PriceTicker price={price} />);

      expect(container.querySelector('.price-ticker')).toBeInTheDocument();
    });

    it('should have ticker-header class', () => {
      const price = createMockPrice();
      const { container } = render(<PriceTicker price={price} />);

      expect(container.querySelector('.ticker-header')).toBeInTheDocument();
    });

    it('should have bid-ask-section class', () => {
      const price = createMockPrice();
      const { container } = render(<PriceTicker price={price} />);

      expect(container.querySelector('.bid-ask-section')).toBeInTheDocument();
    });

    it('should have mid-spread-section class', () => {
      const price = createMockPrice();
      const { container } = render(<PriceTicker price={price} />);

      expect(container.querySelector('.mid-spread-section')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle equal bid and ask (zero spread)', () => {
      const price = createMockPrice({ bid: 1.08500, ask: 1.08500, spread: 0 });
      render(<PriceTicker price={price} />);

      expect(screen.getByText('0.0 pips')).toBeInTheDocument();
      expect(screen.getByText('1.08500')).toBeInTheDocument(); // Mid price
    });

    it('should handle very precise spread values', () => {
      const price = createMockPrice({ spread: 0.000123 });
      render(<PriceTicker price={price} />);

      // 0.000123 * 10000 = 1.23 => 1.2 pips (one decimal)
      expect(screen.getByText('1.2 pips')).toBeInTheDocument();
    });

    it('should update when symbol changes', () => {
      const price1 = createMockPrice({ symbol: 'EURUSD' });
      const { rerender } = render(<PriceTicker price={price1} />);

      expect(screen.getByText('EURUSD')).toBeInTheDocument();

      const price2 = createMockPrice({ symbol: 'GBPUSD' });
      rerender(<PriceTicker price={price2} />);

      expect(screen.getByText('GBPUSD')).toBeInTheDocument();
      expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    });
  });
});
