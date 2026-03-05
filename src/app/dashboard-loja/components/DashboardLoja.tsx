'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { lojaDashboardService, LojaDashboardData } from '@/services/dashboardLoja';
import { Button } from '@/components/ui/button';
import { RefreshCw, Store, AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Importar componentes
import { KPICards } from './KPICards';
import { ResumoFinanceiroCards } from './ResumoFinanceiroCards';
import { UltimosResgates } from './UltimosResgates';
import { CuponsPopulares } from './CuponsPopulares';
import { ResgatesPorDiaChart } from './ResgatesPorDiaChart';
import { QRCodeStatsCards } from './QRCodeStatsCards';

export function DashboardLoja() {
  const router = useRouter();
  const { user } = useAuth();
  const [dados, setDados] = useState<LojaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await lojaDashboardService.getDashboardData();
      setDados(data);
    } catch (error: any) {
      setError(error?.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Ops! Algo deu errado</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Não foi possível carregar os dados'}</p>
        <Button onClick={carregarDados} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Tentar novamente'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-5 w-5 text-orange-500" />
            <h1 className="text-xl font-bold">Olá, {dados.kpis.loja.nome}!</h1>
          </div>
          <p className="text-xs text-gray-500">
            Visão geral da sua loja • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarDados} disabled={refreshing} className="h-9 text-xs">
            <RefreshCw className={cn("h-3 w-3 mr-2", refreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button onClick={() => router.push('/dashboard-loja/cupons/novo')} className="h-9 text-xs">
            <PlusCircle className="h-3 w-3 mr-2" />
            Novo Cupom
          </Button>
        </div>
      </div>

      {/* Cards Financeiros */}
      <ResumoFinanceiroCards 
        data={dados.kpis.financeiro} 
        totalResgates={dados.kpis.resgates.total} 
      />

      {/* Cards de KPIs */}
      <KPICards data={dados.kpis} />

      {/* Grid de duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UltimosResgates resgates={dados.ultimosResgates} />
        <CuponsPopulares cupons={dados.cuponsPopulares} />
      </div>

      {/* Gráfico de resgates por dia */}
      <ResgatesPorDiaChart dados={dados.resgatesPorDia} />

      {/* Cards de QR Code Stats */}
      <QRCodeStatsCards stats={dados.qrCodeStats} />

      {/* Rodapé */}
      <div className="flex justify-between text-[10px] text-gray-400 pt-4 border-t">
        <span>ID da loja: {dados.kpis.loja.id.slice(0, 8)}...</span>
        <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
      </div>
    </div>
  );
}