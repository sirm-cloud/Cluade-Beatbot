import type { ForexPrice } from '../types/primeapi';

// Realistic base rates for common forex pairs
const BASE_RATES: Record<string, { mid: number; spread: number }> = {
  EURUSD: { mid: 1.08500, spread: 0.00015 },
  GBPUSD: { mid: 1.26500, spread: 0.00020 },
  USDJPY: { mid: 148.500, spread: 0.015 },
  AUDUSD: { mid: 0.63500, spread: 0.00018 },
  USDCAD: { mid: 1.39500, spread: 0.00018 },
  USDCNY: { mid: 7.24500, spread: 0.0050 },
  USDCHF: { mid: 0.90500, spread: 0.00015 },
  USDHKD: { mid: 7.82500, spread: 0.0020 },
  EURGBP: { mid: 0.85800, spread: 0.00018 },
  USDKRW: { mid: 1342.50, spread: 0.50 },
};

export class TestDataService {
  private intervalId: number | null = null;
  private currentRates: Map<string, number> = new Map();
  private currentSpreads: Map<string, number> = new Map();
  private onPriceUpdate: ((price: ForexPrice) => void) | null = null;

  constructor() {
    // Initialize current rates and spreads with base values
    Object.entries(BASE_RATES).forEach(([pair, { mid, spread }]) => {
      this.currentRates.set(pair, mid);
      this.currentSpreads.set(pair, spread);
    });
  }

  /**
   * Start generating test data for the specified pairs
   */
  start(pairs: string[], callback: (price: ForexPrice) => void): void {
    this.onPriceUpdate = callback;

    // Immediately send initial prices
    pairs.forEach(pair => {
      const price = this.generatePrice(pair);
      if (price) {
        callback(price);
      }
    });

    // Update prices every second
    this.intervalId = window.setInterval(() => {
      pairs.forEach(pair => {
        const price = this.generatePrice(pair);
        if (price) {
          callback(price);
        }
      });
    }, 1000);
  }

  /**
   * Stop generating test data
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onPriceUpdate = null;
  }

  /**
   * Generate a realistic price update for a pair
   */
  private generatePrice(pair: string): ForexPrice | null {
    const baseRate = BASE_RATES[pair];
    if (!baseRate) {
      console.warn(`No base rate defined for ${pair}`);
      return null;
    }

    // Get current rate or initialize with base rate
    let currentMid = this.currentRates.get(pair) || baseRate.mid;

    // Random walk with realistic volatility
    // Volatility is proportional to the price (higher for JPY, KRW, etc.)
    const volatility = baseRate.mid * 0.0001; // 0.01% movement per tick
    const change = (Math.random() - 0.5) * volatility * 2;

    // Add some mean reversion to keep prices from drifting too far
    const meanReversion = (baseRate.mid - currentMid) * 0.01;
    currentMid += change + meanReversion;

    // Update stored rate
    this.currentRates.set(pair, currentMid);

    // Generate dynamic spread with volatility
    let currentSpread = this.currentSpreads.get(pair) || baseRate.spread;

    // Spread volatility (spreads widen/narrow based on market conditions)
    // Spreads tend to fluctuate about 10-20% in normal conditions
    const spreadVolatility = baseRate.spread * 0.05; // 5% of base spread
    const spreadChange = (Math.random() - 0.5) * spreadVolatility * 2;

    // Mean reversion for spread (tends back to base spread)
    const spreadMeanReversion = (baseRate.spread - currentSpread) * 0.02;
    currentSpread += spreadChange + spreadMeanReversion;

    // Keep spread within reasonable bounds (50% to 200% of base spread)
    const minSpread = baseRate.spread * 0.5;
    const maxSpread = baseRate.spread * 2.0;
    currentSpread = Math.max(minSpread, Math.min(maxSpread, currentSpread));

    // Update stored spread
    this.currentSpreads.set(pair, currentSpread);

    // Calculate bid/ask from mid and dynamic spread
    const halfSpread = currentSpread / 2;
    const bid = currentMid - halfSpread;
    const ask = currentMid + halfSpread;

    return {
      symbol: pair,
      bid,
      ask,
      spread: currentSpread,
      timestamp: Date.now(),
    };
  }

  /**
   * Reset all rates and spreads to base values
   */
  reset(): void {
    Object.entries(BASE_RATES).forEach(([pair, { mid, spread }]) => {
      this.currentRates.set(pair, mid);
      this.currentSpreads.set(pair, spread);
    });
  }
}
