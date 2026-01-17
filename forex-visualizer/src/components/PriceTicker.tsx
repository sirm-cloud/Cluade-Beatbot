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

  // Split price into main and decimal parts for better visual hierarchy
  const splitPrice = (value: number) => {
    const formatted = formatPrice(value);
    const parts = formatted.split('.');
    return {
      whole: parts[0],
      decimal: parts[1],
    };
  };

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

  const midPrice = splitPrice(currentMid);
  const bidPrice = splitPrice(price.bid);
  const askPrice = splitPrice(price.ask);

  return (
    <div className="price-ticker">
      <div className="ticker-header">
        <div className="ticker-title">
          <h3 className="ticker-symbol">{price.symbol}</h3>
          <span className="ticker-time">
            {new Date(price.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="ticker-change" style={{ color: getChangeColor() }}>
          {getChangeText()}
        </div>
      </div>

      <div className="bid-ask-section">
        <div className="price-item bid">
          <span className="price-label">BID</span>
          <div className="price-value">
            <span className="price-whole">{bidPrice.whole}</span>
            <span className="price-decimal">.{bidPrice.decimal}</span>
          </div>
        </div>
        <div className="divider"></div>
        <div className="price-item ask">
          <span className="price-label">ASK</span>
          <div className="price-value">
            <span className="price-whole">{askPrice.whole}</span>
            <span className="price-decimal">.{askPrice.decimal}</span>
          </div>
        </div>
      </div>

      <div className="mid-price-section">
        <span className="mid-label">MID PRICE</span>
        <div className="mid-price-value">
          <span className="direction-indicator" style={{ color: getChangeColor() }}>
            {priceChange.direction === 'up' ? '↑' : priceChange.direction === 'down' ? '↓' : '−'}
          </span>
          <span className="price-display">{formatPrice(currentMid)}</span>
        </div>
      </div>

      <div className="spread-section">
        <span className="spread-label">SPREAD</span>
        <span className="spread-value">{formatSpread(price.spread)} pips</span>
      </div>
    </div>
  );
}
