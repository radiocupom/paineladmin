// app/dashboard-loja/components/CardsFinanceiros.tsx
"use client";

interface ResumoFinanceiro {
  totalBruto: number;
  totalVendido: number;
  totalEconomizado: number;
  ticketMedio: number;
  taxaConversao: number;
  cuponsComPreco: number;
}

interface CardsFinanceirosProps {
  resumo: ResumoFinanceiro;
}

export function CardsFinanceiros({ resumo }: CardsFinanceirosProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor).replace('R$', 'R$');
  };

  const calcularPercentual = () => {
    if (resumo.totalBruto === 0) return '0%';
    const percentual = (resumo.totalVendido / resumo.totalBruto) * 100;
    return `${percentual.toFixed(1)}% do total`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-lg shadow border-l-4 border-orange-500">
        <p className="text-sm text-gray-500">Valor Total Bruto</p>
        <p className="text-2xl font-bold text-orange-600">
          {formatarMoeda(resumo.totalBruto)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Soma dos preços originais</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow border-l-4 border-green-500">
        <p className="text-sm text-gray-500">Vendas Realizadas</p>
        <p className="text-2xl font-bold text-green-600">
          {formatarMoeda(resumo.totalVendido)}
        </p>
        <p className="text-xs text-gray-400 mt-1">{calcularPercentual()}</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
        <p className="text-sm text-gray-500">Economia dos Clientes</p>
        <p className="text-2xl font-bold text-blue-600">
          {formatarMoeda(resumo.totalEconomizado)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Desconto total concedido</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow border-l-4 border-purple-500">
        <p className="text-sm text-gray-500">Ticket Médio</p>
        <p className="text-2xl font-bold text-purple-600">
          {formatarMoeda(resumo.ticketMedio)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Por venda realizada</p>
      </div>
    </div>
  );
}