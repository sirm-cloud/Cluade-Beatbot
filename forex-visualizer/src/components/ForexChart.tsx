import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PriceHistory } from '../types/primeapi';
import './ForexChart.css';

// Register Chart.js components
ChartJS.register(
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

export function ForexChart({ symbol, data, height = 400 }: ForexChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none'); // Update without animation for smooth real-time updates
    }
  }, [data]);

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

  // Prepare chart data
  const labels = data.map((item) => {
    const date = new Date(item.time * 1000);
    return date.toLocaleTimeString();
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Bid',
        data: data.map((item) => item.bid),
        borderColor: 'rgb(74, 222, 128)',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0, // Hide points for cleaner look
        pointHoverRadius: 4,
      },
      {
        label: 'Ask',
        data: data.map((item) => item.ask),
        borderColor: 'rgb(248, 113, 113)',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      title: {
        display: false,
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
          callback: function (value: any) {
            return value.toFixed(5);
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="forex-chart">
      <div className="chart-header">
        <h3>{symbol}</h3>
        <span className="data-points">{data.length} data points</span>
      </div>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
