'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dashboardLojaService, DadosCompletosDashboard, calcularResumoFinanceiro } from '@/services/dashboardLoja';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Store, AlertCircle, Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

// Importar componentes
import { KPICards } from './components/KPICards';
import { UltimosResgates } from './components/UltimosResgates';
import { CuponsPopulares } from './components/CuponsPopulares';
import { ResgatesPorDiaChart } from './components/ResgatesPorDiaChart';
import { MetricasAdicionais } from './components/MetricasAdicionais';
import { cn } from '@/lib/utils';

// 🔥 NOVO COMPONENTE DE CARDS FINANCEIROS
function CardsFinanceiros({ resumo }: { resumo: any }) {
  const cards = [
    {
      titulo: 'Valor Total Bruto',
      valor: resumo?.totalBruto || 0,
      icone: DollarSign,
      cor: 'text-orange-600',
      bg: 'bg-orange-50',
      descricao: 'Soma dos preços originais'
    },
    {
      titulo: 'Vendas Realizadas',
      valor: resumo?.totalVendido || 0,
      icone: TrendingUp,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: `${resumo?.taxaConversao?.toFixed(1) || 0}% do total`
    },
    {
      titulo: 'Economia dos Clientes',
      valor: resumo?.totalEconomizado || 0,
      icone: TrendingDown,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: 'Desconto total concedido'
    },
    {
      titulo: 'Ticket Médio',
      valor: resumo?.ticketMedio || 0,
      icone: CreditCard,
      cor: 'text-purple-600',
      bg: 'bg-purple-50',
      descricao: 'Por venda realizada'
    }
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
          style={{ borderLeftColor: card.cor.replace('text-', '') }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">{card.titulo}</span>
            <div className={`p-1.5 rounded-full ${card.bg}`}>
              <card.icone className={`h-3 w-3 ${card.cor}`} />
            </div>
          </div>
          <div className={`text-lg font-bold ${card.cor}`}>
            {formatarMoeda(card.valor)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{card.descricao}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardLojaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dados, setDados] = useState<DadosCompletosDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await dashboardLojaService.getDadosCompletos();
        // 🔥 LOG AQUI - quando os dados são carregados
      console.log('📦 Dados recebidos da API:', data);
      console.log('📊 resgatesPorDia:', data?.resgatesPorDia);
      setDados(data);
    } catch (error) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Skeleton do cabeçalho */}
        <div className="space-y-2">
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-3 sm:h-4 w-32 sm:w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Skeleton dos cards financeiros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>

        {/* Skeleton dos KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>

        {/* Skeleton do grid de duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-64 sm:h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-64 sm:h-80 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>

        {/* Skeleton do gráfico */}
        <div className="h-48 sm:h-64 bg-gray-200 animate-pulse rounded-lg"></div>

        {/* Skeleton das métricas adicionais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 sm:h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dados) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            {error || 'Não foi possível carregar os dados do dashboard'}
          </p>
          <Button 
            onClick={carregarDados} 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Tentando...
              </>
            ) : (
              'Tentar novamente'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 🔥 Calcular resumo financeiro
  const resumoFinanceiro = calcularResumoFinanceiro(dados.kpis);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
              Olá, {dados.kpis.loja.nome || user?.nome}!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            Visão geral da sua loja • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline"
            onClick={carregarDados}
            disabled={refreshing}
            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
          >
            <RefreshCw className={cn(
              "h-3 w-3 sm:h-4 sm:w-4 mr-2",
              refreshing && "animate-spin"
            )} />
            <span className="hidden xs:inline">Atualizar</span>
            <span className="xs:hidden">Atual.</span>
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard-loja/cupons/novo')}
            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden xs:inline">Novo Cupom</span>
            <span className="xs:hidden">Criar</span>
          </Button>
        </div>
      </div>

      {/* 🔥 NOVOS CARDS FINANCEIROS */}
      <CardsFinanceiros resumo={resumoFinanceiro} />

      {/* Cards de KPIs (já existentes) */}
      <KPICards data={dados.kpis} />

      {/* Grid de duas colunas (já existente) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <UltimosResgates resgates={dados.ultimosResgates} />
        <CuponsPopulares cupons={dados.cuponsPopulares} />
      </div>

      {/* Gráfico de resgates por dia (já existente) */}
      <ResgatesPorDiaChart dados={dados.resgatesPorDia} />

      {/* Métricas adicionais (já existente) */}
      <MetricasAdicionais kpis={dados.kpis} />

      {/* Rodapé com informações da loja (já existente) */}
      <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span>ID da loja: {dados.kpis.loja.id.slice(0, 8)}...</span>
          <span className="text-green-600 font-medium">
            {dados.kpis.cupons?.comPreco || 0} cupons com preço
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}