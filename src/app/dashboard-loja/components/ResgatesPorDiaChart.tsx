'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ResgatesPorDiaChartProps {
  dados: any[]; // Usando any por enquanto, depois tipamos corretamente
}

interface DadoProcessado {
  dia: string;
  data: string;
  total: number;
  valorTotal: number;
  dataObj: Date | null;
}

export function ResgatesPorDiaChart({ dados }: ResgatesPorDiaChartProps) {
  const [dadosProcessados, setDadosProcessados] = useState<DadoProcessado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('📊 ResgatesPorDiaChart - dados recebidos:', dados);

    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      console.log('⚠️ Nenhum dado recebido ou array vazio');
      setDadosProcessados([]);
      setIsLoading(false);
      return;
    }

    // 🔥 DEBUG - Mostrar o formato real dos dados
    console.log('🔍 Primeiro item (formato real):', dados[0]);
    console.log('🔍 Keys do primeiro item:', Object.keys(dados[0]));

    // 🔥 ADAPTAR do formato do backend para o formato esperado
    const processados = dados
      .filter(item => item && typeof item === 'object')
      .map(item => {
        // Extrair a data do resgatadoEm
        const dataString = item.resgatadoEm?.split('T')[0] || '';
        
        // Criar nome do dia da semana
        let nomeDia = '?';
        let dataObj: Date | null = null;
        
        try {
          if (dataString) {
            dataObj = new Date(dataString);
            if (!isNaN(dataObj.getTime())) {
              nomeDia = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            }
          }
        } catch {
          dataObj = null;
        }

        return {
          dia: nomeDia,
          data: dataString,
          total: typeof item._count === 'number' ? item._count : 1, // Assume 1 se não tiver _count
          valorTotal: item._sum?.quantidade || 0,
          dataObj
        };
      });

    console.log('✅ Dados processados:', processados);
    console.log('📊 Quantidade processada:', processados.length);
    
    setDadosProcessados(processados);
    setIsLoading(false);

  }, [dados]);

  // Estado de loading
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            Resgates por Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não há dados processados
  if (dadosProcessados.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Resgates por Dia
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Últimos 7 dias de atividade
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500">Nenhum dado disponível</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
              Os resgates aparecerão aqui quando houver atividade
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular máximo para as barras
  const maxResgates = Math.max(...dadosProcessados.map(d => d.total));

  // Calcular total do período
  const totalPeriodo = dadosProcessados.reduce((acc, d) => acc + d.total, 0);

  // Calcular média
  const media = dadosProcessados.length > 0 
    ? (totalPeriodo / dadosProcessados.length).toFixed(1) 
    : '0';

  // Função segura para formatar data
  const formatarData = (dataObj: Date | null, fallback: string): string => {
    if (!dataObj) return fallback || 'Data inválida';
    try {
      return dataObj.toLocaleDateString('pt-BR');
    } catch {
      return fallback || 'Data inválida';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Resgates por Dia
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Últimos 7 dias de atividade
            </CardDescription>
          </div>

          {/* Média do período */}
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            <span className="text-xs sm:text-sm font-medium text-orange-700">
              Média: {media} resgates/dia
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {dadosProcessados.map((dia, index) => {
            const porcentagem = maxResgates > 0 ? (dia.total / maxResgates) * 100 : 0;

            // Calcular tendência (comparar com dia anterior)
            const tendencia = index > 0 ?
              dia.total > dadosProcessados[index - 1].total ? 'up' :
              dia.total < dadosProcessados[index - 1].total ? 'down' : 'equal'
              : null;

            const diferenca = index > 0 
              ? Math.abs(dia.total - dadosProcessados[index - 1].total)
              : 0;

            return (
                <div key={`${dia.data}-${index}`} className="space-y-1 sm:space-y-2">
                {/* Label do dia */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize min-w-[40px] sm:min-w-[50px]">
                      {dia.dia}
                    </span>
                    <span className="text-gray-400 text-[10px] sm:text-xs">
                      {formatarData(dia.dataObj, dia.data)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">
                      {dia.total}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      resgates
                    </span>

                    {/* Indicador de tendência */}
                    {tendencia && (
                      <div
                        className={cn(
                          "flex items-center gap-0.5 text-[10px] sm:text-xs ml-2",
                          tendencia === 'up' ? 'text-green-600' : 
                          tendencia === 'down' ? 'text-red-600' : 'text-gray-400'
                        )}
                      >
                        {tendencia === 'up' && <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                        {tendencia === 'down' && <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                        <span>
                          {tendencia === 'up' ? `+${diferenca}` : `-${diferenca}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>

                  {/* Porcentagem flutuante */}
                  <span className="absolute right-0 -top-5 text-[8px] sm:text-[10px] text-gray-400 hidden sm:block">
                    {Math.round(porcentagem)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total do período */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500">Total do período</span>
              <span className="font-bold text-orange-600">
                {totalPeriodo} resgates
              </span>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[8px] sm:text-xs text-gray-400 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
              <span>Volume de resgates</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
              <span>Aumento</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
              <span>Queda</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}