'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { LojaKPIs } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';

interface ResumoFinanceiroCardsProps {
  data: LojaKPIs['financeiro'];
  totalResgates: number;
}

export function ResumoFinanceiroCards({ data, totalResgates }: ResumoFinanceiroCardsProps) {
  const taxaConversao = totalResgates > 0 
    ? (data.valorTotalVendido / data.valorTotalResgatado) * 100 
    : 0;

  const cards = [
    {
      titulo: 'Valor Total Bruto',
      valor: data.valorTotalResgatado,
      icone: DollarSign,
      cor: 'text-orange-600',
      bg: 'bg-orange-50',
      descricao: 'Soma dos preços originais'
    },
    {
      titulo: 'Vendas Realizadas',
      valor: data.valorTotalVendido,
      icone: TrendingUp,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: `${taxaConversao.toFixed(1)}% do total`
    },
    {
      titulo: 'Economia dos Clientes',
      valor: data.valorTotalEconomizado,
      icone: TrendingDown,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: 'Desconto total concedido'
    },
    {
      titulo: 'Ticket Médio',
      valor: data.ticketMedio,
      icone: CreditCard,
      cor: 'text-purple-600',
      bg: 'bg-purple-50',
      descricao: 'Por venda realizada'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              {formatters.moeda(card.valor)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{card.descricao}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}