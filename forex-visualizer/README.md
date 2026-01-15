# Forex Data Visualizer

A real-time forex data visualization web application built with React, TypeScript, and the PrimeAPI.io WebSocket API. Stream and visualize bid/ask prices for ~2,300 forex trading pairs with interactive charts.

![Forex Visualizer](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff)

## Features

- **Real-time WebSocket Streaming** - Live forex price updates via PrimeAPI.io
- **Interactive Charts** - Beautiful line charts showing bid/ask price movements using Lightweight Charts
- **Multiple Currency Pairs** - Monitor up to 5 forex pairs simultaneously
- **Price Tickers** - Real-time display of bid, ask, and spread for each pair
- **Dynamic Pair Selection** - Easily add or remove currency pairs on the fly
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Connection Management** - Automatic reconnection with visual status indicators

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Charts**: Lightweight Charts (TradingView)
- **WebSocket**: Native WebSocket API
- **State Management**: React Hooks
- **Styling**: Modern CSS with gradients and animations

## Prerequisites

- Node.js 18+ and npm
- A PrimeAPI.io API key ([Get a free trial key](https://console.primeapi.io))

## Installation

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

## Usage

### Getting Started

1. **Enter API Key**: When you first launch the app, you'll be prompted to enter your PrimeAPI.io API key
2. **Connect**: Click the "Connect" button to establish a WebSocket connection
3. **Select Pairs**: Use the pair selector to add or remove forex pairs (up to 5 pairs)
4. **View Data**: Watch real-time price tickers and charts update automatically

### Available Forex Pairs

The app supports 18+ popular forex pairs including:
- Major pairs: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD
- Cross pairs: EURGBP, EURJPY, GBPJPY, EURCHF, AUDJPY
- Exotic crosses: GBPAUD, EURAUD, EURCAD, GBPCAD, GBPNZD, EURNZD

### Understanding the Display

- **Price Tickers**: Show current bid, ask, and spread (in pips)
- **Charts**: Display historical bid (green) and ask (red) price movements
- **Status Indicator**:
  - 🔵 Blue = Connecting
  - 🟡 Yellow = Connected
  - 🟢 Green = Authenticated & Receiving Data
  - 🔴 Red = Error

## Project Structure

```
forex-visualizer/
├── src/
│   ├── components/          # React components
│   │   ├── ForexChart.tsx   # Chart component
│   │   ├── PriceTicker.tsx  # Price display component
│   │   └── PairSelector.tsx # Currency pair selector
│   ├── hooks/               # Custom React hooks
│   │   └── usePrimeAPI.ts   # WebSocket hook
│   ├── services/            # Business logic
│   │   └── PrimeAPIService.ts # WebSocket service
│   ├── types/               # TypeScript types
│   │   └── primeapi.ts      # API type definitions
│   ├── App.tsx              # Main app component
│   ├── App.css              # App styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## API Configuration

The app uses PrimeAPI.io's WebSocket API with the following settings:

- **WebSocket URL**: `wss://euc2.primeapi.io`
- **Stream Mode**: `fx1s` (1 message per second per pair)
- **Max History**: 200 data points per pair
- **Auto-Reconnect**: Enabled with up to 5 retry attempts

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

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The optimized production files will be in the `dist/` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

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

**Changing Chart Colors:**
Edit the series colors in `src/components/ForexChart.tsx`:

```typescript
const bidSeries = chart.addLineSeries({
  color: '#4ade80', // Change bid line color
  lineWidth: 2,
});

const askSeries = chart.addLineSeries({
  color: '#f87171', // Change ask line color
  lineWidth: 2,
});
```

## Troubleshooting

### WebSocket Connection Issues

- **401 Authentication Error**: Check that your API key is valid
- **Connection Drops**: The app will automatically attempt to reconnect
- **No Data Appearing**: Ensure the selected currency pairs are valid

### Performance Issues

- Reduce the number of monitored pairs (default max is 5)
- Use `fx1s` stream mode instead of `fx` for lower message frequency
- Reduce `maxHistoryLength` in the usePrimeAPI hook

## About PrimeAPI.io

PrimeAPI provides real-time and historical forex data covering 2,300+ currency pairs:
- Ultra-low latency updates (milliseconds)
- 99.999% uptime guarantee
- Data from Tier-1 Liquidity Providers
- Free trial available
- Paid plans from $99/month for WebSocket access

Learn more at [https://www.primeapi.io](https://www.primeapi.io)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For API-related issues, visit [PrimeAPI.io Documentation](https://primeapi.readme.io/reference/primeapiio-documentation)

For application issues, please open an issue in this repository.
