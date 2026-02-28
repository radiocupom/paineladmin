'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Target, Zap, Info } from 'lucide-react';
import { KPIsLoja } from '@/services/dashboardLoja';
import { cn } from '@/lib/utils';

interface MetricasAdicionaisProps {
  kpis: KPIsLoja;
}

export function MetricasAdicionais({ kpis }: MetricasAdicionaisProps) {
  const taxaConversao = kpis.cupons.ativos > 0 
    ? ((kpis.resgates.mes / kpis.cupons.ativos) * 100).toFixed(1)
    : '0';

  const mediaDiaria = kpis.resgates.semana > 0 
    ? (kpis.resgates.semana / 7).toFixed(1)
    : '0';

  const metricas = [
    {
      title: 'Taxa de Conversão',
      value: `${taxaConversao}%`,
      description: 'resgates por cupom ativo',
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      trend: taxaConversao !== '0' ? 'positivo' : 'neutro',
    },
    {
      title: 'Média Diária',
      value: mediaDiaria,
      description: 'resgates por dia',
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      trend: mediaDiaria !== '0' ? 'positivo' : 'neutro',
    },
    {
      title: 'QR Codes Validados',
      value: `${((kpis.qrCodes.validados / (kpis.qrCodes.total || 1)) * 100).toFixed(1)}%`,
      description: `${kpis.qrCodes.validados} de ${kpis.qrCodes.total}`,
      icon: Zap,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: kpis.qrCodes.validados > 0 ? 'positivo' : 'neutro',
    },
    {
      title: 'Resgates/Mês',
      value: kpis.resgates.mes.toLocaleString(),
      description: `${((kpis.resgates.mes / (kpis.clientes.total || 1)) * 100).toFixed(1)}% dos clientes`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      trend: kpis.resgates.mes > 0 ? 'positivo' : 'neutro',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metricas.map((metrica, index) => {
        const Icon = metrica.icon;
        return (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 truncate pr-2">
                  {metrica.title}
                </CardTitle>
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                  metrica.bgColor
                )}>
                  <Icon className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4",
                    metrica.textColor
                  )} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-base sm:text-lg md:text-2xl font-bold truncate">
                {metrica.value}
              </div>
              
              <div className="flex items-center gap-1 mt-1 sm:mt-2">
                <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {metrica.description}
                </p>
              </div>

              {/* Indicador de tendência */}
              <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn(
                    "h-2.5 w-2.5 sm:h-3 sm:w-3",
                    metrica.trend === 'positivo' ? 'text-green-500' : 'text-gray-300'
                  )} />
                  <span className={cn(
                    "text-[8px] sm:text-[10px]",
                    metrica.trend === 'positivo' ? 'text-green-600' : 'text-gray-400'
                  )}>
                    {metrica.trend === 'positivo' ? 'Em crescimento' : 'Estável'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}