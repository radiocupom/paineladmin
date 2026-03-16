// app/dashboard-loja/components/MetricasAdicionais.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatters, LojaKPIs } from '@/services/dashboardLoja';
import { TrendingUp, Users, QrCode, Calendar, Clock, Percent } from 'lucide-react';

interface MetricasAdicionaisProps {
  kpis: LojaKPIs;
}

export function MetricasAdicionais({ kpis }: MetricasAdicionaisProps) {
  // Calcular métricas adicionais
  const totalBruto = kpis.financeiro?.valorTotalResgatado || 0;
  const totalVendido = kpis.financeiro?.valorTotalVendido || 0;
  const taxaConversao = totalBruto > 0 ? (totalVendido / totalBruto) * 100 : 0;
  
  const metricas = [
    {
      titulo: 'Ticket Médio',
      valor: formatters.moeda(kpis.financeiro?.ticketMedio || 0),
      icone: TrendingUp,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: 'Valor médio por venda'
    },
    {
      titulo: 'Taxa de Conversão',
      valor: formatters.percentual(taxaConversao),
      icone: Percent,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: 'Resgates que viraram vendas'
    },
    {
      titulo: 'Média por Cliente',
      valor: kpis.clientes.total > 0 
        ? (kpis.resgates.total / kpis.clientes.total).toFixed(1) 
        : '0',
      icone: Users,
      cor: 'text-purple-600',
      bg: 'bg-purple-50',
      descricao: 'Resgates por cliente'
    },
    {
      titulo: 'QR Codes/Dia',
      valor: (kpis.qrCodes.total / 30).toFixed(1),
      icone: QrCode,
      cor: 'text-orange-600',
      bg: 'bg-orange-50',
      descricao: 'Média últimos 30 dias'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metricas.map((metrica, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{metrica.titulo}</span>
              <div className={`p-1.5 rounded-full ${metrica.bg}`}>
                <metrica.icone className={`h-3 w-3 ${metrica.cor}`} />
              </div>
            </div>
            <div className={`text-lg font-bold ${metrica.cor}`}>
              {metrica.valor}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{metrica.descricao}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}