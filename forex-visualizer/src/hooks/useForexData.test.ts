import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useForexData } from './useForexData';

// Mock the usePrimeAPI hook
vi.mock('./usePrimeAPI', () => ({
  usePrimeAPI: vi.fn(() => ({
    status: 'disconnected',
    prices: [],
    priceHistory: new Map(),
    error: null,
  })),
}));

describe('useForexData', () => {
  describe('Initialization', () => {
    it('should initialize with disconnected status in test mode', () => {
      const { result } = renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: '',
          pairs: [],
        })
      );

      expect(result.current.status).toBe('disconnected');
      expect(result.current.prices).toEqual([]);
      expect(result.current.priceHistory.size).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Live Mode', () => {
    it('should use usePrimeAPI in live mode', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');

      usePrimeAPI.mockReturnValue({
        status: 'authenticated',
        prices: [{ symbol: 'EURUSD', bid: 1.085, ask: 1.086, spread: 0.001, timestamp: Date.now() }],
        priceHistory: new Map(),
        error: null,
      });

      const { result } = renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith({
        apiKey: 'test-key',
        pairs: ['EURUSD'],
        stream: 'fx1s',
        maxHistoryLength: 200,
      });

      expect(result.current.status).toBe('authenticated');
      expect(result.current.prices.length).toBe(1);
      expect(result.current.prices[0].symbol).toBe('EURUSD');
    });

    it('should pass custom stream parameter to usePrimeAPI', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
          stream: 'fx',
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          stream: 'fx',
        })
      );
    });

    it('should pass custom maxHistoryLength to usePrimeAPI', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
          maxHistoryLength: 100,
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxHistoryLength: 100,
        })
      );
    });

    it('should pass through errors from usePrimeAPI', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');

      usePrimeAPI.mockReturnValue({
        status: 'error',
        prices: [],
        priceHistory: new Map(),
        error: 'Connection failed',
      });

      const { result } = renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(result.current.error).toBe('Connection failed');
      expect(result.current.status).toBe('error');
    });

    it('should not send API key or pairs to usePrimeAPI when in test mode', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith({
        apiKey: '',
        pairs: [],
        stream: 'fx1s',
        maxHistoryLength: 200,
      });
    });
  });

  describe('Mode Selection', () => {
    it('should return test mode data when mode is test', () => {
      const { result } = renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: '',
          pairs: [],
        })
      );

      expect(result.current.error).toBeNull();
      expect(result.current.status).toBe('disconnected');
    });

    it('should return live mode data when mode is live', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');

      usePrimeAPI.mockReturnValue({
        status: 'connected',
        prices: [],
        priceHistory: new Map(),
        error: null,
      });

      const { result } = renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(result.current.status).toBe('connected');
    });
  });

  describe('Status Transitions', () => {
    it('should set status to connecting when pairs are provided in test mode', () => {
      const { result } = renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: '',
          pairs: ['EURUSD'],
        })
      );

      expect(result.current.status).toBe('connecting');
    });

    it('should set status to disconnected when no pairs in test mode', () => {
      const { result } = renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: '',
          pairs: [],
        })
      );

      expect(result.current.status).toBe('disconnected');
    });
  });

  describe('Pair Management', () => {
    it('should handle empty pairs array in test mode', () => {
      const { result } = renderHook(() =>
        useForexData({
          mode: 'test',
          apiKey: '',
          pairs: [],
        })
      );

      expect(result.current.prices).toEqual([]);
      expect(result.current.priceHistory.size).toBe(0);
    });

    it('should accept multiple pairs', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
        })
      );
    });
  });

  describe('Default Parameters', () => {
    it('should use default stream parameter', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          stream: 'fx1s',
        })
      );
    });

    it('should use default maxHistoryLength', () => {
      const { usePrimeAPI } = require('./usePrimeAPI');
      usePrimeAPI.mockClear();

      renderHook(() =>
        useForexData({
          mode: 'live',
          apiKey: 'test-key',
          pairs: ['EURUSD'],
        })
      );

      expect(usePrimeAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxHistoryLength: 200,
        })
      );
    });
  });
});
