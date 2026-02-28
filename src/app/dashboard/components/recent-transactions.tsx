'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { dashboardService, Transaction } from '@/services/dashboardService';
import { Clock } from 'lucide-react';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await dashboardService.getRecentTransactions();
        setTransactions(data);
      } catch (error) {
        // Erro silencioso - apenas log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao carregar transações recentes');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours} h`;
    if (diffDays === 1) return 'ontem';
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-2">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Últimas Transações</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Nenhuma transação recente</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((trans) => (
              <div
                key={trans.id}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                    {trans.cupom.loja.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {trans.cupom.loja.nome}
                  </p>

                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-[10px] sm:text-xs text-gray-500">
                    <span className="truncate">{trans.cliente.nome}</span>
                    <span className="hidden xs:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      {formatDate(trans.resgatadoEm)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                    concluído
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}