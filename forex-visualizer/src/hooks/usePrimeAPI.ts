import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { PrimeAPIService } from '../services/PrimeAPIService';
import type { ConnectionStatus } from '../services/PrimeAPIService';
import type { ForexPrice, PriceHistory } from '../types/primeapi';

interface UsePrimeAPIOptions {
  apiKey: string;
  pairs: string[];
  stream?: 'fx' | 'fx1s';
  maxHistoryLength?: number;
}

export function usePrimeAPI(options: UsePrimeAPIOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [prices, setPrices] = useState<Map<string, ForexPrice>>(new Map());
  const [priceHistory, setPriceHistory] = useState<Map<string, PriceHistory[]>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<PrimeAPIService | null>(null);
  const maxHistoryLength = options.maxHistoryLength || 100;

  // Create a stable, sorted key for the pairs to avoid false re-renders
  const pairsKey = useMemo(() => {
    return [...options.pairs].sort().join(',');
  }, [options.pairs]);

  // Convert pairs array to Set for fast lookup
  const pairsSet = useMemo(() => new Set(options.pairs), [pairsKey]);

  useEffect(() => {
    if (!options.apiKey) {
      setError('API key is required');
      return;
    }

    // Create service instance only once
    const service = new PrimeAPIService({
      apiKey: options.apiKey,
      pairs: options.pairs,
      stream: options.stream,
    });

    serviceRef.current = service;

    // Set up event handlers
    service.setOnStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'authenticated') {
        setError(null);
      }
    });

    service.setOnPrice((price) => {
      // Only process prices for currently selected pairs (use Set for O(1) lookup)
      if (!pairsSet.has(price.symbol)) {
        return;
      }

      // Update current prices
      setPrices((prev) => {
        const updated = new Map(prev);
        updated.set(price.symbol, price);
        return updated;
      });

      // Update price history
      setPriceHistory((prev) => {
        const updated = new Map(prev);
        const history = updated.get(price.symbol) || [];

        const newEntry: PriceHistory = {
          time: Math.floor(price.timestamp / 1000), // Convert to seconds for charts
          bid: price.bid,
          ask: price.ask,
          mid: (price.bid + price.ask) / 2,
        };

        // Add new entry and trim if needed
        const newHistory = [...history, newEntry];
        if (newHistory.length > maxHistoryLength) {
          newHistory.shift();
        }

        updated.set(price.symbol, newHistory);
        return updated;
      });
    });

    service.setOnError((errorMsg) => {
      setError(errorMsg);
    });

    // Connect
    service.connect();

    // Cleanup on unmount or API key change only
    return () => {
      service.disconnect();
    };
  }, [options.apiKey, options.stream, maxHistoryLength, pairsSet]);

  // Separate effect for pairs changes - clean up old data and update subscription
  useEffect(() => {
    // Clean up data for pairs that were removed
    setPrices((prev) => {
      const updated = new Map(prev);
      let hasChanges = false;

      Array.from(updated.keys()).forEach((symbol) => {
        if (!pairsSet.has(symbol)) {
          updated.delete(symbol);
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prev;
    });

    setPriceHistory((prev) => {
      const updated = new Map(prev);
      let hasChanges = false;

      Array.from(updated.keys()).forEach((symbol) => {
        if (!pairsSet.has(symbol)) {
          updated.delete(symbol);
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prev;
    });

    // Update subscription if service exists and is connected
    if (serviceRef.current && status === 'authenticated') {
      serviceRef.current.updatePairs(options.pairs);
    }
  }, [pairsKey, pairsSet, options.pairs, status]);

  const updatePairs = useCallback((newPairs: string[]) => {
    serviceRef.current?.updatePairs(newPairs);
  }, []);

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    serviceRef.current?.connect();
  }, []);

  return {
    status,
    prices: Array.from(prices.values()),
    priceHistory,
    error,
    updatePairs,
    disconnect,
    reconnect,
  };
}
