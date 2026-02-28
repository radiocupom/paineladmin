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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Loader2,
  QrCode,
  Users,
  Calendar,
  Store,
  TrendingUp,
  Award,
  Ticket,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  TrendingDown,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { toast } from 'sonner';
import cupomService, { EstatisticasCupom } from '@/services/cupom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function EstatisticasCupomPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasCupom | null>(null);
  const [activeTab, setActiveTab] = useState('resumo');

  const id = params.id as string;

  useEffect(() => {
    carregarEstatisticas();
  }, [id]);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const data = await cupomService.getEstatisticas(id);
      setEstatisticas(data);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      router.push('/dashboard/cupons');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularPorcentagem = (valor: number, total: number) => {
    if (total === 0) return '0';
    return ((valor / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando estatísticas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!estatisticas) {
    return null;
  }

  const { cupom, estatisticas: stats, resgates = [] } = estatisticas;

  // 🔥 CALCULAR MÉTRICAS FINANCEIRAS
  const valorTotalEconomizado = (stats.valorTotalResgatado || 0) - (stats.valorTotalVendido || 0);
  const percentualEconomia = stats.valorTotalResgatado 
    ? ((valorTotalEconomizado / stats.valorTotalResgatado) * 100).toFixed(1)
    : '0';

  const resgatesValidados = resgates.filter(r => r.validado).length;
  const resgatesPendentes = resgates.filter(r => !r.validado).length;
  const taxaValidacao = stats.totalResgates 
    ? ((resgatesValidados / stats.totalResgates) * 100).toFixed(1)
    : '0';

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 sm:h-9 sm:w-9 self-start"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
              Estatísticas do Cupom
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              {cupom.codigo} - {cupom.descricao}
            </p>
          </div>
        </div>

        <Tabs defaultValue="resumo" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="resumo" className="text-xs sm:text-sm">Resumo</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
            <TabsTrigger value="detalhado" className="text-xs sm:text-sm">Detalhado</TabsTrigger>
          </TabsList>

          {/* TAB 1: RESUMO GERAL */}
          <TabsContent value="resumo" className="space-y-4">
            {/* Cards de métricas gerais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Total QR Codes
                    </CardTitle>
                    <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.totalQrCodes.toLocaleString()}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Disponíveis: {stats.qrCodesDisponiveis.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      QR Codes Usados
                    </CardTitle>
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.qrCodesUsados.toLocaleString()}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {calcularPorcentagem(stats.qrCodesUsados, stats.totalQrCodes)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Total Resgates
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.totalResgates.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px]">
                      <CheckCircle className="h-2 w-2 mr-1" />
                      {resgatesValidados} validados
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[10px]">
                      <Clock className="h-2 w-2 mr-1" />
                      {resgatesPendentes} pendentes
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Clientes Atendidos
                    </CardTitle>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {stats.clientesAtendidos.toLocaleString()}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Média: {(stats.totalResgates / stats.clientesAtendidos).toFixed(1)}/cliente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informações do Cupom */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Informações do Cupom</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Dados cadastrais do cupom
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Código</p>
                    <p className="text-xs sm:text-sm font-medium break-all">{cupom.codigo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Descrição</p>
                    <p className="text-xs sm:text-sm font-medium break-all">{cupom.descricao}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Loja</p>
                    <p className="text-xs sm:text-sm font-medium break-all">{cupom.loja}</p>
                  </div>
                  {cupom.nomeProduto && (
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-gray-500">Produto</p>
                      <p className="text-xs sm:text-sm font-medium break-all">{cupom.nomeProduto}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: FINANCEIRO */}
          <TabsContent value="financeiro" className="space-y-4">
            {/* Cards financeiros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border-l-4 border-l-blue-600">
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
                    {formatarMoeda(stats.valorTotalResgatado)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Soma dos preços originais
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Valor Realizado (Vendas)
                    </CardTitle>
                    <TrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {formatarMoeda(stats.valorTotalVendido)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {resgatesValidados} cupons validados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600">
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
                    {formatarMoeda(valorTotalEconomizado)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {percentualEconomia}% de desconto médio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Ticket Médio
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {formatarMoeda(stats.mediaTicket)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Por venda realizada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Taxa de Conversão
                    </CardTitle>
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {taxaValidacao}%
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {resgatesValidados} de {stats.totalResgates} resgates validados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                      Resgates Pendentes
                    </CardTitle>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                    {resgatesPendentes}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Aguardando validação
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de resumo financeiro (simplificado) */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Resumo Financeiro</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Comparativo entre valores brutos e realizados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Valor Bruto (potencial)</span>
                    <span className="font-medium text-blue-600">{formatarMoeda(stats.valorTotalResgatado)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Valor Realizado (vendas)</span>
                    <span className="font-medium text-green-600">{formatarMoeda(stats.valorTotalVendido)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Economia dos Clientes</span>
                    <span className="font-medium text-yellow-600">{formatarMoeda(valorTotalEconomizado)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600"
                      style={{ 
                        width: `${stats.valorTotalResgatado ? (stats.valorTotalVendido / stats.valorTotalResgatado) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: DETALHADO (LISTA DE RESGATES) */}
          <TabsContent value="detalhado">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Histórico de Resgates</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Lista detalhada de todos os resgates do cupom
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Cliente</TableHead>
                        <TableHead className="text-xs">Data Resgate</TableHead>
                        <TableHead className="text-xs">Data Validação</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Valor Original</TableHead>
                        <TableHead className="text-xs">Valor Pago</TableHead>
                        <TableHead className="text-xs">Economia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resgates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Ticket className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        resgates.map((resgate) => {
                          const economia = (resgate.valorOriginal || 0) - (resgate.valorPago || 0);
                          return (
                            <TableRow key={resgate.id}>
                              <TableCell className="text-xs sm:text-sm">
                                {resgate.cliente}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                                {new Date(resgate.resgatadoEm).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                                {resgate.validadoEm 
                                  ? new Date(resgate.validadoEm).toLocaleDateString()
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>
                                {resgate.validado ? (
                                  <Badge className="bg-green-100 text-green-700 text-[10px]">
                                    <CheckCircle className="h-2 w-2 mr-1" />
                                    Validado
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[10px]">
                                    <Clock className="h-2 w-2 mr-1" />
                                    Pendente
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {resgate.valorOriginal 
                                  ? formatarMoeda(resgate.valorOriginal)
                                  : '-'
                                }
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm font-medium text-green-600">
                                {resgate.valorPago 
                                  ? formatarMoeda(resgate.valorPago)
                                  : '-'
                                }
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm text-yellow-600">
                                {economia > 0 ? formatarMoeda(economia) : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}