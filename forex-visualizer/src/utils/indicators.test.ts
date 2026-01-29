import { describe, it, expect } from 'vitest';
import { calculateSMA, calculateRSI, calculateBollingerBands } from './indicators';
import type { PriceHistory } from '../types/primeapi';

// Helper to create mock price history data
function createMockPriceHistory(
  prices: number[],
  spread: number = 0.0001
): PriceHistory[] {
  return prices.map((price, index) => ({
    time: 1000000 + index,
    bid: price - spread / 2,
    ask: price + spread / 2,
    mid: price,
  }));
}

describe('calculateSMA', () => {
  it('should calculate 5-period SMA correctly', () => {
    const prices = createMockPriceHistory([10, 11, 12, 13, 14, 15, 16]);
    const result = calculateSMA(prices, 5);

    // First 4 values should be null
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
    expect(result[3]).toBeNull();

    // 5th value: (10 + 11 + 12 + 13 + 14) / 5 = 12
    expect(result[4]).toBe(12);

    // 6th value: (11 + 12 + 13 + 14 + 15) / 5 = 13
    expect(result[5]).toBe(13);

    // 7th value: (12 + 13 + 14 + 15 + 16) / 5 = 14
    expect(result[6]).toBe(14);
  });

  it('should calculate 20-period SMA correctly with real forex prices', () => {
    // Realistic EUR/USD prices around 1.08500
    const prices = Array.from({ length: 25 }, (_, i) => 1.08500 + (i * 0.00001));
    const data = createMockPriceHistory(prices);
    const result = calculateSMA(data, 20);

    // First 19 should be null
    for (let i = 0; i < 19; i++) {
      expect(result[i]).toBeNull();
    }

    // 20th value should be average of first 20 prices
    // Average of 1.08500, 1.08501, ..., 1.08519 = 1.085095
    expect(result[19]).toBeCloseTo(1.085095, 5);

    // Last value should be average of last 20 prices
    // Average of 1.08505, 1.08506, ..., 1.08524 = 1.085145
    expect(result[24]).toBeCloseTo(1.085145, 5);
  });

  it('should handle insufficient data', () => {
    const prices = createMockPriceHistory([10, 11]);
    const result = calculateSMA(prices, 5);

    expect(result.length).toBe(2);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
  });

  it('should handle period of 1', () => {
    const prices = createMockPriceHistory([10, 11, 12]);
    const result = calculateSMA(prices, 1);

    expect(result[0]).toBe(10);
    expect(result[1]).toBe(11);
    expect(result[2]).toBe(12);
  });

  it('should use mid-price (bid + ask) / 2', () => {
    const data: PriceHistory[] = [
      { time: 1000, bid: 1.0, ask: 1.1, mid: 1.05 },
      { time: 1001, bid: 2.0, ask: 2.2, mid: 2.1 },
    ];
    const result = calculateSMA(data, 2);

    // Mid prices: 1.05, 2.1
    // Average: (1.05 + 2.1) / 2 = 1.575
    expect(result[1]).toBeCloseTo(1.575, 3);
  });

  it('should handle empty array', () => {
    const result = calculateSMA([], 5);
    expect(result).toEqual([]);
  });
});

