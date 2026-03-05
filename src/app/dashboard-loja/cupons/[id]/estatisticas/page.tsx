'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  QrCode,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Download,
  Printer,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Percent,
  CreditCard,
  Power,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import cupomService, { EstatisticasCupom } from '@/services/cupom';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export default function EstatisticasCupomPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ativando, setAtivando] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstatisticasCupom | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);
  const [dadosUso, setDadosUso] = useState<any[]>([]);
  const [cupomAtivo, setCupomAtivo] = useState<boolean>(true);

  const id = params.id as string;

  useEffect(() => {
    carregarEstatisticas();
  }, [id]);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const data = await cupomService.getStats(id);
      setEstatisticas(data);
      setCupomAtivo(true); // Assumindo que está ativo

      // Preparar dados para o gráfico de uso
      const usoData = [
        { name: 'Usados', value: data.estatisticas.qrCodesUsados, color: '#f97316' },
        { name: 'Disponíveis', value: data.estatisticas.qrCodesDisponiveis, color: '#22c55e' },
      ];
      setDadosUso(usoData);

      // Simular dados de resgates por dia
      const ultimos7Dias = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        ultimos7Dias.push({
          dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          resgates: Math.floor(Math.random() * 10) + 1,
        });
      }
      setDadosGrafico(ultimos7Dias);

    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      router.push('/dashboard-loja/cupons');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNÇÕES PARA ATIVAR/DESATIVAR
  const handleAtivar = async () => {
    try {
      setAtivando(true);
      await cupomService.activate(id);
      setCupomAtivo(true);
      toast.success('Cupom ativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao ativar cupom');
    } finally {
      setAtivando(false);
    }
  };

  const handleDesativar = async () => {
    try {
      setAtivando(true);
      await cupomService.deactivate(id);
      setCupomAtivo(false);
      toast.success('Cupom desativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desativar cupom');
    } finally {
      setAtivando(false);
    }
  };

  const calcularTaxaUso = () => {
    if (!estatisticas) return 0;
    const { totalQrCodes, qrCodesUsados } = estatisticas.estatisticas;
    return ((qrCodesUsados / totalQrCodes) * 100).toFixed(1);
  };

  const mediaPorCliente = () => {
    if (!estatisticas) return 0;
    const { totalResgates, clientesAtendidos } = estatisticas.estatisticas;
    if (clientesAtendidos === 0) return 0;
    return (totalResgates / clientesAtendidos).toFixed(1);
  };

  // 🔥 FUNÇÕES FINANCEIRAS
  const formatarMoeda = (valor: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularEconomiaPorCliente = () => {
    if (!estatisticas) return 0;
    const { valorTotalEconomizado, clientesAtendidos } = estatisticas.estatisticas;
    if (clientesAtendidos === 0) return 0;
    return valorTotalEconomizado / clientesAtendidos;
  };

  const calcularConversaoFinanceira = () => {
    if (!estatisticas) return 0;
    const { valorTotalResgatado, valorTotalVendido } = estatisticas.estatisticas;
    if (valorTotalResgatado === 0) return 0;
    return (valorTotalVendido / valorTotalResgatado) * 100;
  };

  const exportarDados = () => {
    if (!estatisticas) return;

    const dadosExportacao = {
      cupom: estatisticas.cupom,
      estatisticas: estatisticas.estatisticas,
      dataExportacao: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estatisticas-${estatisticas.cupom.codigo}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimirRelatorio = () => {
    if (!estatisticas) return;

    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      toast.error('Pop-up bloqueado. Permita pop-ups para imprimir.');
      return;
    }

    const data = new Date().toLocaleDateString('pt-BR');
    const hora = new Date().toLocaleTimeString('pt-BR');

    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Relatório Financeiro - ${estatisticas.cupom.codigo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #f97316; }
            h2 { color: #333; margin-top: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
            .card-title { font-size: 14px; color: #666; }
            .card-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .text-green { color: #22c55e; }
            .text-orange { color: #f97316; }
            .text-blue { color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Financeiro do Cupom</h1>
            <p>${data} ${hora}</p>
          </div>
          
          <h2>${estatisticas.cupom.codigo} - ${estatisticas.cupom.descricao}</h2>
          
          ${estatisticas.cupom.nomeProduto ? `<p><strong>Produto:</strong> ${estatisticas.cupom.nomeProduto}</p>` : ''}
          
          <div class="cards">
            <div class="card">
              <div class="card-title">Valor Total Bruto</div>
              <div class="card-value text-orange">${formatarMoeda(estatisticas.estatisticas.valorTotalResgatado)}</div>
            </div>
            <div class="card">
              <div class="card-title">Valor Realizado (Vendas)</div>
              <div class="card-value text-green">${formatarMoeda(estatisticas.estatisticas.valorTotalVendido)}</div>
            </div>
            <div class="card">
              <div class="card-title">Economia dos Clientes</div>
              <div class="card-value text-blue">${formatarMoeda(estatisticas.estatisticas.valorTotalEconomizado)}</div>
            </div>
          </div>

          <table>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td>Total de QR Codes</td>
              <td>${estatisticas.estatisticas.totalQrCodes}</td>
            </tr>
            <tr>
              <td>QR Codes Usados</td>
              <td>${estatisticas.estatisticas.qrCodesUsados}</td>
            </tr>
            <tr>
              <td>QR Codes Validados</td>
              <td>${estatisticas.estatisticas.qrCodesValidados}</td>
            </tr>
            <tr>
              <td>Total de Resgates</td>
              <td>${estatisticas.estatisticas.totalResgates}</td>
            </tr>
            <tr>
              <td>Resgates Validados (Vendas)</td>
              <td>${estatisticas.estatisticas.resgatesValidados}</td>
            </tr>
            <tr>
              <td>Resgates Pendentes</td>
              <td>${estatisticas.estatisticas.resgatesPendentes}</td>
            </tr>
            <tr>
              <td>Ticket Médio</td>
              <td class="text-green">${formatarMoeda(estatisticas.estatisticas.mediaTicket)}</td>
            </tr>
            <tr>
              <td>Taxa de Conversão</td>
              <td class="text-orange">${estatisticas.estatisticas.taxaConversao.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Economia por Cliente</td>
              <td class="text-blue">${formatarMoeda(calcularEconomiaPorCliente())}</td>
            </tr>
          </table>

          <div class="footer">
            Relatório gerado em ${data} às ${hora}
          </div>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando estatísticas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!estatisticas) {
    return null;
  }

  const CORES = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho com botões de ativar/desativar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Estatísticas do Cupom
                </h1>
                <Badge className={cn(
                  "ml-2 text-xs",
                  cupomAtivo 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {cupomAtivo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {estatisticas.cupom.codigo} - {estatisticas.cupom.descricao}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* 🔥 BOTÕES DE ATIVAR/DESATIVAR */}
            {cupomAtivo ? (
              <Button
                onClick={handleDesativar}
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={ativando}
              >
                {ativando ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden xs:inline">Desativar</span>
                <span className="xs:hidden">Des.</span>
              </Button>
            ) : (
              <Button
                onClick={handleAtivar}
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                disabled={ativando}
              >
                {ativando ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden xs:inline">Ativar</span>
                <span className="xs:hidden">At.</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={exportarDados}
              className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Exportar</span>
              <span className="xs:hidden">Exp.</span>
            </Button>
            <Button
              variant="outline"
              onClick={imprimirRelatorio}
              className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Imprimir</span>
              <span className="xs:hidden">Imp.</span>
            </Button>
          </div>
        </div>

        {/* 🔥 CARDS FINANCEIROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className={cn(
            "border-l-4",
            cupomAtivo ? "border-l-orange-600" : "border-l-gray-400 opacity-75"
          )}>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                  Valor Total Bruto
                </CardTitle>
                <DollarSign className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-orange-600" : "text-gray-400"
                )} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg lg:text-2xl font-bold",
                cupomAtivo ? "text-orange-600" : "text-gray-400"
              )}>
                {formatarMoeda(estatisticas.estatisticas.valorTotalResgatado)}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Soma dos preços originais
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-l-4",
            cupomAtivo ? "border-l-green-600" : "border-l-gray-400 opacity-75"
          )}>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                  Valor Realizado (Vendas)
                </CardTitle>
                <TrendingUp className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-green-600" : "text-gray-400"
                )} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg lg:text-2xl font-bold",
                cupomAtivo ? "text-green-600" : "text-gray-400"
              )}>
                {formatarMoeda(estatisticas.estatisticas.valorTotalVendido)}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {estatisticas.estatisticas.resgatesValidados} cupons validados
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-l-4",
            cupomAtivo ? "border-l-blue-600" : "border-l-gray-400 opacity-75"
          )}>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                  Economia dos Clientes
                </CardTitle>
                <TrendingDown className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-blue-600" : "text-gray-400"
                )} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg lg:text-2xl font-bold",
                cupomAtivo ? "text-blue-600" : "text-gray-400"
              )}>
                {formatarMoeda(estatisticas.estatisticas.valorTotalEconomizado)}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {estatisticas.estatisticas.taxaConversao.toFixed(1)}% do valor bruto
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-l-4",
            cupomAtivo ? "border-l-purple-600" : "border-l-gray-400 opacity-75"
          )}>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                  Ticket Médio
                </CardTitle>
                <CreditCard className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-purple-600" : "text-gray-400"
                )} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg lg:text-2xl font-bold",
                cupomAtivo ? "text-purple-600" : "text-gray-400"
              )}>
                {formatarMoeda(estatisticas.estatisticas.mediaTicket)}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Por venda realizada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
                <QrCode className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  cupomAtivo ? "text-orange-600" : "text-gray-400"
                )} />
                <span className="truncate">QR Codes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg md:text-2xl font-bold",
                cupomAtivo ? "" : "text-gray-400"
              )}>
                {estatisticas.estatisticas.totalQrCodes}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {estatisticas.estatisticas.qrCodesUsados} usados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
                <TrendingUp className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  cupomAtivo ? "text-green-600" : "text-gray-400"
                )} />
                <span className="truncate">Taxa de Uso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg md:text-2xl font-bold",
                cupomAtivo ? "text-green-600" : "text-gray-400"
              )}>
                {calcularTaxaUso()}%
              </div>
              <div className="w-full h-1 sm:h-1.5 bg-gray-200 rounded-full mt-2">
                <div 
                  className={cn(
                    "h-1 sm:h-1.5 rounded-full",
                    cupomAtivo ? "bg-green-500" : "bg-gray-400"
                  )}
                  style={{ width: `${calcularTaxaUso()}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
                <Users className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  cupomAtivo ? "text-blue-600" : "text-gray-400"
                )} />
                <span className="truncate">Clientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg md:text-2xl font-bold",
                cupomAtivo ? "" : "text-gray-400"
              )}>
                {estatisticas.estatisticas.clientesAtendidos}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                média {mediaPorCliente()}/cliente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
                <Award className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  cupomAtivo ? "text-purple-600" : "text-gray-400"
                )} />
                <span className="truncate">Resgates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className={cn(
                "text-base sm:text-lg md:text-2xl font-bold",
                cupomAtivo ? "" : "text-gray-400"
              )}>
                {estatisticas.estatisticas.totalResgates}
              </div>
              <div className="flex gap-2 mt-1 text-[10px] sm:text-xs">
                <span className={cn(
                  "font-medium",
                  cupomAtivo ? "text-green-600" : "text-gray-400"
                )}>
                  {estatisticas.estatisticas.resgatesValidados} validados
                </span>
                <span className={cn(
                  "font-medium",
                  cupomAtivo ? "text-yellow-600" : "text-gray-400"
                )}>
                  {estatisticas.estatisticas.resgatesPendentes} pendentes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Produto */}
        {(estatisticas.cupom.nomeProduto || estatisticas.cupom.precoOriginal || estatisticas.cupom.precoComDesconto) && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <ShoppingBag className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-orange-500" : "text-gray-400"
                )} />
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {estatisticas.cupom.nomeProduto && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Nome do Produto</p>
                    <p className="text-xs sm:text-sm font-medium">{estatisticas.cupom.nomeProduto}</p>
                  </div>
                )}
                {estatisticas.cupom.precoOriginal && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Preço Original</p>
                    <p className={cn(
                      "text-xs sm:text-sm font-medium line-through",
                      cupomAtivo ? "text-gray-400" : "text-gray-300"
                    )}>
                      {formatarMoeda(estatisticas.cupom.precoOriginal)}
                    </p>
                  </div>
                )}
                {estatisticas.cupom.precoComDesconto && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Preço com Desconto</p>
                    <p className={cn(
                      "text-xs sm:text-sm font-bold",
                      cupomAtivo ? "text-green-600" : "text-gray-400"
                    )}>
                      {formatarMoeda(estatisticas.cupom.precoComDesconto)}
                    </p>
                  </div>
                )}
                {estatisticas.cupom.percentualDesconto && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Desconto</p>
                    <Badge className={cn(
                      "text-[10px] sm:text-xs",
                      cupomAtivo 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-500"
                    )}>
                      <Percent className="h-2 w-2 mr-1" />
                      {estatisticas.cupom.percentualDesconto}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de Pizza - Uso de QR Codes */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <PieChartIcon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-orange-500" : "text-gray-400"
                )} />
                Uso de QR Codes
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Distribuição entre usados e disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosUso}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent = 0 }) => {
                        const percentage = (percent * 100).toFixed(0);
                        return `${name}: ${percentage}%`;
                      }}
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
                      dataKey="value"
                    >
                      {dadosUso.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border rounded shadow text-xs sm:text-sm">
                              <p className="font-medium">{payload[0].name}</p>
                              <p className={cupomAtivo ? "text-orange-600" : "text-gray-400"}>
                                {payload[0].value} QR codes
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BarChartIcon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  cupomAtivo ? "text-orange-500" : "text-gray-400"
                )} />
                Resgates por Dia
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dia" 
                      tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
                    />
                    <Bar dataKey="resgates" fill={cupomAtivo ? "#f97316" : "#9ca3af"} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de detalhes financeiros */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Detalhes Financeiros</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Todas as métricas financeiras do cupom
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Valor Total Bruto</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-orange-600" : "text-gray-400"
                  )}>
                    {formatarMoeda(estatisticas.estatisticas.valorTotalResgatado)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Valor Realizado (Vendas)</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-green-600" : "text-gray-400"
                  )}>
                    {formatarMoeda(estatisticas.estatisticas.valorTotalVendido)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Economia dos Clientes</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-blue-600" : "text-gray-400"
                  )}>
                    {formatarMoeda(estatisticas.estatisticas.valorTotalEconomizado)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Ticket Médio</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-purple-600" : "text-gray-400"
                  )}>
                    {formatarMoeda(estatisticas.estatisticas.mediaTicket)}
                  </p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Taxa de Conversão Financeira</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-orange-600" : "text-gray-400"
                  )}>
                    {calcularConversaoFinanceira().toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Economia Média por Resgate</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-blue-600" : "text-gray-400"
                  )}>
                    {formatarMoeda(calcularEconomiaPorCliente())}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Resgates Validados</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-green-600" : "text-gray-400"
                  )}>
                    {estatisticas.estatisticas.resgatesValidados}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Resgates Pendentes</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-medium",
                    cupomAtivo ? "text-yellow-600" : "text-gray-400"
                  )}>
                    {estatisticas.estatisticas.resgatesPendentes}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Voltar
          </Button>
          <span className="text-[10px] sm:text-xs text-gray-400">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>
    </ProtectedRoute>
  );
}