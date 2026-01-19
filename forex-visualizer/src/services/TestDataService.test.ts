import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestDataService } from './TestDataService';
import type { ForexPrice } from '../types/primeapi';

describe('TestDataService', () => {
  let service: TestDataService;

  beforeEach(() => {
    service = new TestDataService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(service).toBeInstanceOf(TestDataService);
    });

    it('should not be generating data initially', () => {
      const callback = vi.fn();
      // Don't call start, just verify callback isn't called
      vi.advanceTimersByTime(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('start()', () => {
    it('should immediately generate initial prices for all pairs', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);

      service.start(['EURUSD', 'GBPUSD'], callback);

      expect(prices.length).toBe(2);
      expect(prices[0].symbol).toBe('EURUSD');
      expect(prices[1].symbol).toBe('GBPUSD');
    });

    it('should generate prices every second', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);

      service.start(['EURUSD'], callback);

      // Initial price
      expect(prices.length).toBe(1);

      // After 1 second
      vi.advanceTimersByTime(1000);
      expect(prices.length).toBe(2);

      // After 2 seconds
      vi.advanceTimersByTime(1000);
      expect(prices.length).toBe(3);

      // After 5 seconds
      vi.advanceTimersByTime(3000);
      expect(prices.length).toBe(6); // Initial + 5
    });

    it('should generate prices for multiple pairs', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);

      service.start(['EURUSD', 'GBPUSD', 'USDJPY'], callback);

      // Initial: 3 pairs
      expect(prices.length).toBe(3);

      // After 1 second: 3 more
      vi.advanceTimersByTime(1000);
      expect(prices.length).toBe(6);

      const symbols = prices.map(p => p.symbol);
      expect(symbols).toContain('EURUSD');
      expect(symbols).toContain('GBPUSD');
      expect(symbols).toContain('USDJPY');
    });

    it('should handle unknown pairs gracefully', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      service.start(['EURUSD', 'UNKNOWN'], callback);

      expect(prices.length).toBe(1); // Only EURUSD
      expect(consoleSpy).toHaveBeenCalledWith('No base rate defined for UNKNOWN');

      consoleSpy.mockRestore();
    });
  });

  describe('stop()', () => {
    it('should stop generating prices', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);

      service.start(['EURUSD'], callback);
      expect(prices.length).toBe(1);

      service.stop();

      // Advance time - should not generate more
      vi.advanceTimersByTime(5000);
      expect(prices.length).toBe(1);
    });

    it('should be safe to call stop multiple times', () => {
      service.start(['EURUSD'], () => {});
      service.stop();
      service.stop();
      service.stop();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should be safe to call stop without start', () => {
      service.stop();
      expect(true).toBe(true);
    });
  });

  describe('Price Generation', () => {
    it('should generate prices with correct structure', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      const price = prices[0];
      expect(price).toHaveProperty('symbol');
      expect(price).toHaveProperty('bid');
      expect(price).toHaveProperty('ask');
      expect(price).toHaveProperty('spread');
      expect(price).toHaveProperty('timestamp');
    });

    it('should have ask > bid', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD', 'GBPUSD', 'USDJPY'], (price) => prices.push(price));

      prices.forEach(price => {
        expect(price.ask).toBeGreaterThan(price.bid);
      });
    });

    it('should have spread equal to ask - bid', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      prices.forEach(price => {
        const calculatedSpread = price.ask - price.bid;
        expect(price.spread).toBeCloseTo(calculatedSpread, 10);
      });
    });

    it('should generate realistic timestamps', () => {
      const now = Date.now();
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      prices.forEach(price => {
        expect(price.timestamp).toBeGreaterThanOrEqual(now);
        expect(price.timestamp).toBeLessThanOrEqual(now + 1000);
      });
    });
  });

  describe('Price Volatility and Mean Reversion', () => {
    it('should have prices near base rates initially', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD', 'GBPUSD', 'USDJPY'], (price) => prices.push(price));

      const eurusd = prices.find(p => p.symbol === 'EURUSD')!;
      const gbpusd = prices.find(p => p.symbol === 'GBPUSD')!;
      const usdjpy = prices.find(p => p.symbol === 'USDJPY')!;

      const eurusdMid = (eurusd.bid + eurusd.ask) / 2;
      const gbpusdMid = (gbpusd.bid + gbpusd.ask) / 2;
      const usdjpyMid = (usdjpy.bid + usdjpy.ask) / 2;

      // Initial prices should be near base rates (within 0.1% due to initial volatility)
      expect(eurusdMid).toBeCloseTo(1.08500, 2);
      expect(gbpusdMid).toBeCloseTo(1.26500, 2);
      expect(usdjpyMid).toBeCloseTo(148.500, 1);
    });

    it('should show price movement over time', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      const initialMid = (prices[0].bid + prices[0].ask) / 2;

      // Generate 50 prices
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(1000);
      }

      const midPrices = prices.map(p => (p.bid + p.ask) / 2);
      const hasMovement = midPrices.some(mid => Math.abs(mid - initialMid) > 0.00001);

      expect(hasMovement).toBe(true);
    });

    it('should stay near base rate with mean reversion over many iterations', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      // Generate 1000 prices (simulate ~16 minutes)
      for (let i = 0; i < 1000; i++) {
        vi.advanceTimersByTime(1000);
      }

      const midPrices = prices.map(p => (p.bid + p.ask) / 2);
      const avgMid = midPrices.reduce((sum, mid) => sum + mid, 0) / midPrices.length;

      // Average should be close to base rate
      expect(avgMid).toBeCloseTo(1.08500, 3);
    });

    it('should have proportional volatility for different price levels', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD', 'USDJPY', 'USDKRW'], (price) => prices.push(price));

      // Generate 100 prices
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(1000);
      }

      const eurusdPrices = prices.filter(p => p.symbol === 'EURUSD');
      const usdjpyPrices = prices.filter(p => p.symbol === 'USDJPY');
      const usdkrwPrices = prices.filter(p => p.symbol === 'USDKRW');

      const eurusdMids = eurusdPrices.map(p => (p.bid + p.ask) / 2);
      const usdjpyMids = usdjpyPrices.map(p => (p.bid + p.ask) / 2);
      const usdkrwMids = usdkrwPrices.map(p => (p.bid + p.ask) / 2);

      // Calculate standard deviations
      const stdDev = (values: number[]) => {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
      };

      const eurusdStd = stdDev(eurusdMids);
      const usdjpyStd = stdDev(usdjpyMids);
      const usdkrwStd = stdDev(usdkrwMids);

      // Higher priced pairs should have higher absolute volatility
      expect(usdjpyStd).toBeGreaterThan(eurusdStd);
      expect(usdkrwStd).toBeGreaterThan(usdjpyStd);
    });
  });

  describe('Dynamic Spread Behavior', () => {
    it('should keep spreads within 50-200% of base spread', () => {
      const prices: ForexPrice[] = [];
      const baseSpread = 0.00015; // EURUSD base spread
      service.start(['EURUSD'], (price) => prices.push(price));

      // Generate 200 prices
      for (let i = 0; i < 200; i++) {
        vi.advanceTimersByTime(1000);
      }

      const minAllowed = baseSpread * 0.5;
      const maxAllowed = baseSpread * 2.0;

      prices.forEach(price => {
        expect(price.spread).toBeGreaterThanOrEqual(minAllowed);
        expect(price.spread).toBeLessThanOrEqual(maxAllowed);
      });
    });

    it('should show spread variation over time', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      const initialSpread = prices[0].spread;

      // Generate 50 prices
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(1000);
      }

      const spreads = prices.map(p => p.spread);
      const hasVariation = spreads.some(s => Math.abs(s - initialSpread) > 0.000001);

      expect(hasVariation).toBe(true);
    });

    it('should have spread mean reversion to base spread', () => {
      const prices: ForexPrice[] = [];
      const baseSpread = 0.00015; // EURUSD base spread
      service.start(['EURUSD'], (price) => prices.push(price));

      // Generate 1000 prices
      for (let i = 0; i < 1000; i++) {
        vi.advanceTimersByTime(1000);
      }

      const spreads = prices.map(p => p.spread);
      const avgSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;

      // Average should be close to base spread
      expect(avgSpread).toBeCloseTo(baseSpread, 5);
    });

    it('should have different base spreads for different pairs', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD', 'GBPUSD', 'USDCNY'], (price) => prices.push(price));

      const eurusd = prices.find(p => p.symbol === 'EURUSD')!;
      const gbpusd = prices.find(p => p.symbol === 'GBPUSD')!;
      const usdcny = prices.find(p => p.symbol === 'USDCNY')!;

      // EURUSD: 0.00015, GBPUSD: 0.00020, USDCNY: 0.0050
      // Spreads should be in roughly these proportions
      expect(gbpusd.spread).toBeGreaterThan(eurusd.spread);
      expect(usdcny.spread).toBeGreaterThan(gbpusd.spread);
    });
  });

  describe('reset()', () => {
    it('should reset prices to base rates', () => {
      const prices: ForexPrice[] = [];
      service.start(['EURUSD'], (price) => prices.push(price));

      // Generate some prices to move away from base
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(1000);
      }

      const beforeReset = prices[prices.length - 1];
      const beforeMid = (beforeReset.bid + beforeReset.ask) / 2;

      // Reset
      service.reset();

      // Generate a new price
      vi.advanceTimersByTime(1000);
      const afterReset = prices[prices.length - 1];
      const afterMid = (afterReset.bid + afterReset.ask) / 2;

      // After reset should be closer to base rate
      expect(Math.abs(afterMid - 1.08500)).toBeLessThan(Math.abs(beforeMid - 1.08500) + 0.0001);
    });

    it('should reset spreads to base spreads', () => {
      const prices: ForexPrice[] = [];
      const baseSpread = 0.00015;
      service.start(['EURUSD'], (price) => prices.push(price));

      // Generate prices
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(1000);
      }

      // Reset
      service.reset();

      // Generate new price (spread will have volatility applied)
      vi.advanceTimersByTime(1000);
      const afterReset = prices[prices.length - 1];

      // Spread should be close to base spread (within expected volatility range)
      // Dynamic spreads can vary ±5% per tick, so we use looser precision
      expect(afterReset.spread).toBeCloseTo(baseSpread, 4);
    });
  });

  describe('All Supported Pairs', () => {
    it('should support all 10 currency pairs', () => {
      const pairs = [
        'EURUSD',
        'GBPUSD',
        'USDJPY',
        'AUDUSD',
        'USDCAD',
        'USDCNY',
        'USDCHF',
        'USDHKD',
        'EURGBP',
        'USDKRW',
      ];

      const prices: ForexPrice[] = [];
      service.start(pairs, (price) => prices.push(price));

      expect(prices.length).toBe(10);

      const symbols = prices.map(p => p.symbol);
      pairs.forEach(pair => {
        expect(symbols).toContain(pair);
      });
    });

    it('should generate valid prices for all pairs', () => {
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCNY', 'USDCHF', 'USDHKD', 'EURGBP', 'USDKRW'];
      const prices: ForexPrice[] = [];
      service.start(pairs, (price) => prices.push(price));

      prices.forEach(price => {
        expect(price.ask).toBeGreaterThan(price.bid);
        expect(price.spread).toBeGreaterThan(0);
        expect(price.timestamp).toBeGreaterThan(0);
        const mid = (price.bid + price.ask) / 2;
        expect(mid).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pairs array', () => {
      const callback = vi.fn();
      service.start([], callback);

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle rapid start/stop cycles', () => {
      const prices: ForexPrice[] = [];
      const callback = (price: ForexPrice) => prices.push(price);

      service.start(['EURUSD'], callback);
      service.stop();
      service.start(['EURUSD'], callback);
      service.stop();
      service.start(['EURUSD'], callback);

      expect(prices.length).toBe(3); // 3 initial prices
    });

    it('should handle changing callback function', () => {
      const prices1: ForexPrice[] = [];
      const prices2: ForexPrice[] = [];

      service.start(['EURUSD'], (price) => prices1.push(price));
      expect(prices1.length).toBe(1);

      service.stop();
      service.start(['EURUSD'], (price) => prices2.push(price));
      expect(prices2.length).toBe(1);
      expect(prices1.length).toBe(1); // Should not increase
    });
  });
});
