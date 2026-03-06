// app/dashboard-loja/clientes/page.jsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search,
  User,
  Phone,
  MapPin,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  TrendingUp,
  Users,
  Ticket,
  QrCode,
  Percent,
  Wallet,
  CheckCircle, // ← NOVO ÍCONE
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import clienteService, { ClienteDaLoja, Resgate, EstatisticasPorLoja } from '@/services/cliente';
import authService from '@/services/auth';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  lojaId?: string;
  loja?: {
    id: string;
    nome: string;
    logo?: string;
  };
}

interface ClienteLoja {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  dataNascimento?: string;
  primeiroResgate: string | null;
  ultimoResgate: string | null;
  totalResgates: number;
  totalCupons: number;
  totalQrCodes: number;
  qrCodesValidados: number;
  totalGasto: number;
}

export default function ClientesLojaPage() {
  const { user } = useAuth() as { user: Usuario | null };
  const [loading, setLoading] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [clientes, setClientes] = useState<ClienteLoja[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasPorLoja | null>(null);
  const [search, setSearch] = useState('');
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  // 🔥 Calcular totais baseados nos clientes
  const gastoTotal = clientes.reduce((acc, c) => acc + c.totalGasto, 0);
  const totalQrCodes = clientes.reduce((acc, c) => acc + c.totalQrCodes, 0);
  const totalQrCodesValidados = clientes.reduce((acc, c) => acc + c.qrCodesValidados, 0);

  const carregarDados = async (page = 1) => {
    try {
      setLoading(true);
      
      const currentUser = authService.getCurrentUser() as Usuario | null;
      const lojaId = currentUser?.loja?.id || currentUser?.lojaId;

      if (!lojaId) {
        toast.error('ID da loja não encontrado');
        return;
      }

      console.log('🏪 Buscando dados da loja:', lojaId);
      
      // 🔥 CARREGAR ESTATÍSTICAS E CLIENTES EM PARALELO
      const [estatsResponse, clientesResponse] = await Promise.all([
        clienteService.getEstatisticasDaLoja(lojaId),
        clienteService.listarClientesDaLoja(
          lojaId, 
          page, 
          10,
          { search: search || undefined },
          'ultimoResgate',
          'desc'
        )
      ]);

      console.log('📊 Estatísticas da loja:', estatsResponse);
      console.log('📦 Clientes:', clientesResponse);

      setEstatisticas(estatsResponse);

      // Adaptar os dados dos clientes
      // Adaptar os dados dos clientes
const clientesAdaptados: ClienteLoja[] = clientesResponse.clientes.map((cliente: ClienteDaLoja) => {
  const resgates = cliente.resgates || [];
  
  let primeiroResgate = null;
  let ultimoResgate = null;
  
  if (resgates.length > 0) {
    const datas = resgates.map((r: Resgate) => new Date(r.resgatadoEm).getTime());
    primeiroResgate = new Date(Math.min(...datas)).toISOString();
    ultimoResgate = new Date(Math.max(...datas)).toISOString();
  }

  // 🔥 CORREÇÃO: Usar _count.resgates para o total real
  const totalResgates = cliente._count?.resgates || resgates.length; // Prioriza o _count
  
  // 🔥 CORREÇÃO: Calcular cupons distintos baseado nos resgates disponíveis
  const totalCupons = new Set(resgates.map((r: Resgate) => r.cupom.id)).size;

  return {
    id: cliente.id,
    nome: cliente.nome,
    email: cliente.email,
    whatsapp: cliente.whatsapp,
    cidade: cliente.cidade,
    estado: cliente.estado,
    genero: cliente.genero,
    dataNascimento: cliente.dataNascimento,
    primeiroResgate,
    ultimoResgate,
    totalResgates, // ← Agora será 5
    totalCupons,   // ← Agora será 1
    totalQrCodes: cliente._count?.qrCodesUsados || 0,
    qrCodesValidados: cliente.estatisticas?.qrCodesValidados || 0,
    totalGasto: cliente.estatisticas?.totalGasto || 0
  };
});
      setClientes(clientesAdaptados);
      setPaginacao(clientesResponse.pagination);

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
      setLoadingKpis(false);
    }
  };

  useEffect(() => {
    carregarDados(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarDados(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginacao.totalPages) {
      carregarDados(newPage);
    }
  };

  const formatarData = (data: string | null): string => {
    if (!data) return 'Nunca';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.whatsapp.includes(search)
  );

  // Componente de loading para KPIs
  const KpiSkeleton = () => (
    <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
  );

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-6 p-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes da Loja</h1>
          <p className="text-gray-500 mt-1">
            Visão completa dos clientes que resgataram cupons na sua loja
          </p>
        </div>

        {/* 🔥 KPIs - 9 cards em grid 4x2 + 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total de Clientes */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold">{estatisticas?.clientes.total || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    clientes únicos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Clientes Ativos */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {estatisticas?.clientes.unicos || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    com pelo menos 1 resgate
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Total de Resgates */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Resgates
              </CardTitle>
              <Ticket className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold">{estatisticas?.resgates.total || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    em todos os cupons
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Resgates no Mês */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Resgates no Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {estatisticas?.resgates.mes || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    nos últimos 30 dias
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 5: Média por Cliente */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Média por Cliente
              </CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {estatisticas?.resgates.mediaPorCliente.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    resgates/cliente
                  </p>
                </>
              )}
            </CardContent>
          </Card>

      
      

          {/* Card 7: 🔥 QR Codes Validados (NOVO) */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                QR Codes Validados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {totalQrCodesValidados}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalQrCodesValidados / totalQrCodes) * 100).toFixed(1)}% do total
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 8: Taxa de Validação */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Taxa de Validação
              </CardTitle>
              <Percent className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {estatisticas?.qrCodes.taxaValidacao}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {estatisticas?.qrCodes.validados} de {estatisticas?.qrCodes.total} validados
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 9: Gasto Total */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                Gasto Total
              </CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <KpiSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatarMoeda(gastoTotal)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    baseado em QR codes validados
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>
              Encontre clientes por nome, email ou WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite para buscar..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {paginacao.total} clientes encontrados • Página {paginacao.page} de {paginacao.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Resgates</TableHead>
                  <TableHead>QR Codes</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Último Resgate</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                        <p className="text-sm text-gray-500">Carregando clientes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <User className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
                          <p className="text-sm text-gray-400">
                            {search ? 'Tente outros termos de busca' : 'Ainda não há clientes'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-orange-100">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                              {cliente.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{cliente.nome}</p>
                            <p className="text-xs text-gray-500">{cliente.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{cliente.whatsapp}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{cliente.cidade || '-'}/{cliente.estado || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {cliente.totalResgates} resgates • {cliente.totalCupons} cupons
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            cliente.qrCodesValidados === cliente.totalQrCodes && cliente.totalQrCodes > 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          )}>
                            {cliente.qrCodesValidados}/{cliente.totalQrCodes} validados
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-orange-500" />
                          <span className="text-sm font-medium text-orange-600">
                            {formatarMoeda(cliente.totalGasto)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatarData(cliente.ultimoResgate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard-loja/clientes/${cliente.id}`}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginação */}
            {!loading && paginacao.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Mostrando {((paginacao.page - 1) * paginacao.limit) + 1} a{' '}
                  {Math.min(paginacao.page * paginacao.limit, paginacao.total)} de{' '}
                  {paginacao.total} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={!paginacao.hasPrev}
                    className="h-8 w-8"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(paginacao.page - 1)}
                    disabled={!paginacao.hasPrev}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-3 py-1 bg-gray-100 rounded-md">
                    {paginacao.page} / {paginacao.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(paginacao.page + 1)}
                    disabled={!paginacao.hasNext}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(paginacao.totalPages)}
                    disabled={!paginacao.hasNext}
                    className="h-8 w-8"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

// Função auxiliar para classes condicionais
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};