'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Store, 
  Users, 
  Ticket, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { dashboardService, KPIsResponse } from '@/services/dashboardService';

export function StatsOverview() {
  const [kpis, setKpis] = useState<KPIsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarKPIs();
  }, []);

  const carregarKPIs = async () => {
    try {
      const data = await dashboardService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="h-12 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const resumo = dashboardService.calcularResumoFinanceiro(kpis || {} as KPIsResponse);

  return (
    <>
      {/* Linha 1 - Métricas básicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Total de Lojas
              </CardTitle>
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {kpis?.totalLojas || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-green-600 mt-1">
              {kpis?.lojasAtivas || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Usuários
              </CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {kpis?.totalUsuarios || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Cupons Ativos
              </CardTitle>
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {kpis?.cuponsAtivos || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-red-600 mt-1">
              {kpis?.cuponsExpirados || 0} expirados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Resgates Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {kpis?.resgatesHoje || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Mês: {kpis?.resgatesMes || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2 - Métricas financeiras */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
        Métricas Financeiras
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Valor Total Bruto
              </CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {dashboardService.formatarMoeda(kpis?.valorTotalResgatado || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {kpis?.cuponsComPreco || 0} cupons com preço
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Valor Realizado
              </CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {dashboardService.formatarMoeda(kpis?.valorTotalVendido || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600 hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Economia dos Clientes
              </CardTitle>
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
              {dashboardService.formatarMoeda(kpis?.valorTotalEconomizado || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {resumo.taxaConversao.toFixed(1)}% de desconto médio
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Ticket Médio
              </CardTitle>
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
              {dashboardService.formatarMoeda(kpis?.ticketMedio || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Por venda realizada
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}