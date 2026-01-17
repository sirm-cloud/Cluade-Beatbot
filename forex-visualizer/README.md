# Forex Data Visualizer

A professional real-time forex data visualization web application built with React, TypeScript, and the PrimeAPI.io WebSocket API. Stream and visualize bid/ask prices for 2,300+ forex trading pairs with interactive charts, technical indicators, and advanced analytics.

![Forex Visualizer](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff) ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384)

## ✨ Features

### Real-Time Data Streaming
- **WebSocket Integration** - Live forex price updates via PrimeAPI.io (fx1s stream)
- **Multiple Currency Pairs** - Monitor up to 5 forex pairs simultaneously
- **Price Change Indicators** - Live price movement with colored arrows and percentage changes
- **Automatic Reconnection** - Robust error handling with automatic retry logic

### Advanced Charting
- **Dual Chart Types**:
  - **Line Charts** - Clean bid/ask price visualization with filled areas
  - **Candlestick Charts** - Professional OHLC (Open/High/Low/Close) candles with time-based aggregation
- **Separate Timeframes for Each Chart Type**:
  - **Line Charts**: 1m, 5m, 15m, 1h, or all data views
  - **Candlestick Charts**: 5s, 10s, or 30s intervals (each candle = exact timeframe)
- **Timeframe-Aware Labels** - X-axis automatically adjusts based on selected timeframe
- **Smooth Real-Time Updates** - Animations disabled for fluid data streaming
- **Always 60 Candles** - Candlestick charts show 60 candles regardless of interval for consistent visualization

### Technical Indicators
- **Moving Averages**:
  - SMA 20 (Simple Moving Average - 20 period) - Short-term trend
  - SMA 50 (Simple Moving Average - 50 period) - Medium-term trend
- **Bollinger Bands** - Volatility indicator with upper, middle, and lower bands (20-period, 2 std dev)
  - Visual distinction: dashed lines for upper/lower bands, solid line for middle band
- **RSI** - Relative Strength Index (14-period) in separate panel
  - Identifies overbought (>70) and oversold (<30) conditions
- **Custom HTML Legend** - Interactive legend above charts with hover tooltips
  - Tooltips display full indicator names and detailed explanations
  - Chart tooltips disabled to prevent conflicts and improve readability
- **Compatible with Both Chart Types** - All indicators work on line and candlestick charts

### User Experience
- **Redesigned Price Tickers** - Modern card layout with:
  - Side-by-side bid/ask prices with color-coded backgrounds (green/red)
  - Prominent mid-price display with directional arrows (↑/↓)
  - Spread shown in pips with yellow accent (dynamically updates in test mode)
  - Split decimal formatting for improved readability
  - Real-time price change indicators with percentage
- **Test Mode** - Realistic simulated data for development without API key:
  - Random walk algorithm with mean reversion for authentic price behavior
  - Dynamic spread variation (50-200% of base spread)
  - Works offline and on weekends when forex markets are closed
  - Perfect for testing, learning, and development
- **Dynamic Pair Selection** - Easily add or remove currency pairs on the fly
- **LocalStorage Persistence** - Remembers your selected pairs, API key, and mode between sessions
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Connection Status** - Visual indicators for connection state

## 🎯 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Charts**: Chart.js 4.5 with chartjs-chart-financial plugin
- **WebSocket**: Native WebSocket API with custom service layer
- **State Management**: React Hooks with useRef for stable updates
- **Styling**: Modern CSS with gradients and animations
- **Date Formatting**: date-fns with Chart.js time adapter

## 📋 Prerequisites

