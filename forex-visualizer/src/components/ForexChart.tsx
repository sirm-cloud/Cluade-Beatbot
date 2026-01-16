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
} from 'chart.js';
import type { PriceHistory } from '../types/primeapi';
import './ForexChart.css';

// Register Chart.js components
Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
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

export function ForexChart({ symbol, data, height = 400 }: ForexChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare chart data
    const labels = filteredData.map((item) => {
      const date = new Date(item.time * 1000);
      return date.toLocaleTimeString();
    });

    const config = {
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
        animation: false, // Disable animations for smooth real-time updates
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
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
              autoSkipPadding: 20,
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

    // Create new chart
    chartRef.current = new Chart(ctx, config);

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [filteredData, symbol]);

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
          <span className="data-points">
            {filteredData.length} / {data.length} points
          </span>
        </div>
      </div>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
