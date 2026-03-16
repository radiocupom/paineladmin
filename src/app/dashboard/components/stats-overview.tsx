'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Store, Users, Ticket, Calendar, DollarSign, TrendingUp, TrendingDown, CreditCard,
  QrCode, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { adminDashboardService, AdminKPIs, formatters } from '@/services/adminDashboardService';

export function StatsOverview() {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await adminDashboardService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Lojas */}
      <StatCard
        title="Lojas"
        value={kpis.totalLojas}
        icon={<Store className="h-5 w-5 text-blue-600" />}
        subtitle={`${kpis.lojasAtivas} ativas • ${kpis.lojasInativas} inativas`}
      />

      {/* Usuários */}
      <StatCard
        title="Usuários"
        value={kpis.totalUsuarios}
        icon={<Users className="h-5 w-5 text-purple-600" />}
      />

      {/* Clientes */}
      <StatCard
        title="Clientes"
        value={kpis.totalClientes}
        icon={<Users className="h-5 w-5 text-green-600" />}
      />

      {/* Cupons */}
      <StatCard
        title="Cupons"
        value={kpis.totalCupons}
        icon={<Ticket className="h-5 w-5 text-orange-600" />}
        subtitle={`${kpis.cuponsAtivos} ativos • ${kpis.cuponsExpirados} expirados`}
      />

      {/* Resgates */}
      <StatCard
        title="Resgates"
        value={kpis.totalResgates}
        icon={<Calendar className="h-5 w-5 text-red-600" />}
        subtitle={`Hoje: ${kpis.resgatesHoje} • Mês: ${kpis.resgatesMes}`}
      />

      {/* QR Codes */}
      <StatCard
        title="QR Codes"
        value={kpis.totalQrCodes}
        icon={<QrCode className="h-5 w-5 text-indigo-600" />}
        subtitle={`${kpis.qrCodesValidados} validados • ${kpis.qrCodesPendentes} pendentes`}
      />

      {/* Financeiro */}
      <StatCard
        title="Valor Vendido"
        value={formatters.moeda(kpis.valorTotalVendido)}
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
      />

      <StatCard
        title="Economia"
        value={formatters.moeda(kpis.valorTotalEconomizado)}
        icon={<TrendingDown className="h-5 w-5 text-yellow-600" />}
      />

      <StatCard
        title="Ticket Médio"
        value={formatters.moeda(kpis.ticketMedio)}
        icon={<CreditCard className="h-5 w-5 text-purple-600" />}
      />

      <StatCard
        title="Taxa Conversão"
        value={formatters.percentual(kpis.taxaConversao)}
        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
      />
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}