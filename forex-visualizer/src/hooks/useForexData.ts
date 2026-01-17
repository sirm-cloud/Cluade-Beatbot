import { useState, useEffect, useRef } from 'react';
import { usePrimeAPI } from './usePrimeAPI';
import { TestDataService } from '../services/TestDataService';
import type { ForexPrice, PriceHistory } from '../types/primeapi';

interface UseForexDataOptions {
  mode: 'live' | 'test';
  apiKey: string;
  pairs: string[];
  stream?: string;
  maxHistoryLength?: number;
}

interface UseForexDataResult {
  status: string;
  prices: ForexPrice[];
  priceHistory: Map<string, PriceHistory[]>;
  error: string | null;
}

export function useForexData({
  mode,
  apiKey,
  pairs,
  stream = 'fx1s',
  maxHistoryLength = 200,
}: UseForexDataOptions): UseForexDataResult {
  // For live mode, use the real API
  const liveData = usePrimeAPI({
    apiKey: mode === 'live' ? apiKey : '',
    pairs: mode === 'live' ? pairs : [],
    stream,
    maxHistoryLength,
  });

  // For test mode, use the test data service
  const [testStatus, setTestStatus] = useState<string>('disconnected');
  const [testPrices, setTestPrices] = useState<ForexPrice[]>([]);
  const [testHistory, setTestHistory] = useState<Map<string, PriceHistory[]>>(new Map());
  const testServiceRef = useRef<TestDataService | null>(null);

  useEffect(() => {
    if (mode !== 'test') return;

    // Initialize test data service
    if (!testServiceRef.current) {
      testServiceRef.current = new TestDataService();
    }

    const service = testServiceRef.current;

    if (pairs.length === 0) {
      setTestStatus('disconnected');
      setTestPrices([]);
      setTestHistory(new Map());
      service.stop();
      return;
    }

    setTestStatus('connecting');

    // Clean up prices and history for pairs that are no longer selected
    setTestPrices(prev => prev.filter(p => pairs.includes(p.symbol)));
    setTestHistory(prev => {
      const newHistory = new Map();
      pairs.forEach(pair => {
        if (prev.has(pair)) {
          newHistory.set(pair, prev.get(pair)!);
        }
      });
      return newHistory;
    });

    // Start generating test data
    service.start(pairs, (price: ForexPrice) => {
      // Update prices array
      setTestPrices(prev => {
        const index = prev.findIndex(p => p.symbol === price.symbol);
        if (index >= 0) {
          const newPrices = [...prev];
          newPrices[index] = price;
          return newPrices;
        }
        return [...prev, price];
      });

      // Update price history
      setTestHistory(prev => {
        const newHistory = new Map(prev);
        const history = newHistory.get(price.symbol) || [];

        const historyItem: PriceHistory = {
          time: Math.floor(price.timestamp / 1000),
          bid: price.bid,
          ask: price.ask,
          spread: price.spread,
        };

        const updated = [...history, historyItem].slice(-maxHistoryLength);
        newHistory.set(price.symbol, updated);
        return newHistory;
      });
    });

    setTestStatus('authenticated');

    return () => {
      service.stop();
    };
  }, [mode, pairs, maxHistoryLength]);

  // Return appropriate data based on mode
  if (mode === 'test') {
    return {
      status: testStatus,
      prices: testPrices,
      priceHistory: testHistory,
      error: null,
    };
  }

  return liveData;
}
