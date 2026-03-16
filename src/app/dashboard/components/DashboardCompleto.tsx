'use client';

import { useEffect, useState } from 'react';
import { adminDashboardService, AdminDashboardData } from '@/services/adminDashboardService';
import { StatsOverview } from './stats-overview'
import { RecentTransactions } from './recent-transactions'
import { CuponsPopulares } from './CuponsPopulares';
import { ResgatesPorDiaChart } from './ResgatesPorDiaChart';
import { QRCodeStatsCards } from './QRCodeStatsCards';
import { StoreDistribution } from './store-distribution';
import { StoreRanking } from './store-ranking';
import { GrowthMetricsCards } from './GrowthMetricsCards';

export function DashboardCompleto() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const dashboardData = await adminDashboardService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando dashboard...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      
      {/* KPIs */}
      <StatsOverview />
      
      {/* Métricas de Crescimento */}
      <GrowthMetricsCards />
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResgatesPorDiaChart />
        <StoreDistribution />
      </div>
      
      {/* QR Code Stats */}
      <QRCodeStatsCards />
      
      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions />
        <CuponsPopulares />
        <StoreRanking />
      </div>
    </div>
  );
}