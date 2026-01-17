# Cluade-Beatbot

A collection of data visualization projects and experiments.

## Projects

### Forex Visualizer

A real-time forex data visualization web application built with React, TypeScript, and the PrimeAPI.io WebSocket API.

**Location:** `forex-visualizer/`

**Features:**
- Real-time WebSocket streaming of forex prices (1-second updates)
- Test mode with realistic simulated data (works offline & on weekends, no API key required)
- Dual chart types: Line charts and Candlestick charts with separate timeframes
- Technical indicators: SMA 20/50, Bollinger Bands, RSI with custom legend tooltips
- Redesigned price tickers with bid/ask, mid-price, and dynamic spread
- Support for 10 curated forex pairs (majors, crosses, and emerging markets)
- Responsive dashboard with live price updates and directional indicators
- Automatic reconnection and localStorage persistence

**Tech Stack:** React 19, TypeScript, Vite, Chart.js 4.5, chartjs-chart-financial

[View detailed documentation →](./forex-visualizer/README.md)

## Getting Started

Each project has its own directory with complete documentation and setup instructions. Navigate to the project directory and follow the README.

## License

MIT
