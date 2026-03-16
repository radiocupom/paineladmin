import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { adminDashboardService, RecentTransaction } from '@/services/adminDashboardService';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await adminDashboardService.getRecentTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validado': return 'text-green-600 bg-green-100';
      case 'parcial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'validado': return 'Validado';
      case 'parcial': return 'Parcial';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {transaction.cliente.nome.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{transaction.cliente.nome}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {transaction.cupom.descricao} • {transaction.cupom.loja.nome}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{new Date(transaction.resgatadoEm).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>{transaction.quantidadeValidada}/{transaction.quantidade} validados</span>
                </div>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Nenhuma transação recente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}