'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminDashboardService, QRCodeStats, formatters } from '@/services/adminDashboardService';

export function QRCodeStatsCards() {
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminDashboardService.getQrCodeStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats de QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Totais"
        icon={<QrCode className="h-5 w-5 text-blue-600" />}
        stats={stats.totais}
      />
      <StatCard
        title="Hoje"
        icon={<Clock className="h-5 w-5 text-green-600" />}
        stats={stats.hoje}
      />
      <StatCard
        title="Semana"
        icon={<Clock className="h-5 w-5 text-yellow-600" />}
        stats={stats.semana}
      />
      <StatCard
        title="Mês"
        icon={<Clock className="h-5 w-5 text-purple-600" />}
        stats={stats.mes}
      />
      
      <Card className="col-span-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Taxa de Validação</p>
              <p className="text-2xl font-bold">{formatters.percentual(stats.taxaValidacao)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tempo Médio Validação</p>
              <p className="text-2xl font-bold">{stats.tempoMedioValidacao.toFixed(1)}h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, icon, stats }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Resgatados:</span>
            <span className="text-sm font-medium">{stats.resgatados}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Validados:</span>
            <span className="text-sm font-medium text-green-600">{stats.validados}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Pendentes:</span>
            <span className="text-sm font-medium text-yellow-600">{stats.pendentes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}