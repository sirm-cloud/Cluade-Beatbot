import { useRef, useEffect, useState } from 'react';
import type { ForexPrice } from '../types/primeapi';
import './PriceTicker.css';

interface PriceTickerProps {
  price: ForexPrice;
}

export function PriceTicker({ price }: PriceTickerProps) {
  const prevMidRef = useRef<number | null>(null);
  const [priceChange, setPriceChange] = useState<{
    direction: 'up' | 'down' | 'neutral';
    valueChange: number;
    percentage: number;
    hasData: boolean;
  }>({
    direction: 'neutral',
    valueChange: 0,
    percentage: 0,
    hasData: false,
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
        valueChange: change,
        percentage: Math.abs(percentChange),
        hasData: true,
      });
    }
    prevMidRef.current = currentMid;
  }, [currentMid]);

  const getChangeColor = () => {
    if (priceChange.direction === 'up') return '#4ade80';
    if (priceChange.direction === 'down') return '#f87171';
    return '#9ca3af';
  };

  const getChangeText = () => {
    if (!priceChange.hasData) return '−';
    const sign = priceChange.valueChange >= 0 ? '+' : '';
    return `${sign}${priceChange.valueChange.toFixed(5)} (${sign}${priceChange.percentage.toFixed(2)}%)`;
  };

  return (
    <div className="price-ticker">
      <div className="ticker-header">
        <div className="ticker-title">
          <h3 className="ticker-symbol">{price.symbol}</h3>
          <div className="ticker-change" style={{ color: getChangeColor() }}>
            {getChangeText()}
          </div>
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
