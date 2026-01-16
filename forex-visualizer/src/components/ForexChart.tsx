import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import type { PriceHistory } from '../types/primeapi';
import './ForexChart.css';

// Register Chart.js components
Chart.register(
  LineController,
  CandlestickController,
  CandlestickElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForexChartProps {
  symbol: string;
  data: PriceHistory[];
  height?: number;
}

type Timeframe = 'all' | '1m' | '5m' | '15m' | '1h';
type ChartType = 'line' | 'candlestick';

interface CandleData {
  x: number;
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
}

export function ForexChart({ symbol, data, height = 400 }: ForexChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartType, setChartType] = useState<ChartType>('line');

  // Filter data based on selected timeframe (fx1s = 1 second data)
  const getFilteredData = () => {
    if (timeframe === 'all') return data;

    const timeframeMap: Record<Exclude<Timeframe, 'all'>, number> = {
      '1m': 60,    // 60 seconds
      '5m': 300,   // 5 minutes
      '15m': 900,  // 15 minutes
      '1h': 3600,  // 1 hour
    };

    const limit = timeframeMap[timeframe];
    return data.slice(-limit);
  };

  const filteredData = getFilteredData();

  // Aggregate data into candles for candlestick chart
  const aggregateToCandles = (rawData: PriceHistory[]): CandleData[] => {
    if (rawData.length === 0) return [];

    // Determine candle interval based on timeframe
    const candleIntervalMap: Record<Timeframe, number> = {
      '1m': 3,     // 3-second candles
      '5m': 10,    // 10-second candles
      '15m': 30,   // 30-second candles
      '1h': 60,    // 60-second candles
      'all': Math.max(5, Math.floor(rawData.length / 100)), // Adaptive
    };

    const interval = candleIntervalMap[timeframe];
    const candles: CandleData[] = [];

    for (let i = 0; i < rawData.length; i += interval) {
      const chunk = rawData.slice(i, Math.min(i + interval, rawData.length));
      if (chunk.length === 0) continue;

      // Use mid price for OHLC
      const midPrices = chunk.map(item => (item.bid + item.ask) / 2);
      const open = midPrices[0];
      const close = midPrices[midPrices.length - 1];
      const high = Math.max(...midPrices);
      const low = Math.min(...midPrices);

      candles.push({
        x: chunk[0].time * 1000, // Convert to milliseconds
        o: open,
        h: high,
        l: low,
        c: close,
      });
    }

    return candles;
  };

  // Format labels based on timeframe
  const formatLabel = (timestamp: number, index: number, totalPoints: number) => {
    const date = new Date(timestamp * 1000);

    switch (timeframe) {
      case '1m':
        // For 1 minute: show every 10 seconds (MM:SS format)
        if (index % 10 === 0 || index === totalPoints - 1) {
          return date.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' });
        }
        return '';
      case '5m':
        // For 5 minutes: show every 30 seconds
        if (index % 30 === 0 || index === totalPoints - 1) {
          return date.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' });
        }
        return '';
      case '15m':
        // For 15 minutes: show every 2 minutes (120 seconds)
        if (index % 120 === 0 || index === totalPoints - 1) {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return '';
      case '1h':
        // For 1 hour: show every 10 minutes (600 seconds)
        if (index % 600 === 0 || index === totalPoints - 1) {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return '';
      case 'all':
      default:
        // For all data: show sparse labels
        const skipFactor = Math.max(1, Math.floor(totalPoints / 10));
        if (index % skipFactor === 0 || index === totalPoints - 1) {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return '';
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    let config;

    if (chartType === 'line') {
      // Prepare chart data with timeframe-aware labels for line chart
      const labels = filteredData.map((item, index) =>
        formatLabel(item.time, index, filteredData.length)
      );

      config = {
        type: 'line' as const,
        data: {
          labels,
          datasets: [
            {
              label: 'Bid',
              data: filteredData.map((item) => item.bid),
              borderColor: 'rgb(74, 222, 128)',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: 'Ask',
              data: filteredData.map((item) => item.ask),
              borderColor: 'rgb(248, 113, 113)',
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                color: '#d1d4dc',
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#667eea',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#d1d4dc',
                maxRotation: 0,
                autoSkip: false,
                font: {
                  size: 10,
                },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
            },
            y: {
              ticks: {
                color: '#d1d4dc',
                callback: function (value) {
                  return (value as number).toFixed(5);
                },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        },
      };
    } else {
      // Candlestick chart
      const candles = aggregateToCandles(filteredData);

      config = {
        type: 'candlestick' as const,
        data: {
          datasets: [
            {
              label: symbol,
              data: candles,
              borderColor: '#667eea',
              color: {
                up: 'rgb(74, 222, 128)',
                down: 'rgb(248, 113, 113)',
                unchanged: '#9ca3af',
              },
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#667eea',
              borderWidth: 1,
              callbacks: {
                label: function (context: any) {
                  const point = context.raw;
                  return [
                    `Open: ${point.o.toFixed(5)}`,
                    `High: ${point.h.toFixed(5)}`,
                    `Low: ${point.l.toFixed(5)}`,
                    `Close: ${point.c.toFixed(5)}`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              type: 'time' as const,
              time: {
                unit: timeframe === '1m' ? 'second' : 'minute',
              },
              ticks: {
                color: '#d1d4dc',
                maxRotation: 0,
                font: {
                  size: 10,
                },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
            },
            y: {
              ticks: {
                color: '#d1d4dc',
                callback: function (value) {
                  return (value as number).toFixed(5);
                },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        },
      };
    }

    // Create new chart
    chartRef.current = new Chart(ctx, config as any);

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [filteredData, symbol, timeframe, chartType]);

  if (!data || data.length === 0) {
    return (
      <div className="forex-chart">
        <div className="chart-header">
          <h3>{symbol}</h3>
          <span className="data-points" style={{ opacity: 0.6 }}>
            Waiting for data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="forex-chart">
      <div className="chart-header">
        <h3>{symbol}</h3>
        <div className="chart-controls">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="chart-type-selector"
          >
            <option value="line">Line</option>
            <option value="candlestick">Candlestick</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="timeframe-selector"
          >
            <option value="1m">1 minute</option>
            <option value="5m">5 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="1h">1 hour</option>
            <option value="all">All data</option>
          </select>
        </div>
      </div>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
