// PrimeAPI WebSocket message types

export interface BaseMessage {
  op: string;
  tsp?: number;
  status?: number;
  msg?: string;
}

export interface AuthMessage {
  op: 'auth';
  key: string;
}

export interface SubscribeMessage {
  op: 'subscribe';
  stream: 'fx' | 'fx1s'; // fx = real-time, fx1s = max 1 msg/sec
  pairs: string[];
}

export interface ConnectMessage extends BaseMessage {
  op: 'connect';
  status: 200;
}

export interface AuthResponse extends BaseMessage {
  op: 'auth';
  status: 200 | 401;
}

export interface SubscribeResponse extends BaseMessage {
  op: 'subscribe';
  status: 200 | 400;
}

export interface PriceMessage {
  op: 'price';
  sym: string; // e.g., "EURUSD"
  bid: string;
  ask: string;
}

export type DownstreamMessage =
  | ConnectMessage
  | AuthResponse
  | SubscribeResponse
  | PriceMessage;

export interface ForexPrice {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export interface PriceHistory {
  time: number;
  bid: number;
  ask: number;
  mid: number; // (bid + ask) / 2
}
