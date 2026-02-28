'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Ticket, QrCode, Users, TrendingUp, Calendar } from 'lucide-react';
import { KPIsLoja } from '@/services/dashboardLoja';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  data: KPIsLoja;
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: 'Cupons Ativos',
      value: data.cupons.ativos,
      total: data.cupons.total,
      description: `${data.cupons.expirados} expirados`,
      icon: Ticket,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Resgates Hoje',
      value: data.resgates.hoje,
      total: data.resgates.total,
      description: `${data.resgates.mes} este mês`,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'QR Codes',
      value: data.qrCodes.validados,
      total: data.qrCodes.total,
      description: `${data.qrCodes.pendentes} pendentes`,
      icon: QrCode,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Clientes',
      value: data.clientes.total,
      description: 'clientes únicos',
      icon: Users,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 truncate pr-2">
                  {card.title}
                </CardTitle>
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                  card.bgColor
                )}>
                  <Icon className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4",
                    card.textColor
                  )} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-base sm:text-lg md:text-2xl font-bold truncate">
                {card.value.toLocaleString()}
              </div>
              
              <div className="flex flex-col gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                {card.total && (
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    de {card.total.toLocaleString()} total
                  </p>
                )}
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {card.description}
                </p>
              </div>

              {/* Mini gráfico de tendência (opcional) */}
              {card.title === 'Resgates Hoje' && data.resgates.hoje > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                    <span className="text-[8px] sm:text-[10px] text-green-600">
                      +{Math.round((data.resgates.hoje / data.resgates.total) * 100)}% hoje
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}