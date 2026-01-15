import type { ForexPrice } from '../types/primeapi';
import './PriceTicker.css';

interface PriceTickerProps {
  price: ForexPrice;
}

export function PriceTicker({ price }: PriceTickerProps) {
  const formatPrice = (value: number) => value.toFixed(5);
  const formatSpread = (value: number) => (value * 10000).toFixed(1); // In pips

  return (
    <div className="price-ticker">
      <div className="ticker-header">
        <h3 className="ticker-symbol">{price.symbol}</h3>
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
