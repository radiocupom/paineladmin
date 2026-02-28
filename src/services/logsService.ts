import api from './api';

export interface LogEntry {
  type: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: any;
}

class LogsService {
  private ws: WebSocket | null = null;
  private listeners: ((log: LogEntry) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Conectar ao stream de logs
   */
  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Limpar timer de reconexão anterior
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      const token = localStorage.getItem('@raiocupon:token');
      if (!token) {
        reject(new Error('Token não encontrado'));
        return;
      }

      // Verificar role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'superadmin') {
          reject(new Error('Apenas superadmin pode ver logs'));
          return;
        }
      } catch (e) {
        // Erro silencioso
      }

      const wsUrl = `ws:/api.radiocupom.online/ws/logs?token=${token}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const log: LogEntry = JSON.parse(event.data);
          this.listeners.forEach(listener => listener(log));
        } catch (error) {
          // Erro silencioso
        }
      };

      this.ws.onerror = () => {
        // ❌ NÃO LOGAR ERRO - apenas tratar silenciosamente
        // O WebSocket fecha e reconecta, isso é normal
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.reconnect();
      };
    });
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {});
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onLog(callback: (log: LogEntry) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const logsService = new LogsService();
export const useLogs = () => logsService;