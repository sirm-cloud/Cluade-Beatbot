import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import type { PriceHistory } from '../types/primeapi';
import './ForexChart.css';

interface ForexChartProps {
  symbol: string;
  data: PriceHistory[];
  height?: number;
}

export function ForexChart({ symbol, data, height = 400 }: ForexChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const bidSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const askSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        rightPriceScale: {
          borderColor: '#3a3a3a',
        },
        timeScale: {
          borderColor: '#3a3a3a',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Create bid line series (green) - using proper v5 API
      const bidSeries = chart.addLineSeries({
        color: '#4ade80',
        lineWidth: 2,
        title: 'Bid',
      });
      bidSeriesRef.current = bidSeries;

      // Create ask line series (red)
      const askSeries = chart.addLineSeries({
        color: '#f87171',
        lineWidth: 2,
        title: 'Ask',
      });
      askSeriesRef.current = askSeries;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    } catch (err) {
      console.error('Error creating chart:', err);
      setError(err instanceof Error ? err.message : 'Failed to create chart');
    }
  }, [height]);

  useEffect(() => {
    if (!bidSeriesRef.current || !askSeriesRef.current || data.length === 0) return;

    try {
      const bidData = data.map((item) => ({
        time: item.time,
        value: item.bid,
      }));

      const askData = data.map((item) => ({
        time: item.time,
        value: item.ask,
      }));

      bidSeriesRef.current.setData(bidData);
      askSeriesRef.current.setData(askData);

      // Auto-scale to fit data
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('Error setting chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to update chart');
    }
  }, [data]);

  if (error) {
    return (
      <div className="forex-chart">
        <div className="chart-header">
          <h3>{symbol}</h3>
          <span className="error-text">Chart error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="forex-chart">
      <div className="chart-header">
        <h3>{symbol}</h3>
        <span className="data-points">{data.length} data points</span>
      </div>
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
}