- Node.js 18+ and npm
- A PrimeAPI.io API key ([Get a free trial key](https://console.primeapi.io)) - **Optional**: only required for Live Mode. Test Mode works without an API key

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forex-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

### Getting Started

1. **Enter API Key**: When you first launch the app, you'll be prompted to enter your PrimeAPI.io API key
2. **Connect**: Click the "Connect" button to establish a WebSocket connection
3. **Select Pairs**: Use the pair selector to add or remove forex pairs (up to 5 pairs)
4. **Choose Chart Type**: Switch between Line and Candlestick charts
5. **Select Timeframe**: Choose from 1m, 5m, 15m, 1h, or all data
6. **Enable Indicators**: Toggle SMA 20, SMA 50, BB, or RSI indicators
7. **View Data**: Watch real-time price tickers and charts update automatically

### Test Mode for Development

The app includes a **Test Mode** that generates realistic simulated forex data without requiring a PrimeAPI.io connection. This is perfect for:
- **Weekend Development**: Forex markets are closed on weekends, but test mode works 24/7
- **Testing Features**: Experiment with new functionality without using API credits
- **Offline Development**: Work without an internet connection
- **Learning**: Explore the app's features before committing to an API subscription

**How to use Test Mode:**

1. On the login screen, click the **"Test Mode"** button (appears on left side)
2. Click **"Start Test Data"** (no API key required)
3. Test data will begin streaming automatically for all selected currency pairs

**Test Data Features:**
- **Realistic Price Movement**: Random walk algorithm with mean reversion to simulate authentic price behavior
- **Dynamic Spreads**: Spreads fluctuate between 50-200% of base spread, mimicking real market conditions
- **Proportional Volatility**: Higher-priced pairs (JPY, KRW) have proportionally higher volatility
- **1-Second Updates**: Same update frequency as live mode (`fx1s` stream)
- **10 Currency Pairs**: All 10 curated pairs supported with realistic base rates

**Test Mode vs Live Mode:**
- Test mode data is statistically realistic but not actual market data
- Spreads widen and narrow based on simulated volatility (±10-20% typical range)
- Prices use mean reversion to prevent unrealistic drift
- Perfect for testing technical indicators, timeframes, and UI features

**Switching Modes:**
You can toggle between Live and Test modes at any time. Your selected currency pairs and preferences are preserved when switching. The mode selection is saved to localStorage and persists across browser sessions

### Available Forex Pairs

The app currently features 10 carefully selected forex pairs:
- **Major pairs**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD
- **Cross pairs**: EUR/GBP
- **Asian & emerging markets**: USD/CNY, USD/KRW, USD/HKD
- **Safe haven**: USD/CHF

*Note: Search functionality for additional pairs will be added in a future update.*

### Understanding the Display

#### Price Tickers
New vertical layout prioritizes actionable data:
1. **Header**: Symbol, timestamp, and price change with percentage
2. **Bid/Ask Section**: Side-by-side display with:
   - Green-tinted background for Bid (left)
   - Red-tinted background for Ask (right)
   - Split decimal pricing (larger whole numbers, smaller decimals)
3. **Mid-Price Section**: Calculated mid-price with directional arrow:
   - 🟢 Green ↑ = Price increased
   - 🔴 Red ↓ = Price decreased
   - ⚪ Gray − = No change or initializing
4. **Spread Section**: Spread shown in pips with yellow accent

All prices display with 5 decimal precision and monospace font for alignment.

#### Charts
- **Line Chart**:
  - Green filled area = Bid prices
  - Red filled area = Ask prices
  - Indicators overlay directly on price chart

- **Candlestick Chart**:
  - Green candles = Closing price higher than opening (bullish)
  - Red candles = Closing price lower than opening (bearish)
  - Hover to see OHLC values
  - Time-based candle aggregation (e.g., 3s candles for 1m view)

#### Technical Indicators
- **SMA 20** (Yellow line): Short-term moving average
- **SMA 50** (Purple line): Medium-term moving average
- **BB** (Blue lines): Bollinger Bands for volatility
  - Upper and Lower: Dashed lines
  - Middle: Solid line
- **RSI** (Purple, separate panel): Momentum oscillator (0-100 scale)

Hover over any indicator in the **custom legend** (above the chart) to see:
- Full indicator name
- Detailed explanation of what it measures
- Trading interpretation and usage

*Note: Chart line tooltips are disabled. Use the legend for indicator information.*

#### Connection Status
- 🔵 Blue = Connecting
- 🟡 Yellow = Connected
- 🟢 Green = Authenticated & Receiving Data
- 🔴 Red = Error

## 📁 Project Structure

```
forex-visualizer/
├── src/
│   ├── components/              # React components
│   │   ├── ForexChart.tsx       # Chart component with indicators
│   │   ├── ForexChart.css       # Chart styling
│   │   ├── PriceTicker.tsx      # Price display with changes
│   │   ├── PriceTicker.css      # Ticker styling
│   │   └── PairSelector.tsx     # Currency pair selector
│   ├── hooks/                   # Custom React hooks
│   │   ├── usePrimeAPI.ts       # WebSocket hook with state management
│   │   └── useForexData.ts      # Unified hook for live/test data
│   ├── services/                # Business logic
│   │   ├── PrimeAPIService.ts   # WebSocket service with reconnection
│   │   └── TestDataService.ts   # Test data generator with dynamic spreads
│   ├── types/                   # TypeScript types
│   │   └── primeapi.ts          # API type definitions
│   ├── utils/                   # Utility functions
│   │   └── indicators.ts        # Technical indicator calculations
│   ├── App.tsx                  # Main app component with mode toggle
│   ├── App.css                  # App styles
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── README.md                    # This file
```

## ⚙️ API Configuration

The app uses PrimeAPI.io's WebSocket API with the following settings:

- **WebSocket URL**: `wss://euc2.primeapi.io`
- **Stream Mode**: `fx1s` (1 message per second per pair)
- **Max History**: 200 data points per pair
- **Auto-Reconnect**: Enabled with up to 5 retry attempts
- **Persistence**: API key and pair selection saved in localStorage

### Changing Stream Mode

To receive more frequent updates (up to hundreds per second), you can change the stream mode in `src/App.tsx`:

```typescript
const { status, prices, priceHistory, error } = usePrimeAPI({
  apiKey: apiKey,
  pairs: selectedPairs,
  stream: 'fx', // Change from 'fx1s' to 'fx' for real-time updates
  maxHistoryLength: 200,
});
```

**Note**: The `fx` stream can generate hundreds of messages per second for popular pairs. Ensure your application can handle this volume.

## 🔧 Building for Production

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The optimized production files will be in the `dist/` directory.

## 👨‍💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technical Implementation Details

#### Candlestick Aggregation
**Line charts** and **candlestick charts** now have separate timeframe options:

**Line Chart Timeframes:**
- 1 minute (60 seconds of 1s data)
- 5 minutes (300 seconds of 1s data)
- 15 minutes (900 seconds of 1s data)
- 1 hour (3600 seconds of 1s data)
- All data (entire history)

**Candlestick Chart Timeframes:**
Each candle represents exactly one unit of the selected timeframe:
- 5 seconds: Each candle = 5s interval (displays 60 candles = 5 minutes total)
- 10 seconds: Each candle = 10s interval (displays 60 candles = 10 minutes total)
- 30 seconds: Each candle = 30s interval (displays 60 candles = 30 minutes total)

Candles use time-based bucketing (not index-based) to ensure stability. Only the most recent candle updates as new data arrives; historical candles remain stable. The 1-second option was removed as it produces flat candles with no meaningful OHLC data.

#### Technical Indicators
All indicators calculate using mid-price: `(bid + ask) / 2`

**Simple Moving Average (SMA)**:
```typescript
SMA = (P₁ + P₂ + ... + Pₙ) / n
```

**Relative Strength Index (RSI)**:
```typescript
RSI = 100 - (100 / (1 + RS))
where RS = Average Gain / Average Loss over period
```

**Bollinger Bands**:
```typescript
Middle Band = 20-period SMA
Upper Band = Middle + (2 × Standard Deviation)
Lower Band = Middle - (2 × Standard Deviation)
```

#### State Management
The app uses React hooks with refs to prevent stale closures:
- `useRef` tracks current pairs to filter incoming WebSocket messages
- Separate effects handle connection vs. subscription updates
- LocalStorage synchronization on state changes

### Adding New Features

**Adding More Currency Pairs:**
Edit the `AVAILABLE_PAIRS` array in `src/App.tsx`:

```typescript
const AVAILABLE_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY',
  // Add more pairs here
  'AUDCAD', 'NZDCHF', // etc.
];
```

**Adding New Technical Indicators:**
1. Add calculation function to `src/utils/indicators.ts`
2. Add indicator state to ForexChart component
3. Add checkbox control to chart header
4. Add dataset with `indicatorInfo` for tooltips
5. Include in both line and candlestick configurations

**Customizing Chart Colors:**
Edit indicator colors in `src/components/ForexChart.tsx`:

```typescript
// Moving averages
borderColor: 'rgb(251, 191, 36)', // SMA 20 - Yellow
borderColor: 'rgb(139, 92, 246)', // SMA 50 - Purple

// Bollinger Bands
borderColor: 'rgba(59, 130, 246, 0.5)', // Blue

// RSI
borderColor: 'rgb(168, 85, 247)', // Purple
```

## 🐛 Troubleshooting

### WebSocket Connection Issues

- **401 Authentication Error**: Check that your API key is valid
- **Connection Drops**: The app will automatically attempt to reconnect (up to 5 times)
- **No Data Appearing**: Ensure the selected currency pairs are valid
- **Stale Data After Pair Removal**: Fixed via useRef tracking of current pairs

### Performance Issues

- Reduce the number of monitored pairs (default max is 5)
- Use `fx1s` stream mode instead of `fx` for lower message frequency
- Reduce `maxHistoryLength` in the usePrimeAPI hook
- Disable unused technical indicators

### Chart Display Issues

- **Candles updating too frequently**: Ensure time-based bucketing is being used (not index-based)
- **Indicators not showing**: Check that sufficient data points exist (SMA 50 needs 50+ points)
- **RSI out of range**: Normal during initial calculation period, will stabilize after 15+ data points

## 📊 About PrimeAPI.io

PrimeAPI provides real-time and historical forex data covering 2,300+ currency pairs:
- Ultra-low latency updates (milliseconds)
- 99.999% uptime guarantee
- Data from Tier-1 Liquidity Providers
- Free trial available
- Paid plans from $99/month for WebSocket access

Learn more at [https://www.primeapi.io](https://www.primeapi.io)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

- Follow TypeScript best practices
- Use React hooks instead of class components
- Maintain separation of concerns (components, hooks, services, utils)
- Add JSDoc comments for complex functions
- Test with multiple currency pairs and timeframes
- Ensure indicators have tooltip explanations

## 💬 Support

- **API Issues**: Visit [PrimeAPI.io Documentation](https://primeapi.readme.io/reference/primeapiio-documentation)
- **Application Issues**: Open an issue in this repository
- **Feature Requests**: Open an issue with the "enhancement" label

## 🙏 Acknowledgments

- **PrimeAPI.io** for providing real-time forex data
- **Chart.js** for powerful charting capabilities
- **chartjs-chart-financial** for candlestick chart support
- **React** team for an excellent framework

---

**Built with ❤️ using React, TypeScript, and Chart.js**
