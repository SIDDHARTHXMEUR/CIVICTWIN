export type TelemetryCallback = (sensors: any[]) => void;
export type AlertCallback = (message: string) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private telemetryCallbacks: Set<TelemetryCallback> = new Set();
  private alertCallbacks: Set<AlertCallback> = new Set();
  private isConnected = false;
  private reconnectTimer: any = null;

  connect() {
    if (this.ws || this.isConnected) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')
      : `${protocol}//${window.location.host}`;

    const wsUrl = `${host}/ws/websocket`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        // STOMP CONNECT frame
        this.ws?.send('CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\0');
        
        // Subscribe to /topic/telemetry and /topic/alerts
        setTimeout(() => {
          this.ws?.send('SUBSCRIBE\nid:sub-0\ndestination:/topic/telemetry\n\n\0');
          this.ws?.send('SUBSCRIBE\nid:sub-1\ndestination:/topic/alerts\n\n\0');
        }, 500);
      };

      this.ws.onmessage = (event) => {
        const text = event.data;
        if (text.includes('destination:/topic/telemetry')) {
          const bodyIndex = text.indexOf('\n\n');
          if (bodyIndex !== -1) {
            const body = text.substring(bodyIndex + 2, text.length - 1).trim();
            try {
              const sensors = JSON.parse(body);
              this.telemetryCallbacks.forEach(cb => cb(sensors));
            } catch (e) {
              // Ignore parse error
            }
          }
        } else if (text.includes('destination:/topic/alerts')) {
          const bodyIndex = text.indexOf('\n\n');
          if (bodyIndex !== -1) {
            const body = text.substring(bodyIndex + 2, text.length - 1).trim();
            this.alertCallbacks.forEach(cb => cb(body));
          }
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  subscribeTelemetry(callback: TelemetryCallback) {
    this.telemetryCallbacks.add(callback);
    return () => this.telemetryCallbacks.delete(callback);
  }

  subscribeAlerts(callback: AlertCallback) {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const wsClient = new WebSocketClient();
