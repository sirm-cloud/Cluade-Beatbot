import type {
  AuthMessage,
  SubscribeMessage,
  DownstreamMessage,
  PriceMessage,
  ForexPrice,
} from '../types/primeapi';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

export interface PrimeAPIConfig {
  apiKey: string;
  url?: string;
  pairs: string[];
  stream?: 'fx' | 'fx1s';
}

export class PrimeAPIService {
  private ws: WebSocket | null = null;
  private config: PrimeAPIConfig;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  // Event handlers
  private onStatusChange?: (status: ConnectionStatus) => void;
  private onPrice?: (price: ForexPrice) => void;
  private onError?: (error: string) => void;
  private onSubscribeSuccess?: () => void;

  constructor(config: PrimeAPIConfig) {
    this.config = {
      url: 'wss://euc2.primeapi.io',
      stream: 'fx1s', // Default to 1 msg/sec to avoid overwhelming
      ...config,
    };
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    this.setStatus('connecting');
    this.ws = new WebSocket(this.config.url!);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.setStatus('connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: DownstreamMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.setStatus('error');
      this.onError?.('WebSocket connection error');
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.setStatus('disconnected');
      this.attemptReconnect();
    };
  }

  private handleMessage(message: DownstreamMessage) {
    switch (message.op) {
      case 'connect':
        console.log('Server connected:', message.msg);
        this.authenticate();
        break;

      case 'auth':
        if (message.status === 200) {
          console.log('Authenticated successfully');
          this.setStatus('authenticated');
          this.subscribe();
        } else {
          console.error('Authentication failed:', message.msg);
          this.onError?.(`Authentication failed: ${message.msg}`);
          this.setStatus('error');
        }
        break;

      case 'subscribe':
        if (message.status === 200) {
          console.log('Subscribed successfully:', message.msg);
          this.onSubscribeSuccess?.();
        } else {
          // Ignore "No valid pairs" error - it's expected when pairs are empty
          if (message.msg?.includes('No valid pairs')) {
            console.log('[PrimeAPI] Ignoring expected error:', message.msg);
          } else {
            console.error('Subscription failed:', message.msg);
            this.onError?.(`Subscription failed: ${message.msg}`);
          }
        }
        break;

      case 'price':
        this.handlePrice(message as PriceMessage);
        break;

      default:
        console.log('Unknown message:', message);
    }
  }

  private handlePrice(message: PriceMessage) {
    const bid = parseFloat(message.bid);
    const ask = parseFloat(message.ask);
    const spread = ask - bid;

    const price: ForexPrice = {
      symbol: message.sym,
      bid,
      ask,
      spread,
      timestamp: Date.now(),
    };

    this.onPrice?.(price);
  }

  private authenticate() {
    const authMsg: AuthMessage = {
      op: 'auth',
      key: this.config.apiKey,
    };
    this.send(authMsg);
  }

  private subscribe() {
    // Don't send subscribe request with empty pairs - server returns error
    if (this.config.pairs.length === 0) {
      console.log('[PrimeAPI] No pairs to subscribe to - skipping subscription');
      return;
    }

    const subscribeMsg: SubscribeMessage = {
      op: 'subscribe',
      stream: this.config.stream!,
      pairs: this.config.pairs,
    };

    console.log('[PrimeAPI] Subscribing to pairs:', this.config.pairs);
    this.send(subscribeMsg);
  }

  private send(message: AuthMessage | SubscribeMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.onError?.('Failed to reconnect after maximum attempts');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  updatePairs(pairs: string[]) {
    const oldPairs = this.config.pairs;
    this.config.pairs = pairs;

    console.log('[PrimeAPI] Updating pairs:', {
      old: oldPairs,
      new: pairs,
      status: this.status,
    });

    if (this.status === 'authenticated') {
      if (pairs.length === 0) {
        // Don't send subscribe request with empty pairs - server returns error
        // Just log and let the UI show "select pairs" message
        console.log('[PrimeAPI] No pairs to subscribe to - skipping subscription');
      } else {
        // Re-subscribe with new pairs list
        this.subscribe();
      }
    } else {
      console.warn('[PrimeAPI] Cannot update pairs - not authenticated. Status:', this.status);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Event listeners
  setOnStatusChange(handler: (status: ConnectionStatus) => void) {
    this.onStatusChange = handler;
  }

  setOnPrice(handler: (price: ForexPrice) => void) {
    this.onPrice = handler;
  }

  setOnError(handler: (error: string) => void) {
    this.onError = handler;
  }

  setOnSubscribeSuccess(handler: () => void) {
    this.onSubscribeSuccess = handler;
  }
}
