'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import { dashboardLojaService, DadosCompletosDashboard, formatarMoeda } from '@/services/dashboardLoja';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store, Loader2, AlertCircle, DollarSign, TrendingUp, TrendingDown, CreditCard, QrCode, Users, Ticket, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 🔥 REUTILIZANDO OS COMPONENTES DO DASHBOARD DA LOJA
import { KPICards } from '@/app/dashboard-loja/components/KPICards';
import { UltimosResgates } from '@/app/dashboard-loja/components/UltimosResgates';
import { CuponsPopulares } from '@/app/dashboard-loja/components/CuponsPopulares';
import { ResgatesPorDiaChart } from '@/app/dashboard-loja/components/ResgatesPorDiaChart';
import { MetricasAdicionais } from '@/app/dashboard-loja/components/MetricasAdicionais';

// ========== COMPONENTES AUXILIARES ==========

function CardsFinanceiros({ kpis }: { kpis: DadosCompletosDashboard['kpis'] }) {
  const totalBruto = kpis.financeiro?.valorTotalResgatado || 0;
  const totalVendido = kpis.financeiro?.valorTotalVendido || 0;
  const totalEconomizado = kpis.financeiro?.valorTotalEconomizado || 0;
  const ticketMedio = kpis.financeiro?.ticketMedio || 0;
  const taxaConversao = totalBruto > 0 ? (totalVendido / totalBruto) * 100 : 0;

  const cards = [
    {
      titulo: 'Valor Total Bruto',
      valor: totalBruto,
      icone: DollarSign,
      cor: 'text-orange-600',
      bg: 'bg-orange-50',
      descricao: 'Soma dos preços originais'
    },
    {
      titulo: 'Vendas Realizadas',
      valor: totalVendido,
      icone: TrendingUp,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: `${taxaConversao.toFixed(1)}% do total`
    },
    {
      titulo: 'Economia dos Clientes',
      valor: totalEconomizado,
      icone: TrendingDown,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: 'Desconto total concedido'
    },
    {
      titulo: 'Ticket Médio',
      valor: ticketMedio,
      icone: CreditCard,
      cor: 'text-purple-600',
      bg: 'bg-purple-50',
      descricao: 'Por venda realizada'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
          style={{ borderLeftColor: card.cor.replace('text-', '') }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">{card.titulo}</span>
            <div className={`p-1.5 rounded-full ${card.bg}`}>
              <card.icone className={`h-3 w-3 ${card.cor}`} />
            </div>
          </div>
          <div className={`text-lg font-bold ${card.cor}`}>
            {formatarMoeda(card.valor)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{card.descricao}</p>
        </div>
      ))}
    </div>
  );
}

