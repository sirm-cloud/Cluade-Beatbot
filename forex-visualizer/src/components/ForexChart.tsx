import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
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
  const seriesRef = useRef<any>(null);
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

      // v5 API: Try minimal line series first
      const series = (chart as any).addSeries({
        type: 'Line',
      });

      // Apply styling after creation
      series.applyOptions({
        color: '#4ade80',
        lineWidth: 2,
      });

      console.log('Successfully created Line series!');
      seriesRef.current = series;

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
    if (!seriesRef.current || !data || data.length === 0) return;

    try {
      // Use mid price (average of bid and ask)
      const chartData = data.map((item) => ({
        time: item.time,
        value: item.mid,
      }));

      seriesRef.current.setData(chartData);

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
          <span className="error-text" style={{ color: '#f87171', fontSize: '12px' }}>
            Chart unavailable (see price tickers above)
          </span>
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
