import { useRef, useEffect, useState } from 'react';
import type { ForexPrice } from '../types/primeapi';
import './PriceTicker.css';

interface PriceTickerProps {
  price: ForexPrice;
}

export function PriceTicker({ price }: PriceTickerProps) {
  const prevMidRef = useRef<number | null>(null);
  const [priceChange, setPriceChange] = useState<{ direction: 'up' | 'down' | 'neutral'; percentage: number }>({
    direction: 'neutral',
    percentage: 0,
  });

  const formatPrice = (value: number) => value.toFixed(5);
  const formatSpread = (value: number) => (value * 10000).toFixed(1); // In pips

  const currentMid = (price.bid + price.ask) / 2;

  useEffect(() => {
    if (prevMidRef.current !== null) {
      const change = currentMid - prevMidRef.current;
      const percentChange = (change / prevMidRef.current) * 100;

      setPriceChange({
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        percentage: Math.abs(percentChange),
      });
    }
    prevMidRef.current = currentMid;
  }, [currentMid]);

  const getChangeColor = () => {
    if (priceChange.direction === 'up') return '#4ade80';
    if (priceChange.direction === 'down') return '#f87171';
    return '#9ca3af';
  };

  const getChangeArrow = () => {
    if (priceChange.direction === 'up') return '↑';
    if (priceChange.direction === 'down') return '↓';
    return '−';
  };

  return (
    <div className="price-ticker">
      <div className="ticker-header">
        <h3 className="ticker-symbol">{price.symbol}</h3>
        <div className="ticker-change" style={{ color: getChangeColor() }}>
          <span className="change-arrow">{getChangeArrow()}</span>
          <span className="change-percentage">{priceChange.percentage.toFixed(3)}%</span>
        </div>
        <span className="ticker-time">
          {new Date(price.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="ticker-prices">
        <div className="price-item bid">
          <span className="price-label">BID</span>
          <span className="price-value">{formatPrice(price.bid)}</span>
        </div>
        <div className="price-item ask">
          <span className="price-label">ASK</span>
          <span className="price-value">{formatPrice(price.ask)}</span>
        </div>
        <div className="price-item spread">
          <span className="price-label">SPREAD</span>
          <span className="price-value">{formatSpread(price.spread)} pips</span>
        </div>
      </div>
    </div>
  );
}
