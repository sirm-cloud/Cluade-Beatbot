import type { PriceHistory } from '../types/primeapi';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: PriceHistory[], period: number): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      const midPrice = (data[i - j].bid + data[i - j].ask) / 2;
      sum += midPrice;
    }
    result.push(sum / period);
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: PriceHistory[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];

  if (data.length < period + 1) {
    return data.map(() => null);
  }

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const prevMid = (data[i - 1].bid + data[i - 1].ask) / 2;
    const currMid = (data[i].bid + data[i].ask) / 2;
    changes.push(currMid - prevMid);
  }

  // First RSI value uses simple average
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Fill initial nulls
  for (let i = 0; i <= period; i++) {
    result.push(null);
  }

  // Calculate first RSI
  const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
  const rsi = 100 - (100 / (1 + rs));
  result.push(rsi);

  // Calculate subsequent RSI values using smoothed averages
  for (let i = period + 1; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
    const rsi = 100 - (100 / (1 + rs));
    result.push(rsi);
  }

  return result;
}

/**
 * Calculate Bollinger Bands
 */
export interface BollingerBands {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  data: PriceHistory[],
  period: number = 20,
  stdDev: number = 2
): BollingerBands {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1 || middle[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    // Calculate standard deviation
    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      const midPrice = (data[i - j].bid + data[i - j].ask) / 2;
      const diff = midPrice - middle[i]!;
      sumSquaredDiff += diff * diff;
    }

    const standardDeviation = Math.sqrt(sumSquaredDiff / period);

    upper.push(middle[i]! + (stdDev * standardDeviation));
    lower.push(middle[i]! - (stdDev * standardDeviation));
  }

  return { upper, middle, lower };
}
