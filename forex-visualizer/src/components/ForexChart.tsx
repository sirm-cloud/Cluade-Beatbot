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
import { calculateSMA, calculateRSI, calculateBollingerBands } from '../utils/indicators';
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
  const rsiCanvasRef = useRef<HTMLCanvasElement>(null);
  const rsiChartRef = useRef<Chart | null>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    bollinger: false,
    rsi: false,
  });

  // Legend item definitions with tooltips
  const getLegendItems = () => {
    const items = [
      {
        label: 'Bid',
        color: 'rgb(74, 222, 128)',
        tooltip: 'Bid Price',
        description: 'The highest price a buyer is willing to pay for the currency pair.',
      },
      {
        label: 'Ask',
        color: 'rgb(248, 113, 113)',
        tooltip: 'Ask Price',
        description: 'The lowest price a seller is willing to accept for the currency pair.',
      },
    ];

    if (indicators.sma20) {
      items.push({
        label: 'SMA 20',
        color: 'rgb(251, 191, 36)',
        tooltip: 'Simple Moving Average (20)',
        description: 'Average of the last 20 prices. Shows short-term trend direction.',
      });
    }

    if (indicators.sma50) {
      items.push({
        label: 'SMA 50',
        color: 'rgb(139, 92, 246)',
        tooltip: 'Simple Moving Average (50)',
        description: 'Average of the last 50 prices. Shows medium-term trend direction.',
      });
    }

    if (indicators.bollinger) {
      items.push(
        {
          label: 'BB Upper',
          color: 'rgba(59, 130, 246, 0.5)',
          tooltip: 'Bollinger Band Upper',
          description: 'Upper band (+2 std dev). Price touching this may indicate overbought conditions.',
        },
        {
          label: 'BB Middle',
          color: 'rgba(59, 130, 246, 0.3)',
          tooltip: 'Bollinger Band Middle',
          description: '20-period SMA. The baseline for Bollinger Bands.',
        },
        {
          label: 'BB Lower',
          color: 'rgba(59, 130, 246, 0.5)',
          tooltip: 'Bollinger Band Lower',
          description: 'Lower band (-2 std dev). Price touching this may indicate oversold conditions.',
        }
      );
    }

    return items;
  };

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

  // Aggregate data into candles for candlestick chart using time-based intervals
  const aggregateToCandles = (rawData: PriceHistory[]): CandleData[] => {
    if (rawData.length === 0) return [];

    // Determine candle interval in seconds based on timeframe
    const candleIntervalMap: Record<Timeframe, number> = {
      '1m': 3,     // 3-second candles
      '5m': 10,    // 10-second candles
      '15m': 30,   // 30-second candles
      '1h': 60,    // 60-second candles
      'all': 5,    // 5-second candles for all data view
    };

    const intervalSeconds = candleIntervalMap[timeframe];

    // Group data by time buckets
    const buckets = new Map<number, PriceHistory[]>();

    rawData.forEach(item => {
      // Calculate the bucket start time (floor to nearest interval)
      const bucketTime = Math.floor(item.time / intervalSeconds) * intervalSeconds;

      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(item);
    });

    // Convert buckets to candles
    const candles: CandleData[] = [];
    const sortedBucketTimes = Array.from(buckets.keys()).sort((a, b) => a - b);

    sortedBucketTimes.forEach(bucketTime => {
      const bucket = buckets.get(bucketTime)!;
      const midPrices = bucket.map(item => (item.bid + item.ask) / 2);

      candles.push({
        x: bucketTime * 1000, // Convert to milliseconds
        o: midPrices[0],
        h: Math.max(...midPrices),
        l: Math.min(...midPrices),
        c: midPrices[midPrices.length - 1],
      });
    });

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

      const datasets: any[] = [
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
      ];

      // Add SMA 20 if enabled
      if (indicators.sma20) {
        const sma20 = calculateSMA(filteredData, 20);
        datasets.push({
          label: 'SMA 20',
          data: sma20,
          borderColor: 'rgb(251, 191, 36)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          indicatorInfo: {
            fullName: 'Simple Moving Average (20)',
            description: 'Average of the last 20 prices. Shows short-term trend direction.',
          },
        });
      }

      // Add SMA 50 if enabled
      if (indicators.sma50) {
        const sma50 = calculateSMA(filteredData, 50);
        datasets.push({
          label: 'SMA 50',
          data: sma50,
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          indicatorInfo: {
            fullName: 'Simple Moving Average (50)',
            description: 'Average of the last 50 prices. Shows medium-term trend direction.',
          },
        });
      }

      // Add Bollinger Bands if enabled
      if (indicators.bollinger) {
        const bollinger = calculateBollingerBands(filteredData, 20, 2);
        datasets.push(
          {
            label: 'BB Upper',
            data: bollinger.upper,
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            indicatorInfo: {
              fullName: 'Bollinger Band Upper',
              description: 'Upper band (+2 std dev). Price touching this may indicate overbought conditions.',
            },
          },
          {
            label: 'BB Middle',
            data: bollinger.middle,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            indicatorInfo: {
              fullName: 'Bollinger Band Middle',
              description: '20-period SMA. The baseline for Bollinger Bands.',
            },
          },
          {
            label: 'BB Lower',
            data: bollinger.lower,
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            indicatorInfo: {
              fullName: 'Bollinger Band Lower',
              description: 'Lower band (-2 std dev). Price touching this may indicate oversold conditions.',
            },
          }
        );
      }

      config = {
        type: 'line' as const,
        data: {
          labels,
          datasets,
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
              display: false, // Use custom HTML legend instead
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#667eea',
              borderWidth: 1,
              callbacks: {
                label: function (context: any) {
                  const dataset = context.dataset;
                  const value = context.parsed.y;
                  let label = dataset.label || '';

                  if (value !== null) {
                    label += `: ${value.toFixed(5)}`;
                  }

                  return label;
                },
                afterLabel: function (context: any) {
                  const dataset = context.dataset;
                  if (dataset.indicatorInfo) {
                    return [
                      '',
                      dataset.indicatorInfo.fullName,
                      dataset.indicatorInfo.description,
                    ];
                  }
                  return [];
                },
              },
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

      const candleDatasets: any[] = [
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
      ];

      // Add SMA 20 if enabled (as line dataset)
      if (indicators.sma20) {
        const sma20 = calculateSMA(filteredData, 20);
        candleDatasets.push({
          type: 'line',
          label: 'SMA 20',
          data: sma20.map((value, index) => ({
            x: filteredData[index].time * 1000,
            y: value,
          })),
          borderColor: 'rgb(251, 191, 36)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          indicatorInfo: {
            fullName: 'Simple Moving Average (20)',
            description: 'Average of the last 20 prices. Shows short-term trend direction.',
          },
        });
      }

      // Add SMA 50 if enabled
      if (indicators.sma50) {
        const sma50 = calculateSMA(filteredData, 50);
        candleDatasets.push({
          type: 'line',
          label: 'SMA 50',
          data: sma50.map((value, index) => ({
            x: filteredData[index].time * 1000,
            y: value,
          })),
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          indicatorInfo: {
            fullName: 'Simple Moving Average (50)',
            description: 'Average of the last 50 prices. Shows medium-term trend direction.',
          },
        });
      }

      // Add Bollinger Bands if enabled
      if (indicators.bollinger) {
        const bollinger = calculateBollingerBands(filteredData, 20, 2);
        candleDatasets.push(
          {
            type: 'line',
            label: 'BB Upper',
            data: bollinger.upper.map((value, index) => ({
              x: filteredData[index].time * 1000,
              y: value,
            })),
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            indicatorInfo: {
              fullName: 'Bollinger Band Upper',
              description: 'Upper band (+2 std dev). Price touching this may indicate overbought conditions.',
            },
          },
          {
            type: 'line',
            label: 'BB Middle',
            data: bollinger.middle.map((value, index) => ({
              x: filteredData[index].time * 1000,
              y: value,
            })),
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            indicatorInfo: {
              fullName: 'Bollinger Band Middle',
              description: '20-period SMA. The baseline for Bollinger Bands.',
            },
          },
          {
            type: 'line',
            label: 'BB Lower',
            data: bollinger.lower.map((value, index) => ({
              x: filteredData[index].time * 1000,
              y: value,
            })),
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            indicatorInfo: {
              fullName: 'Bollinger Band Lower',
              description: 'Lower band (-2 std dev). Price touching this may indicate oversold conditions.',
            },
          }
        );
      }

      config = {
        type: 'candlestick' as const,
        data: {
          datasets: candleDatasets,
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
              display: false, // Use custom HTML legend instead
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#667eea',
              borderWidth: 1,
              callbacks: {
                label: function (context: any) {
                  const dataset = context.dataset;
                  const point = context.raw;

                  // For candlestick data
                  if (point && point.o !== undefined) {
                    return [
                      `Open: ${point.o.toFixed(5)}`,
                      `High: ${point.h.toFixed(5)}`,
                      `Low: ${point.l.toFixed(5)}`,
                      `Close: ${point.c.toFixed(5)}`,
                    ];
                  }

                  // For indicator lines
                  const value = context.parsed.y;
                  let label = dataset.label || '';
                  if (value !== null) {
                    label += `: ${value.toFixed(5)}`;
                  }
                  return label;
                },
                afterLabel: function (context: any) {
                  const dataset = context.dataset;
                  if (dataset.indicatorInfo) {
                    return [
                      '',
                      dataset.indicatorInfo.fullName,
                      dataset.indicatorInfo.description,
                    ];
                  }
                  return [];
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
  }, [filteredData, symbol, timeframe, chartType, indicators]);

  // RSI Chart Effect
  useEffect(() => {
    if (!indicators.rsi || !rsiCanvasRef.current) {
      if (rsiChartRef.current) {
        rsiChartRef.current.destroy();
        rsiChartRef.current = null;
      }
      return;
    }

    const ctx = rsiCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing RSI chart
    if (rsiChartRef.current) {
      rsiChartRef.current.destroy();
    }

    const rsiData = calculateRSI(filteredData, 14);

    let labels;
    let rsiChartData;

    if (chartType === 'line') {
      labels = filteredData.map((item, index) =>
        formatLabel(item.time, index, filteredData.length)
      );
      rsiChartData = rsiData;
    } else {
      // For candlestick, use time-based x-axis
      rsiChartData = rsiData.map((value, index) => ({
        x: filteredData[index].time * 1000,
        y: value,
      }));
    }

    const rsiConfig = {
      type: chartType === 'line' ? ('line' as const) : ('line' as const),
      data: {
        labels: chartType === 'line' ? labels : undefined,
        datasets: [
          {
            label: 'RSI(14)',
            data: rsiChartData,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            indicatorInfo: {
              fullName: 'Relative Strength Index (14)',
              description: 'Momentum indicator (0-100). >70 = overbought, <30 = oversold.',
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
            display: false, // Use custom HTML legend
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 1,
            callbacks: {
              label: function (context: any) {
                const dataset = context.dataset;
                const value = context.parsed.y;
                let label = dataset.label || '';

                if (value !== null) {
                  label += `: ${value.toFixed(2)}`;
                }

                return label;
              },
              afterLabel: function (context: any) {
                const dataset = context.dataset;
                if (dataset.indicatorInfo) {
                  return [
                    '',
                    dataset.indicatorInfo.fullName,
                    dataset.indicatorInfo.description,
                  ];
                }
                return [];
              },
            },
          },
        },
        scales: {
          x: chartType === 'candlestick' ? {
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
          } : {
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
            min: 0,
            max: 100,
            ticks: {
              color: '#d1d4dc',
              stepSize: 20,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    };

    // Draw RSI levels (30 and 70)
    rsiChartRef.current = new Chart(ctx, rsiConfig as any);

    // Cleanup on unmount
    return () => {
      if (rsiChartRef.current) {
        rsiChartRef.current.destroy();
      }
    };
  }, [filteredData, indicators.rsi, chartType, timeframe]);

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
          <div className="indicator-controls">
            <label className="indicator-checkbox">
              <input
                type="checkbox"
                checked={indicators.sma20}
                onChange={(e) => setIndicators({ ...indicators, sma20: e.target.checked })}
              />
              <span>SMA 20</span>
            </label>
            <label className="indicator-checkbox">
              <input
                type="checkbox"
                checked={indicators.sma50}
                onChange={(e) => setIndicators({ ...indicators, sma50: e.target.checked })}
              />
              <span>SMA 50</span>
            </label>
            <label className="indicator-checkbox">
              <input
                type="checkbox"
                checked={indicators.bollinger}
                onChange={(e) => setIndicators({ ...indicators, bollinger: e.target.checked })}
              />
              <span>BB</span>
            </label>
            <label className="indicator-checkbox">
              <input
                type="checkbox"
                checked={indicators.rsi}
                onChange={(e) => setIndicators({ ...indicators, rsi: e.target.checked })}
              />
              <span>RSI</span>
            </label>
          </div>
        </div>
      </div>
      <div className="custom-legend" ref={legendRef}>
        {getLegendItems().map((item, index) => (
          <div key={index} className="legend-item" title={`${item.tooltip}\n${item.description}`}>
            <span
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="legend-label">{item.label}</span>
            <div className="legend-tooltip">
              <div className="legend-tooltip-title">{item.tooltip}</div>
              <div className="legend-tooltip-desc">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef}></canvas>
      </div>
      {indicators.rsi && (
        <div className="rsi-container" style={{ marginTop: '10px' }}>
          <div className="custom-legend">
            <div className="legend-item" title="Relative Strength Index (14)\nMomentum indicator (0-100). >70 = overbought, <30 = oversold.">
              <span
                className="legend-color"
                style={{ backgroundColor: 'rgb(168, 85, 247)' }}
              ></span>
              <span className="legend-label">RSI(14)</span>
              <div className="legend-tooltip">
                <div className="legend-tooltip-title">Relative Strength Index (14)</div>
                <div className="legend-tooltip-desc">Momentum indicator (0-100). &gt;70 = overbought, &lt;30 = oversold.</div>
              </div>
            </div>
          </div>
          <div style={{ height: '100px' }}>
            <canvas ref={rsiCanvasRef}></canvas>
          </div>
        </div>
      )}
    </div>
  );
}
