'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Store, Users, Calendar } from 'lucide-react';
import { adminDashboardService, GrowthMetrics } from '@/services/adminDashboardService';

export function GrowthMetricsCards() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminDashboardService.getGrowthMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas de crescimento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Total de Lojas"
        value={metrics.totalLojas}
        icon={<Store className="h-5 w-5 text-blue-600" />}
      />
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClientes}
        icon={<Users className="h-5 w-5 text-green-600" />}
      />
      <MetricCard
        title="Total de Resgates"
        value={metrics.totalResgates}
        icon={<Calendar className="h-5 w-5 text-purple-600" />}
      />
    </div>
  );
}

function MetricCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}