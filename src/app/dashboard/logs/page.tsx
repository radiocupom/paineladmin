'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Search,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  RefreshCw,
  Terminal,
  Wifi,
  WifiOff
} from 'lucide-react';
import { logsService, LogEntry } from '@/services/logsService';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await logsService.connect();
      setIsConnected(true);
      setMessage({ type: 'success', text: 'Conectado ao stream de logs' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao conectar' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    logsService.disconnect();
    setIsConnected(false);
    setMessage({ type: 'success', text: 'Desconectado' });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  useEffect(() => {
    connect();

    const unsubscribe = logsService.onLog((log) => {
      setLogs(prev => [log, ...prev].slice(0, 1000));
    });

    return () => {
      unsubscribe();
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    let filtered = logs;
    
    if (filter) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    setFilteredLogs(filtered);
  }, [logs, filter, levelFilter]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const handleClear = () => {
    setLogs([]);
    setMessage({ type: 'success', text: 'Logs limpos' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage({ type: 'success', text: `${logs.length} logs exportados` });
    setTimeout(() => setMessage(null), 3000);
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'error': return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      case 'info': return <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      default: return <Bug className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-700 border-red-200',
      warn: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
      debug: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const getLevelCount = (level: string) => {
    return logs.filter(l => l.level === level).length;
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Logs do Sistema
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Monitoramento em tempo real via WebSocket
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] sm:text-xs py-1",
              isConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
            )}
          >
            {isConnected ? <Wifi className="h-2 w-2 sm:h-3 sm:w-3 mr-1" /> : <WifiOff className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />}
            <span className="hidden xs:inline">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            {isConnecting ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : isConnected ? (
              <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleClear} className="h-7 sm:h-8 px-2 sm:px-3">
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport} className="h-7 sm:h-8 px-2 sm:px-3">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={cn(
          "p-2 sm:p-3 rounded text-xs sm:text-sm",
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-400' 
            : 'bg-red-100 text-red-700 border border-red-400'
        )}>
          {message.text}
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-2 sm:p-4">
            <p className="text-[10px] sm:text-xs text-red-600 font-medium">Erros</p>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-red-700">
              {getLevelCount('error')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-2 sm:p-4">
            <p className="text-[10px] sm:text-xs text-yellow-600 font-medium">Avisos</p>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-yellow-700">
              {getLevelCount('warn')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-2 sm:p-4">
            <p className="text-[10px] sm:text-xs text-blue-600 font-medium">Info</p>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-700">
              {getLevelCount('info')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-2 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Total</p>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-700">
              {logs.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Filtrar logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
            
            <select
              className="px-2 sm:px-3 py-1 sm:py-2 border rounded-lg bg-white text-xs sm:text-sm h-8 sm:h-10"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="error">Erros</option>
              <option value="warn">Avisos</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-3",
                autoScroll && 'bg-blue-50'
              )}
            >
              Scroll: {autoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Visualização de logs */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gray-900 rounded-lg font-mono text-xs sm:text-sm h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8 sm:py-12">
                <Terminal className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs sm:text-sm">Nenhum log encontrado</p>
                <p className="text-[10px] sm:text-xs mt-2">
                  {isConnected ? 'Aguardando logs...' : 'Conecte-se para ver os logs'}
                </p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={`${log.timestamp}-${index}`}
                  className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 sm:p-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <Badge className={cn(
                            getLevelBadge(log.level),
                            "text-[8px] sm:text-[10px] px-1 py-0"
                          )}>
                            {log.level}
                          </Badge>
                        </div>
                        
                        <pre className="text-gray-300 whitespace-pre-wrap break-words font-mono text-[10px] sm:text-xs">
                          {log.message}
                        </pre>
                        
                        {log.metadata && (
                          <pre className="text-[8px] sm:text-xs text-gray-500 mt-1 sm:mt-2 border-l-2 border-gray-700 pl-2">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import cn no topo do arquivo
import { cn } from '@/lib/utils';