import { useState, useEffect } from 'react';
import { useForexData } from './hooks/useForexData';
import { PriceTicker } from './components/PriceTicker';
import { ForexChart } from './components/ForexChart';
import { PairSelector } from './components/PairSelector';
import './App.css';

// Available forex pairs
const AVAILABLE_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
  'USDCNY', 'USDCHF', 'USDHKD', 'EURGBP', 'USDKRW'
];

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_PAIRS: 'forex-visualizer-selected-pairs',
  API_KEY: 'forex-visualizer-api-key',
  MODE: 'forex-visualizer-mode',
};

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [selectedPairs, setSelectedPairs] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PAIRS);
    return saved ? JSON.parse(saved) : ['EURUSD', 'GBPUSD'];
  });
  const [mode, setMode] = useState<'live' | 'test'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE);
    return (saved as 'live' | 'test') || 'live';
  });
  const [isConnected, setIsConnected] = useState(false);

  // Load saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedApiKey) {
      setInputApiKey(savedApiKey);
    }
  }, []);

  // Save selected pairs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PAIRS, JSON.stringify(selectedPairs));
  }, [selectedPairs]);

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  const { status, prices, priceHistory, error } = useForexData({
    mode,
    apiKey: apiKey,
    pairs: selectedPairs,
    stream: 'fx1s', // 1 message per second to avoid overwhelming
    maxHistoryLength: 200, // Keep 200 data points
  });

  // Debug logging
  useEffect(() => {
    console.log('[App] selectedPairs:', selectedPairs);
    console.log('[App] prices count:', prices?.length || 0);
    console.log('[App] prices symbols:', prices?.map(p => p.symbol) || []);
  }, [selectedPairs, prices]);

  const handleConnect = () => {
    // Test mode doesn't require an API key
    if (mode === 'test' || inputApiKey.trim()) {
      setApiKey(mode === 'test' ? 'TEST_MODE' : inputApiKey);
      setIsConnected(true);
      // Save API key to localStorage for convenience (only in live mode)
      if (mode === 'live' && inputApiKey.trim()) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, inputApiKey);
      }
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    // Keep API key in localStorage for convenience
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#fbbf24';
      case 'authenticated': return '#4ade80';
      case 'error': return '#f87171';
      case 'connecting': return '#60a5fa';
      default: return '#6b7280';
    }
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Forex Data Visualizer</h1>
          <p className="subtitle">
            {mode === 'live'
              ? 'Real-time forex streaming with PrimeAPI.io'
              : 'Test mode - Simulated data for development'}
          </p>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'live' ? 'active' : ''}`}
              onClick={() => setMode('live')}
            >
              Live Mode
            </button>
            <button
              className={`mode-btn ${mode === 'test' ? 'active' : ''}`}
              onClick={() => setMode('test')}
            >
              Test Mode
            </button>
          </div>

          <div className="login-form">
            {mode === 'live' && (
              <>
                <input
                  type="text"
                  placeholder="Enter your PrimeAPI key"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="api-key-input"
                />
                <p className="help-text">
                  Don't have an API key?{' '}
                  <a href="https://console.primeapi.io" target="_blank" rel="noopener noreferrer">
                    Get a free trial key
                  </a>
                </p>
              </>
            )}
            {mode === 'test' && (
              <p className="test-mode-info">
                Test mode generates simulated forex data for development and testing.
                No API key required.
              </p>
            )}
            <button onClick={handleConnect} className="connect-btn">
              {mode === 'live' ? 'Connect' : 'Start Test Data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Forex Data Visualizer</h1>
          <div className="status-bar">
            <span className="mode-badge">{mode === 'test' ? '🧪 TEST MODE' : '🔴 LIVE'}</span>
            <span className="status-indicator" style={{ backgroundColor: getStatusColor() }} />
            <span className="status-text">{status}</span>
            {error && <span className="error-text">⚠️ {error}</span>}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="disconnect-btn"
        >
          Disconnect
        </button>
      </header>

      <main className="app-main">
        <PairSelector
          availablePairs={AVAILABLE_PAIRS}
          selectedPairs={selectedPairs}
          onPairsChange={setSelectedPairs}
          maxPairs={5}
        />

        {selectedPairs.length === 0 && (
          <div className="loading-message">
            <p>Select currency pairs to start tracking prices</p>
          </div>
        )}

        {selectedPairs.length > 0 && prices.length === 0 && status === 'authenticated' && (
          <div className="loading-message">
            <p>Waiting for price data...</p>
          </div>
        )}

        {selectedPairs.length > 0 && prices.length > 0 && (
          <div className="tickers-grid">
            {prices.map((price) => (
              <PriceTicker key={price.symbol} price={price} />
            ))}
          </div>
        )}

        {priceHistory && (
          <div className="charts-grid">
            {selectedPairs.map((pair) => {
              const history = priceHistory.get(pair) || [];
              if (history.length === 0) return null;

              return (
                <ForexChart
                  key={pair}
                  symbol={pair}
                  data={history}
                  height={350}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