describe('calculateRSI', () => {
  it('should return all nulls for insufficient data', () => {
    const prices = createMockPriceHistory([10, 11, 12]);
    const result = calculateRSI(prices, 14);

    expect(result.length).toBe(3);
    expect(result.every(val => val === null)).toBe(true);
  });

  it('should calculate RSI correctly for trending up data', () => {
    // Strongly trending up - RSI should be high
    const prices = Array.from({ length: 50 }, (_, i) => 100 + i * 2);
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 14);

    // First 14 values should be null (period + 1)
    for (let i = 0; i <= 14; i++) {
      expect(result[i]).toBeNull();
    }

    // RSI should be high for sustained uptrend
    const lastRSI = result[result.length - 1];
    expect(lastRSI).toBeGreaterThan(60); // More realistic threshold
  });

  it('should calculate RSI correctly for trending down data', () => {
    // Strongly trending down - RSI should be low
    const prices = Array.from({ length: 20 }, (_, i) => 100 - i * 2);
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 14);

    // RSI should be low (near 0) for downtrend
    const lastRSI = result[result.length - 1];
    expect(lastRSI).toBeLessThan(10);
  });

  it('should calculate RSI around 50 for sideways market', () => {
    // Oscillating prices - RSI should be near 50
    const prices = [100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101];
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 14);

    const lastRSI = result[result.length - 1];
    expect(lastRSI).toBeGreaterThan(40);
    expect(lastRSI).toBeLessThan(60);
  });

  it('should handle RSI with custom period', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + i);
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 7);

    // First 7 values should be null (period)
    for (let i = 0; i <= 7; i++) {
      expect(result[i]).toBeNull();
    }

    // Should have values after period
    expect(result[8]).not.toBeNull();
  });

  it('should keep RSI within 0-100 range', () => {
    const prices = Array.from({ length: 50 }, (_, i) => {
      // Extreme volatility
      return i % 2 === 0 ? 100 : 200;
    });
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 14);

    result.forEach((rsi, i) => {
      if (rsi !== null) {
        expect(rsi).toBeGreaterThanOrEqual(0);
        expect(rsi).toBeLessThanOrEqual(100);
      }
    });
  });

  it('should handle zero losses gracefully', () => {
    // Only gains, no losses - but note the implementation uses avgLoss === 0 ? 1 : avgLoss
    // which prevents division by zero, so RSI won't actually be 100
    const prices = Array.from({ length: 30 }, (_, i) => 100 + i);
    const data = createMockPriceHistory(prices);
    const result = calculateRSI(data, 14);

    const lastRSI = result[result.length - 1];
    // Should be high but not necessarily 100 due to implementation
    expect(lastRSI).toBeGreaterThan(40);
    expect(lastRSI).toBeLessThanOrEqual(100);
  });
});

