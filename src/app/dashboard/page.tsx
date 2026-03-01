'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth';
import { DashboardMenu } from '@/app/dashboard/components/menu';
import { StatsOverview } from '@/app/dashboard/components/stats-overview';
import { GrowthMetrics } from '@/app/dashboard/components/growth-metrics';
import { StoreDistribution } from '@/app/dashboard/components/store-distribution';
import { RecentTransactions } from '@/app/dashboard/components/recent-transactions';
import { StoreRanking } from '@/app/dashboard/components/store-ranking';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      if (!user) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Visão geral do sistema RadioCupon
          </p>
        </div>
        <div className="flex-shrink-0">
          <DashboardMenu />
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Grid de 2 colunas para transações e métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <GrowthMetrics />
        </div>
      </div>

      {/* Grid de 2 colunas para distribuição e ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StoreDistribution />
        <StoreRanking />
      </div>

      {/* Rodapé da página (opcional) */}
      <div className="text-center pt-4 sm:pt-6">
        <p className="text-xs text-gray-400">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}