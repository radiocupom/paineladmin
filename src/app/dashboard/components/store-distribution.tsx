'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  dashboardService,
  StoreDistribution as StoreDistributionType
} from '@/services/dashboardService';
import { PieChart, Store } from 'lucide-react';

interface CategoryWithPercentage extends StoreDistributionType {
  percentage: number;
  color: string;
}

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-gray-500'
];

export function StoreDistribution() {
  const [categories, setCategories] = useState<CategoryWithPercentage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dashboardService.getStoreDistribution();

        const normalized = data.map((item: any) => ({
          categoria: item.categoria,
          count: item._count?.id ?? 0
        }));

        const total = normalized.reduce((acc, item) => acc + item.count, 0);

        const formatted = normalized.map((item, index) => ({
          ...item,
          percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
          color: colors[index % colors.length]
        }));

        setCategories(formatted);

      } catch (error) {
        // Erro silencioso - apenas log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao buscar distribuição de lojas');
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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
                  <div className="h-2 sm:h-3 bg-gray-300 animate-pulse rounded-full w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <PieChart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3" />
            <p className="text-xs sm:text-sm text-gray-500">Nenhuma categoria encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Distribuição por Categoria</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          {categories.map((cat, index) => (
            <div key={index} className="space-y-1 sm:space-y-2">
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 text-xs sm:text-sm">
                <span className="font-medium truncate">{cat.categoria}</span>
                <span className="text-gray-500 whitespace-nowrap">
                  {cat.count} {cat.count === 1 ? 'loja' : 'lojas'} ({cat.percentage}%)
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
                <div
                  className={`${cat.color} h-2 sm:h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}

          {/* Total de lojas */}
          <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-medium text-gray-700">Total de Lojas</span>
              <span className="text-gray-900 font-bold">
                {categories.reduce((acc, cat) => acc + cat.count, 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}