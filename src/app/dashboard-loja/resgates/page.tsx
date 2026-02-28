'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; 
import { CheckCircle2, Clock } from 'lucide-react';
import { Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardLojaService } from '@/services/dashboardLoja';
import { toast } from 'sonner';

// Componentes
import { CardFinanceiro } from './components/CardFinanceiro';
import { CardEstatistica } from './components/CardEstatistica';
import { FiltrosResgates } from './components/FiltrosResgates';
import { GraficoResgates } from './components/GraficoResgates';
import { GraficoTopCupons } from './components/GraficoTopCupons';
import { TabelaResgatesDesktop } from './components/TabelaResgatesDesktop';
import { CardsResgatesMobile } from './components/CardsResgatesMobile';
import { ModalDetalhesResgate } from './components/ModalDetalhesResgate';
import { ExportarDados } from './components/ExportarDados';

// Types
import { ResgateAdaptado, Estatisticas } from './types/resgates.types';

export default function ResgatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resgates, setResgates] = useState<ResgateAdaptado[]>([]);
  const [resgatesFiltrados, setResgatesFiltrados] = useState<ResgateAdaptado[]>([]);
  const [cuponsPopulares, setCuponsPopulares] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalResgates: 0,
    resgatesHoje: 0,
    resgatesSemana: 0,
    resgatesMes: 0,
    clientesUnicos: 0,
    mediaPorDia: 0,
    taxaValidacao: 0,
    valorTotalBruto: 0,
    valorTotalVendido: 0,
    valorTotalEconomizado: 0,
    ticketMedio: 0,
    percentualDoTotal: "0"
  });

  // Estados para filtros
  const [search, setSearch] = useState('');
  const [cupomFiltro, setCupomFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('7dias');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [resgateSelecionado, setResgateSelecionado] = useState<ResgateAdaptado | null>(null);

  // Dados para gráficos
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);
  const [dadosTopCupons, setDadosTopCupons] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [resgates, search, cupomFiltro, statusFiltro, periodoFiltro]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [kpisData, resgatesData, cuponsData] = await Promise.all([
        dashboardLojaService.getKPIs(),
        dashboardLojaService.getUltimosResgates(50),
        dashboardLojaService.getCuponsPopulares(5)
      ]);
      
      // Adaptar resgates
      const resgatesAdaptados = adaptarResgates(resgatesData || []);
      setResgates(resgatesAdaptados);
      setCuponsPopulares(cuponsData || []);

      // Calcular estatísticas
      calcularEstatisticas(kpisData, resgatesAdaptados);
      
      // Preparar dados para gráficos
      prepararDadosGraficos(resgatesAdaptados, cuponsData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar resgates');
    } finally {
      setLoading(false);
    }
  };

  const adaptarResgates = (dados: any[]): ResgateAdaptado[] => {
    return dados.map(item => ({
      id: item.id || '',
      quantidade: item.quantidade || 1,
      resgatadoEm: item.resgatadoEm || new Date().toISOString(),
      qrCodeValidado: item.qrCodeValidado === true || item.validado === true || item.status === 'VALIDADO',
      status: item.status,
      cliente: {
        id: item.cliente?.id || item.clienteId || '',
        nome: item.cliente?.nome || 'Cliente',
        email: item.cliente?.email || '',
        whatsapp: item.cliente?.whatsapp
      },
      cupom: {
        id: item.cupom?.id || item.cupomId || '',
        descricao: item.cupom?.descricao || '',
        codigo: item.cupom?.codigo || '',
        precoOriginal: item.cupom?.precoOriginal,
        precoComDesconto: item.cupom?.precoComDesconto,
        percentualDesconto: item.cupom?.percentualDesconto,
        nomeProduto: item.cupom?.nomeProduto
      },
      valorOriginal: item.cupom?.precoOriginal,
      valorPago: item.cupom?.precoComDesconto,
      economia: item.cupom?.precoOriginal && item.cupom?.precoComDesconto 
        ? item.cupom.precoOriginal - item.cupom.precoComDesconto 
        : undefined
    }));
  };

  const calcularEstatisticas = (kpisData: any, resgatesData: ResgateAdaptado[]) => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - 7);
    const inicioMes = new Date(hoje); inicioMes.setDate(hoje.getDate() - 30);

    const resgatesHoje = resgatesData.filter(r => new Date(r.resgatadoEm) >= hoje).length;
    const resgatesSemana = resgatesData.filter(r => new Date(r.resgatadoEm) >= inicioSemana).length;
    const resgatesMes = resgatesData.filter(r => new Date(r.resgatadoEm) >= inicioMes).length;
    const clientesUnicos = new Set(resgatesData.map(r => r.cliente.id)).size;
    const validados = resgatesData.filter(r => r.qrCodeValidado).length;
    const taxaValidacao = resgatesData.length > 0 ? (validados / resgatesData.length) * 100 : 0;

    setEstatisticas({
      totalResgates: kpisData?.resgates?.total || resgatesData.length,
      resgatesHoje: kpisData?.resgates?.hoje || resgatesHoje,
      resgatesSemana: kpisData?.resgates?.semana || resgatesSemana,
      resgatesMes: kpisData?.resgates?.mes || resgatesMes,
      clientesUnicos: kpisData?.clientes?.total || clientesUnicos,
      mediaPorDia: Number((resgatesMes / 30).toFixed(1)) || 0,
      taxaValidacao: Number(taxaValidacao.toFixed(1)),
      valorTotalBruto: kpisData?.financeiro?.valorTotalResgatado || 0,
      valorTotalVendido: kpisData?.financeiro?.valorTotalVendido || 0,
      valorTotalEconomizado: kpisData?.financeiro?.valorTotalEconomizado || 0,
      ticketMedio: kpisData?.financeiro?.ticketMedio || 0,
      percentualDoTotal: kpisData?.financeiro?.valorTotalResgatado > 0 
        ? ((kpisData.financeiro.valorTotalVendido / kpisData.financeiro.valorTotalResgatado) * 100).toFixed(1)
        : '0'
    });
  };

  const prepararDadosGraficos = (resgatesData: ResgateAdaptado[], cuponsData: any[]) => {
    // Gráfico de linhas - últimos 7 dias
    const ultimos7Dias = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      data.setHours(0, 0, 0, 0);
      const dataFim = new Date(data); dataFim.setHours(23, 59, 59, 999);
      
      const resgatesDia = resgatesData.filter(r => {
        const dataResgate = new Date(r.resgatadoEm);
        return dataResgate >= data && dataResgate <= dataFim;
      }).length;

      const validadosDia = resgatesData.filter(r => {
        const dataResgate = new Date(r.resgatadoEm);
        return dataResgate >= data && dataResgate <= dataFim && r.qrCodeValidado;
      }).length;

      ultimos7Dias.push({
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        resgates: resgatesDia,
        validados: validadosDia
      });
    }
    setDadosGrafico(ultimos7Dias);

    // Gráfico de barras - top cupons
    const topCupons = (cuponsData || []).map(cupom => ({
      nome: cupom.codigo || 'N/A',
      total: cupom.totalResgates || 0,
      validados: cupom.totalResgates || 0
    }));
    setDadosTopCupons(topCupons);
  };

  const aplicarFiltros = () => {
    let filtrados = [...resgates];

    if (search) {
      filtrados = filtrados.filter(r => 
        r.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
        r.cliente.email.toLowerCase().includes(search.toLowerCase()) ||
        r.cupom.codigo.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cupomFiltro !== 'todos') {
      filtrados = filtrados.filter(r => r.cupom.id === cupomFiltro);
    }

    if (statusFiltro !== 'todos') {
      filtrados = filtrados.filter(r => 
        statusFiltro === 'validado' ? r.qrCodeValidado : !r.qrCodeValidado
      );
    }

    if (periodoFiltro !== 'todos') {
      const hoje = new Date();
      const limite = new Date();

      switch (periodoFiltro) {
        case 'hoje':
          limite.setHours(0, 0, 0, 0);
          filtrados = filtrados.filter(r => new Date(r.resgatadoEm) >= limite);
          break;
        case '7dias':
          limite.setDate(hoje.getDate() - 7);
          filtrados = filtrados.filter(r => new Date(r.resgatadoEm) >= limite);
          break;
        case '30dias':
          limite.setDate(hoje.getDate() - 30);
          filtrados = filtrados.filter(r => new Date(r.resgatadoEm) >= limite);
          break;
      }
    }

    setResgatesFiltrados(filtrados);
  };

  // Utilitários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (validado?: boolean) => {
    if (validado) {
      return (
        <Badge className="bg-green-100 text-green-700 flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5">
          <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          Validado
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        Pendente
      </Badge>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Resgates
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Acompanhe todos os resgates realizados na sua loja
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={carregarDados}
              className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
            >
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Recarregar
            </Button>
            <ExportarDados 
              resgates={resgatesFiltrados}
              formatarMoeda={formatarMoeda}
              formatarData={formatarData}
              disabled={resgatesFiltrados.length === 0}
            />
          </div>
        </div>

        {/* Cards Financeiros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CardFinanceiro
            titulo="Valor Total Bruto"
            valor={estatisticas.valorTotalBruto}
            icone={DollarSign}
            cor="text-orange-600"
            bg="bg-orange-50"
            descricao="Soma dos preços originais"
          />
          <CardFinanceiro
            titulo="Vendas Realizadas"
            valor={estatisticas.valorTotalVendido}
            icone={TrendingUp}
            cor="text-green-600"
            bg="bg-green-50"
            descricao={`${estatisticas.percentualDoTotal}% do total`}
          />
          <CardFinanceiro
            titulo="Economia dos Clientes"
            valor={estatisticas.valorTotalEconomizado}
            icone={TrendingDown}
            cor="text-blue-600"
            bg="bg-blue-50"
            descricao="Desconto total concedido"
          />
          <CardFinanceiro
            titulo="Ticket Médio"
            valor={estatisticas.ticketMedio}
            icone={CreditCard}
            cor="text-purple-600"
            bg="bg-purple-50"
            descricao="Por venda realizada"
          />
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CardEstatistica
            titulo="Total de Resgates"
            valor={estatisticas.totalResgates}
            descricao={`${estatisticas.resgatesHoje} hoje`}
          />
          <CardEstatistica
            titulo="Clientes Únicos"
            valor={estatisticas.clientesUnicos}
            descricao="clientes diferentes"
          />
          <CardEstatistica
            titulo="Média/Dia"
            valor={estatisticas.mediaPorDia}
            descricao="últimos 30 dias"
          />
          <CardEstatistica
            titulo="Taxa Validação"
            valor={`${estatisticas.taxaValidacao}%`}
            descricao=""
            cor="text-green-600"
            progresso={estatisticas.taxaValidacao}
          />
        </div>

        {/* Filtros */}
        <FiltrosResgates
          search={search}
          onSearchChange={setSearch}
          cupomFiltro={cupomFiltro}
          onCupomChange={setCupomFiltro}
          statusFiltro={statusFiltro}
          onStatusChange={setStatusFiltro}
          periodoFiltro={periodoFiltro}
          onPeriodoChange={setPeriodoFiltro}
          cuponsPopulares={cuponsPopulares}
          mobileFiltersOpen={mobileFiltersOpen}
          onToggleMobileFilters={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        />

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <GraficoResgates dados={dadosGrafico} />
          <GraficoTopCupons dados={dadosTopCupons} />
        </div>

        {/* Lista de Resgates - Desktop */}
        <TabelaResgatesDesktop
          resgates={resgatesFiltrados}
          loading={loading}
          onVerDetalhes={setResgateSelecionado}
          formatarMoeda={formatarMoeda}
          getStatusBadge={getStatusBadge}
        />

        {/* Cards para Mobile */}
        <CardsResgatesMobile
          resgates={resgatesFiltrados}
          loading={loading}
          onVerDetalhes={setResgateSelecionado}
          formatarMoeda={formatarMoeda}
          getStatusBadge={getStatusBadge}
        />

        {/* Modal de Detalhes */}
        <ModalDetalhesResgate
          resgate={resgateSelecionado}
          open={!!resgateSelecionado}
          onOpenChange={(open) => !open && setResgateSelecionado(null)}
          formatarData={formatarData}
          formatarMoeda={formatarMoeda}
          getStatusBadge={getStatusBadge}
        />
      </div>
    </ProtectedRoute>
  );
}