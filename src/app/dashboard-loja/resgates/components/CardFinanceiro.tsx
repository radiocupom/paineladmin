'use client';

import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

interface CardFinanceiroProps {
  titulo: string;
  valor: number;
  icone: typeof DollarSign | typeof TrendingUp | typeof TrendingDown | typeof CreditCard;
  cor: string;
  bg: string;
  descricao: string;
  percentual?: string;
}

export function CardFinanceiro({ 
  titulo, 
  valor, 
  icone: Icone, 
  cor, 
  bg, 
  descricao,
  percentual 
}: CardFinanceiroProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: cor.replace('text-', '') }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{titulo}</span>
        <div className={`p-1.5 rounded-full ${bg}`}>
          <Icone className={`h-3 w-3 ${cor}`} />
        </div>
      </div>
      <div className={`text-lg font-bold ${cor}`}>
        {formatarMoeda(valor)}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        {descricao}
        {percentual && <span className="ml-1 font-medium">{percentual}</span>}
      </p>
    </div>
  );
}