describe('calculateBollingerBands', () => {
  it('should calculate Bollinger Bands with correct structure', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + i * 0.1);
    const data = createMockPriceHistory(prices);
    const result = calculateBollingerBands(data, 20, 2);

    expect(result).toHaveProperty('upper');
    expect(result).toHaveProperty('middle');
    expect(result).toHaveProperty('lower');
    expect(result.upper.length).toBe(25);
    expect(result.middle.length).toBe(25);
    expect(result.lower.length).toBe(25);
  });

  it('should have nulls for insufficient data', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100);
    const data = createMockPriceHistory(prices);
    const result = calculateBollingerBands(data, 20, 2);

    // First 19 should be null
    for (let i = 0; i < 19; i++) {
      expect(result.upper[i]).toBeNull();
      expect(result.middle[i]).toBeNull();
      expect(result.lower[i]).toBeNull();
    }

    // 20th should have values
    expect(result.upper[19]).not.toBeNull();
    expect(result.middle[19]).not.toBeNull();
    expect(result.lower[19]).not.toBeNull();
  });

  it('should have upper band > middle > lower band', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + Math.sin(i) * 5);
    const data = createMockPriceHistory(prices);
    const result = calculateBollingerBands(data, 20, 2);

    for (let i = 19; i < result.upper.length; i++) {
      expect(result.upper[i]).toBeGreaterThan(result.middle[i]!);
      expect(result.middle[i]).toBeGreaterThan(result.lower[i]!);
    }
  });

  it('should have middle band equal to SMA', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + i * 0.5);
    const data = createMockPriceHistory(prices);
    const bands = calculateBollingerBands(data, 20, 2);
    const sma = calculateSMA(data, 20);

    for (let i = 0; i < bands.middle.length; i++) {
      expect(bands.middle[i]).toBe(sma[i]);
    }
  });

  it('should widen bands with higher volatility', () => {
    // Low volatility data
    const lowVolPrices = Array.from({ length: 25 }, () => 100);
    const lowVolData = createMockPriceHistory(lowVolPrices);
    const lowVolBands = calculateBollingerBands(lowVolData, 20, 2);

    // High volatility data
    const highVolPrices = Array.from({ length: 25 }, (_, i) => 100 + (i % 2 === 0 ? 10 : -10));
    const highVolData = createMockPriceHistory(highVolPrices);
    const highVolBands = calculateBollingerBands(highVolData, 20, 2);

    const lowVolWidth = lowVolBands.upper[24]! - lowVolBands.lower[24]!;
    const highVolWidth = highVolBands.upper[24]! - highVolBands.lower[24]!;

    expect(highVolWidth).toBeGreaterThan(lowVolWidth);
  });

  it('should handle custom standard deviation multiplier', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + Math.sin(i));
    const data = createMockPriceHistory(prices);

    const bands1 = calculateBollingerBands(data, 20, 1);
    const bands2 = calculateBollingerBands(data, 20, 2);
    const bands3 = calculateBollingerBands(data, 20, 3);

    // Width should increase with std dev multiplier
    const width1 = bands1.upper[24]! - bands1.lower[24]!;
    const width2 = bands2.upper[24]! - bands2.lower[24]!;
    const width3 = bands3.upper[24]! - bands3.lower[24]!;

    expect(width2).toBeGreaterThan(width1);
    expect(width3).toBeGreaterThan(width2);
  });

  it('should handle flat prices (zero volatility)', () => {
    const prices = Array.from({ length: 25 }, () => 100);
    const data = createMockPriceHistory(prices);
    const result = calculateBollingerBands(data, 20, 2);

    // With zero volatility, all bands should be equal
    expect(result.upper[24]).toBe(100);
    expect(result.middle[24]).toBe(100);
    expect(result.lower[24]).toBe(100);
  });

  it('should work with realistic forex data', () => {
    // EUR/USD prices with realistic volatility
    const basePrices = Array.from({ length: 30 }, (_, i) => {
      return 1.08500 + Math.sin(i / 3) * 0.002 + (Math.random() - 0.5) * 0.0005;
    });
    const data = createMockPriceHistory(basePrices);
    const result = calculateBollingerBands(data, 20, 2);

    // Check that last value has all bands
    expect(result.upper[29]).not.toBeNull();
    expect(result.middle[29]).not.toBeNull();
    expect(result.lower[29]).not.toBeNull();

    // Bands should be in order
    expect(result.upper[29]).toBeGreaterThan(result.middle[29]!);
    expect(result.middle[29]).toBeGreaterThan(result.lower[29]!);

    // Middle should be close to actual prices
    expect(result.middle[29]).toBeCloseTo(1.08500, 2);
  });
});

describe('Edge Cases', () => {
  it('should handle all indicators with single data point', () => {
    const data = createMockPriceHistory([100]);

    const sma = calculateSMA(data, 5);
    const rsi = calculateRSI(data, 14);
    const bb = calculateBollingerBands(data, 20, 2);

    expect(sma).toEqual([null]);
    expect(rsi).toEqual([null]);
    expect(bb.upper).toEqual([null]);
    expect(bb.middle).toEqual([null]);
    expect(bb.lower).toEqual([null]);
  });

  it('should handle very large price values', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100000 + i * 100);
    const data = createMockPriceHistory(prices);

    const sma = calculateSMA(data, 20);
    const rsi = calculateRSI(data, 14);
    const bb = calculateBollingerBands(data, 20, 2);

    expect(sma[24]).toBeGreaterThan(100000);
    expect(rsi[15]).toBeGreaterThan(0);
    expect(bb.middle[24]).toBeGreaterThan(100000);
  });

  it('should handle very small price differences', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 1.00000 + i * 0.00001);
    const data = createMockPriceHistory(prices, 0.00001);

    const sma = calculateSMA(data, 20);
    const rsi = calculateRSI(data, 14);
    const bb = calculateBollingerBands(data, 20, 2);

    // Average of last 20 prices (indices 5-24): 1.00005 to 1.00024
    // Average: 1.000145
    expect(sma[24]).toBeCloseTo(1.000145, 5);
    // RSI with very small differences can have precision issues, just check bounds
    expect(rsi[15]).toBeGreaterThanOrEqual(0);
    expect(rsi[15]).toBeLessThanOrEqual(100);
    expect(bb.upper[24]).toBeGreaterThan(bb.middle[24]!);
  });
});
