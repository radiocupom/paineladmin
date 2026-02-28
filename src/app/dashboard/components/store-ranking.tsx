'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import {
  dashboardService,
  StoreRanking as StoreRankingType
} from '@/services/dashboardService';

interface RankingItem extends StoreRankingType {
  pos: number;
}

export function StoreRanking() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const data = await dashboardService.getStoreRanking();

        const sorted = [...data].sort(
          (a, b) => b.totalResgates - a.totalResgates
        );

        const withPosition: RankingItem[] = sorted.map((item, index) => ({
          ...item,
          pos: index + 1
        }));

        setRanking(withPosition);
      } catch (error) {
        // Erro silencioso - apenas log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao buscar ranking de lojas');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Ranking de Lojas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 border-b last:border-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 animate-pulse rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Ranking de Lojas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3" />
            <p className="text-xs sm:text-sm text-gray-500">Nenhum dado de ranking disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionIcon = (pos: number) => {
    if (pos === 1) return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
    if (pos === 2) return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
    if (pos === 3) return <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Ranking de Lojas</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-1 sm:space-y-2">
          {ranking.map((store) => (
            <div
              key={store.lojaNome}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-b last:border-0 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                {getPositionIcon(store.pos) || (
                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                    {store.pos}º
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {store.lojaNome}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                    {store.totalResgates.toLocaleString('pt-BR')} resgates
                  </p>
                </div>
                
                {/* Barra de progresso relativa ao primeiro lugar */}
                {store.pos > 1 && ranking.length > 0 && (
                  <div className="mt-1 sm:mt-2 w-full bg-gray-100 rounded-full h-1 sm:h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 sm:h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (store.totalResgates / ranking[0].totalResgates) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legenda do ranking */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              <span>1º lugar</span>
            </div>
            <div className="flex items-center gap-1">
              <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span>2º lugar</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
              <span>3º lugar</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}