function CardsResumo({ kpis }: { kpis: DadosCompletosDashboard['kpis'] }) {
  const cards = [
    {
      titulo: 'Cupons',
      valor: kpis.cupons.total,
      ativos: kpis.cupons.ativos,
      icone: Ticket,
      cor: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      titulo: 'Resgates',
      valor: kpis.resgates.total,
      mes: kpis.resgates.mes,
      icone: TrendingUp,
      cor: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      titulo: 'QR Codes',
      valor: kpis.qrCodes.total,
      validados: kpis.qrCodes.validados,
      icone: QrCode,
      cor: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      titulo: 'Clientes',
      valor: kpis.clientes.total,
      icone: Users,
      cor: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{card.titulo}</span>
              <div className={`p-1.5 rounded-full ${card.bg}`}>
                <card.icone className={`h-3 w-3 ${card.cor}`} />
              </div>
            </div>
            <div className="text-xl font-bold">{card.valor}</div>
            {card.ativos !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {card.ativos} ativos • {card.valor - card.ativos} expirados
              </p>
            )}
            {card.mes !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {card.mes} neste mês
              </p>
            )}
            {card.validados !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {card.validados} validados • {card.valor - card.validados} pendentes
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MetricasLojaPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [dados, setDados] = useState<DadosCompletosDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lojaId = params.id as string;

  useEffect(() => {
    carregarDados();
  }, [lojaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔥 USAR O MÉTODO EXISTENTE - mas precisa de adaptação no backend
      // Por enquanto, vamos usar o getDadosCompletos que busca da loja logada
      // Idealmente, teríamos um método getDadosLojaPorId(lojaId)
     const data = await dashboardLojaService.getDadosLojaPorId(lojaId);
      
      // 🔥 SIMULANDO QUE OS DADOS SÃO DA LOJA ESPECÍFICA
      // Na realidade, o backend precisa aceitar um parâmetro de lojaId
      setDados(data);
      
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      setError('Erro ao carregar métricas da loja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando métricas da loja...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !dados) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erro ao carregar métricas
            </h2>
            <p className="text-gray-500 mb-6">{error || 'Não foi possível carregar os dados'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Voltar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-6 w-6 text-orange-500" />
              {dados.kpis.loja.nome}
            </h1>
            <p className="text-sm text-gray-500">
              Métricas e estatísticas completas • ID: {lojaId.slice(0, 8)}...
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </Badge>
        </div>

        {/* Cards de resumo rápido */}
        <CardsResumo kpis={dados.kpis} />

        {/* Cards financeiros */}
        <CardsFinanceiros kpis={dados.kpis} />

        {/* Tabs com informações detalhadas */}
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="resgates">Resgates</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          </TabsList>

          {/* Aba Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <KPICards data={dados.kpis} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UltimosResgates resgates={dados.ultimosResgates} />
              <CuponsPopulares cupons={dados.cuponsPopulares} />
            </div>

            <ResgatesPorDiaChart dados={dados.resgatesPorDia} />
            <MetricasAdicionais kpis={dados.kpis} />
          </TabsContent>

          {/* Aba Resgates */}
          <TabsContent value="resgates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo de Resgates</CardTitle>
                <CardDescription>
                  Todos os resgates realizados na loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UltimosResgates resgates={dados.ultimosResgates} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cupons */}
          <TabsContent value="cupons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Cupons da Loja</CardTitle>
                <CardDescription>
                  Cupons mais populares e seu desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CuponsPopulares cupons={dados.cuponsPopulares} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba QR Codes */}
          <TabsContent value="qrcodes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de QR Codes</CardTitle>
                <CardDescription>
                  Análise de validação e uso de QR codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dados.qrCodeStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-2xl font-bold">{dados.qrCodeStats.totais.resgatados}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500">Validados</p>
                          <p className="text-2xl font-bold text-green-600">{dados.qrCodeStats.totais.validados}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500">Pendentes</p>
                          <p className="text-2xl font-bold text-yellow-600">{dados.qrCodeStats.totais.pendentes}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500">Taxa</p>
                          <p className="text-2xl font-bold text-blue-600">{dados.qrCodeStats.taxaValidacao.toFixed(1)}%</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Hoje</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Resgatados: {dados.qrCodeStats.hoje.resgatados}</p>
                          <p className="text-sm text-green-600">Validados: {dados.qrCodeStats.hoje.validados}</p>
                          <p className="text-sm text-yellow-600">Pendentes: {dados.qrCodeStats.hoje.pendentes}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Semana</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Resgatados: {dados.qrCodeStats.semana.resgatados}</p>
                          <p className="text-sm text-green-600">Validados: {dados.qrCodeStats.semana.validados}</p>
                          <p className="text-sm text-yellow-600">Pendentes: {dados.qrCodeStats.semana.pendentes}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Resgatados: {dados.qrCodeStats.mes.resgatados}</p>
                          <p className="text-sm text-green-600">Validados: {dados.qrCodeStats.mes.validados}</p>
                          <p className="text-sm text-yellow-600">Pendentes: {dados.qrCodeStats.mes.pendentes}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Dados de QR codes não disponíveis</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}