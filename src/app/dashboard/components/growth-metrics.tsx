'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store, Ticket } from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';

const colorVariants = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

export function GrowthMetrics() {
  const [data, setData] = useState<GrowthMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await adminDashboardService.getGrowthMetrics();
        setData(response);
      } catch (error) {
        // Erro silencioso - apenas log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao carregar métricas de crescimento');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="space-y-3">
              <div className="h-2 w-24 sm:w-32 bg-gray-200 animate-pulse rounded mx-auto"></div>
              <div className="h-2 w-16 sm:w-20 bg-gray-200 animate-pulse rounded mx-auto"></div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: 'Total de Lojas',
      value: data.totalLojas,
      icon: Store,
      color: 'blue' as const,
    },
    {
      title: 'Total de Clientes',
      value: data.totalClientes,
      icon: Users,
      color: 'green' as const,
    },
    {
      title: 'Total de Resgates',
      value: data.totalResgates,
      icon: Ticket,
      color: 'purple' as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Métricas Gerais</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const colors = colorVariants[metric.color];

            return (
              <div 
                key={index} 
                className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.text}`} />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-1">{metric.title}</p>
                <p className="text-base sm:text-lg md:text-xl font-bold truncate">
                  {metric.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}