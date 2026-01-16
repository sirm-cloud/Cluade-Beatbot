import { useState, useEffect } from 'react';
import { usePrimeAPI } from './hooks/usePrimeAPI';
import { PriceTicker } from './components/PriceTicker';
import { ForexChart } from './components/ForexChart';
import { PairSelector } from './components/PairSelector';
import './App.css';

// Popular forex pairs
const AVAILABLE_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
  'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'AUDJPY',
  'GBPAUD', 'EURAUD', 'EURCAD', 'GBPCAD', 'GBPNZD', 'EURNZD'
];

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_PAIRS: 'forex-visualizer-selected-pairs',
  API_KEY: 'forex-visualizer-api-key',
};

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [selectedPairs, setSelectedPairs] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PAIRS);
    return saved ? JSON.parse(saved) : ['EURUSD', 'GBPUSD'];
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

  const { status, prices, priceHistory, error } = usePrimeAPI({
    apiKey: apiKey,
    pairs: selectedPairs,
    stream: 'fx1s', // 1 message per second to avoid overwhelming
    maxHistoryLength: 200, // Keep 200 data points
  });

  const handleConnect = () => {
    if (inputApiKey.trim()) {
      setApiKey(inputApiKey);
      setIsConnected(true);
      // Save API key to localStorage for convenience
      localStorage.setItem(STORAGE_KEYS.API_KEY, inputApiKey);
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
          <p className="subtitle">Real-time forex streaming with PrimeAPI.io</p>
          <div className="login-form">
            <input
              type="text"
              placeholder="Enter your PrimeAPI key"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              className="api-key-input"
            />
            <button onClick={handleConnect} className="connect-btn">
              Connect
            </button>
            <p className="help-text">
              Don't have an API key?{' '}
              <a href="https://console.primeapi.io" target="_blank" rel="noopener noreferrer">
                Get a free trial key
              </a>
            </p>
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

        {prices && prices.length === 0 && status === 'authenticated' && (
          <div className="loading-message">
            <p>Waiting for price data...</p>
          </div>
        )}

        {prices && prices.length > 0 && (
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
