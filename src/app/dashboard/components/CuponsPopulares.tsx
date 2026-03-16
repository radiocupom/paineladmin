'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, TrendingUp, Store } from 'lucide-react';
import { adminDashboardService, CupomPopular, formatters } from '@/services/adminDashboardService';

export function CuponsPopulares() {
  const [cupons, setCupons] = useState<CupomPopular[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminDashboardService.getCuponsPopulares(5);
      setCupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons populares:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Cupons Mais Resgatados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cupons.map((cupom) => (
            <div key={cupom.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{cupom.descricao}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Store className="h-3 w-3" />
                  <span>{cupom.lojaNome}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {cupom.totalResgates} resgates
                </p>
                <p className="text-xs text-gray-500">
                  {formatters.moeda(cupom.valorTotalGerado)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}