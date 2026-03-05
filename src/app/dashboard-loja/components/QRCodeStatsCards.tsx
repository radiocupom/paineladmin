'use client';

import { Card, CardContent } from '@/components/ui/card';
import { QRCodeStats } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface QRCodeStatsCardsProps {
  stats: QRCodeStats;
}

export function QRCodeStatsCards({ stats }: QRCodeStatsCardsProps) {
  const cards = [
    {
      titulo: 'Total QR Codes',
      valor: stats.totais.resgatados,
      icone: AlertCircle,
      cor: 'text-gray-600',
      bg: 'bg-gray-50',
      descricao: `${stats.totais.pendentes} pendentes`
    },
    {
      titulo: 'Validados',
      valor: stats.totais.validados,
      icone: CheckCircle2,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: formatters.percentual(stats.taxaValidacao)
    },
    {
      titulo: 'Pendentes',
      valor: stats.totais.pendentes,
      icone: Clock,
      cor: 'text-yellow-600',
      bg: 'bg-yellow-50',
      descricao: 'Aguardando validação'
    },
    {
      titulo: 'Tempo Médio',
      valor: stats.tempoMedioValidacao,
      icone: TrendingUp,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: 'horas para validar'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{card.titulo}</span>
              <div className={`p-1.5 rounded-full ${card.bg}`}>
                <card.icone className={`h-3 w-3 ${card.cor}`} />
              </div>
            </div>
            <div className={`text-lg font-bold ${card.cor}`}>
              {typeof card.valor === 'number' ? 
                (card.titulo === 'Tempo Médio' ? card.valor.toFixed(1) : card.valor.toLocaleString()) 
                : card.valor}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{card.descricao}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}