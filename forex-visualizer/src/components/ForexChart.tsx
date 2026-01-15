import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
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

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    // Create bid line series (green)
    const bidSeries = chart.addSeries({
      type: 'Line',
      color: '#4ade80',
      lineWidth: 2,
      title: 'Bid',
    } as any);
    bidSeriesRef.current = bidSeries;

    // Create ask line series (red)
    const askSeries = chart.addSeries({
      type: 'Line',
      color: '#f87171',
      lineWidth: 2,
      title: 'Ask',
    } as any);
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
  }, [height]);

  useEffect(() => {
    if (!bidSeriesRef.current || !askSeriesRef.current || data.length === 0) return;

    const bidData: LineData[] = data.map((item) => ({
      time: item.time as LineData['time'],
      value: item.bid,
    }));

    const askData: LineData[] = data.map((item) => ({
      time: item.time as LineData['time'],
      value: item.ask,
    }));

    bidSeriesRef.current.setData(bidData);
    askSeriesRef.current.setData(askData);

    // Auto-scale to fit data
    chartRef.current?.timeScale().fitContent();
  }, [data]);

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
