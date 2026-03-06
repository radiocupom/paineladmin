// app/dashboard-loja/clientes/[id]/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  QrCode,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  Loader2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Instagram,
  Facebook,
  Globe,
  MessageCircle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import clienteService, { 
  ClienteDaLoja, 
  Resgate, 
  QrCodeLoja,
  ListaResgatesResponse 
} from '@/services/cliente';
import authService from '@/services/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

// 🔥 INTERFACE ATUALIZADA COM TODOS OS CAMPOS DO CLIENTE
interface ClienteInfo {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  genero?: string;
  dataNascimento?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas?: boolean;
  comoConheceu?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  ultimoLogin?: string;
}

export default function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const router = useRouter();
  const { user } = useAuth() as { user: Usuario | null };
  const [loading, setLoading] = useState(true);
  
  // Dados do cliente
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [qrCodes, setQrCodes] = useState<QrCodeLoja[]>([]);
  
  // Estatísticas calculadas
  const [estatisticas, setEstatisticas] = useState({
    totalResgates: 0,
    totalCuponsDistintos: 0,
    totalQrCodes: 0,
    qrCodesValidados: 0,
    totalGasto: 0,
    totalEconomizado: 0,
    ticketMedio: 0
  });

  // Paginação
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const [activeTab, setActiveTab] = useState('resgates');
  const [copiando, setCopiando] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const carregarDados = async (page = 1) => {
    try {
      setLoading(true);
      
      const currentUser = authService.getCurrentUser() as Usuario | null;
      const lojaId = currentUser?.loja?.id || currentUser?.lojaId;

      if (!lojaId) {
        toast.error('ID da loja não encontrado');
        return;
      }

      console.log('🏪 Buscando resgates da loja:', { lojaId, page });
      
      const response = await clienteService.listarResgatesDaLoja(lojaId, page, 20);
      console.log('📦 Resposta completa da API:', response);

      // Filtrar apenas os resgates deste cliente
      const resgatesDoCliente = response.resgates.filter(r => r.cliente?.id === id);
      
      if (resgatesDoCliente.length === 0 && page === 1) {
        toast.error('Cliente não encontrado nesta loja');
        router.push('/dashboard-loja/clientes');
        return;
      }

      // 🔥 EXTRAIR TODAS AS INFORMAÇÕES DO CLIENTE
      const primeiroResgate = resgatesDoCliente[0];
      if (primeiroResgate && !cliente) {
        setCliente({
          id: primeiroResgate.cliente.id,
          nome: primeiroResgate.cliente.nome,
          email: primeiroResgate.cliente.email,
          whatsapp: primeiroResgate.cliente.whatsapp,
          bairro: primeiroResgate.cliente.bairro,
          cidade: primeiroResgate.cliente.cidade,
          estado: primeiroResgate.cliente.estado,
          pais: primeiroResgate.cliente.pais,
          genero: primeiroResgate.cliente.genero,
          dataNascimento: primeiroResgate.cliente.dataNascimento,
          instagram: primeiroResgate.cliente.instagram,
          facebook: primeiroResgate.cliente.facebook,
          tiktok: primeiroResgate.cliente.tiktok,
          receberOfertas: primeiroResgate.cliente.receberOfertas,
          comoConheceu: primeiroResgate.cliente.comoConheceu,
          observacoes: primeiroResgate.cliente.observacoes,
          ativo: primeiroResgate.cliente.ativo,
          createdAt: primeiroResgate.cliente.createdAt,
          ultimoLogin: primeiroResgate.cliente.ultimoLogin
        });
      }

      // No componente, ao criar todosQrCodes:
const todosQrCodes = resgatesDoCliente.flatMap(r => 
  (r.qrCodes || []).map(q => ({
    id: q.id,
    codigo: q.codigo,
    usadoEm: q.usadoEm,
    validado: q.validado,
    validadoEm: q.validadoEm,
    cupomId: r.cupom.id,  // ← ADICIONE ESTA LINHA
    cupom: r.cupom,
    cliente: r.cliente
  }))
) as QrCodeLoja[];

      // Calcular estatísticas
      const totalResgates = resgatesDoCliente.length;
      const cuponsDistintos = new Set(resgatesDoCliente.map(r => r.cupom.id)).size;
      const totalQrCodes = todosQrCodes.length;
      const qrCodesValidados = todosQrCodes.filter(q => q.validado).length;
      
      const totalGasto = todosQrCodes
        .filter(q => q.validado)
        .reduce((acc, q) => acc + (q.cupom?.precoComDesconto || 0), 0);
      
      const totalEconomizado = todosQrCodes
        .filter(q => q.validado)
        .reduce((acc, q) => {
          const original = q.cupom?.precoOriginal || 0;
          const comDesconto = q.cupom?.precoComDesconto || 0;
          return acc + (original - comDesconto);
        }, 0);

      const ticketMedio = totalResgates > 0 ? totalGasto / totalResgates : 0;

      setEstatisticas({
        totalResgates,
        totalCuponsDistintos: cuponsDistintos,
        totalQrCodes,
        qrCodesValidados,
        totalGasto,
        totalEconomizado,
        ticketMedio
      });

      setResgates(resgatesDoCliente);
      setQrCodes(todosQrCodes);
      setPaginacao(response.pagination);

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao carregar dados do cliente');
      }
      
      router.push('/dashboard-loja/clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados(1);
  }, [id]);

  const handlePageChange = (newPage: number) => {
    carregarDados(newPage);
  };

  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiando(codigo);
    toast.success('Código copiado!');
    setTimeout(() => setCopiando(null), 2000);
  };

  // Filtrar QR codes por status
  const qrCodesFiltrados = qrCodes.filter(q => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'validado') return q.validado;
    if (filtroStatus === 'pendente') return !q.validado;
    return true;
  });

  // Formatações
  const formatarData = (data: string | null): string => {
    if (!data) return 'N/A';
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatarDataHora = (data: string | null): string => {
    if (!data) return 'N/A';
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  if (loading || !cliente) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando dados do cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-6 p-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Cliente</h1>
            <p className="text-gray-500 mt-1">
              Informações completas do cliente e seu histórico
            </p>
          </div>
        </div>

        {/* Card do Perfil do Cliente */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar e status - Coluna esquerda */}
              <div className="flex flex-col items-center text-center lg:w-72">
                <Avatar className="h-32 w-32 border-4 border-orange-100 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-3xl text-white">
                    {cliente.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-gray-900">{cliente.nome}</h2>
                <Badge className={`mt-2 ${
                  cliente.ativo 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                
                {/* Como conheceu e receber ofertas */}
                <div className="mt-4 w-full space-y-2">
                  {cliente.comoConheceu && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span>Conheceu via: {cliente.comoConheceu}</span>
                    </div>
                  )}
                  {cliente.receberOfertas !== undefined && (
                    <Badge variant="outline" className={cliente.receberOfertas ? 'bg-green-50' : 'bg-gray-50'}>
                      {cliente.receberOfertas ? '📧 Recebe ofertas' : '📧 Não recebe ofertas'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Informações detalhadas - Coluna direita */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna 1: Contato e Localização */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Contato</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">{cliente.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">{cliente.whatsapp}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">
                        {[
                          cliente.bairro,
                          cliente.cidade,
                          cliente.estado,
                          cliente.pais
                        ].filter(Boolean).join(' - ') || 'Não informado'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-700 border-b pb-2 mt-6">Redes Sociais</h3>
                  
                  <div className="space-y-3">
                    {cliente.instagram && (
                      <div className="flex items-center gap-3 text-sm">
                        <Instagram className="h-4 w-4 text-pink-500" />
                        <span className="text-gray-600">{cliente.instagram}</span>
                      </div>
                    )}
                    
                    {cliente.facebook && (
                      <div className="flex items-center gap-3 text-sm">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">{cliente.facebook}</span>
                      </div>
                    )}
                    
                    {cliente.tiktok && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-gray-900" />
                        <span className="text-gray-600">{cliente.tiktok}</span>
                      </div>
                    )}

                    {!cliente.instagram && !cliente.facebook && !cliente.tiktok && (
                      <p className="text-sm text-gray-400">Nenhuma rede social cadastrada</p>
                    )}
                  </div>
                </div>

                {/* Coluna 2: Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Dados Pessoais</h3>
                  
                  <div className="space-y-3">
                    {cliente.genero && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">Gênero: {cliente.genero}</span>
                      </div>
                    )}
                    
                    {cliente.dataNascimento && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">
                          Nasc: {formatarData(cliente.dataNascimento)} 
                          <span className="text-gray-400 ml-1">
                            ({calcularIdade(cliente.dataNascimento)} anos)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-700 border-b pb-2 mt-6">Histórico</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Hash className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">
                        Cliente desde {formatarData(cliente.createdAt)}
                      </span>
                    </div>
                    
                    {cliente.ultimoLogin && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">
                          Último login: {formatarDataHora(cliente.ultimoLogin)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  {cliente.observacoes && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-700 border-b pb-2">Observações</h3>
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                        {cliente.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Resgates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalResgates}</div>
              <p className="text-xs text-gray-500 mt-1">
                {estatisticas.totalResgates === 1 ? 'resgate' : 'resgates'} realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Cupons Distintos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalCuponsDistintos}</div>
              <p className="text-xs text-gray-500 mt-1">
                cupons diferentes resgatados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estatisticas.qrCodesValidados}/{estatisticas.totalQrCodes}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {estatisticas.qrCodesValidados} validados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatarMoeda(estatisticas.totalGasto)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                em compras na loja
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de economia e ticket médio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                Economia Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatarMoeda(estatisticas.totalEconomizado)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                desconto total concedido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatarMoeda(estatisticas.ticketMedio)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                valor médio por resgate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="resgates" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Resgates
            </TabsTrigger>
            <TabsTrigger value="qrcodes" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </TabsTrigger>
          </TabsList>

          {/* Tab de Resgates */}
          <TabsContent value="resgates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Resgates</CardTitle>
                <CardDescription>
                  Todos os resgates realizados pelo cliente na sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead>Economia</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data do Resgate</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resgates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                            <p className="text-gray-500">Nenhum resgate encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      resgates.map((resgate) => {
                        const economia = (resgate.cupom.precoOriginal || 0) - (resgate.cupom.precoComDesconto || 0);
                        const todosValidados = (resgate.qrCodes || []).every(q => q.validado);
                        
                        return (
                          <TableRow key={resgate.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-orange-500" />
                                <div>
                                  <p className="font-medium text-sm">{resgate.cupom.codigo}</p>
                                  <p className="text-xs text-gray-500">{resgate.cupom.descricao}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50">
                                {resgate.quantidade}x
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 line-through">
                              {formatarMoeda(resgate.cupom.precoOriginal || 0)}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-orange-600">
                              {formatarMoeda(resgate.cupom.precoComDesconto || 0)}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-green-600">
                              {formatarMoeda(economia)}
                            </TableCell>
                            <TableCell>
                              {todosValidados ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Validado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatarDataHora(resgate.resgatadoEm)}
                            </TableCell>
                            <TableCell>
                              <Link href={`/dashboard-loja/clientes/${cliente.id}/resgate/${resgate.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {/* Paginação */}
                {paginacao.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-gray-500">
                      Mostrando {((paginacao.page - 1) * paginacao.limit) + 1} a{' '}
                      {Math.min(paginacao.page * paginacao.limit, paginacao.total)} de{' '}
                      {paginacao.total} resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginacao.page - 1)}
                        disabled={!paginacao.hasPrev}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm px-3 py-1 bg-gray-100 rounded-md">
                        {paginacao.page} / {paginacao.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginacao.page + 1)}
                        disabled={!paginacao.hasNext}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de QR Codes */}
          <TabsContent value="qrcodes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>QR Codes do Cliente</CardTitle>
                    <CardDescription>
                      Todos os QR codes gerados e seus status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltroStatus('todos')}
                      className={filtroStatus === 'todos' ? 'bg-orange-50 border-orange-200' : ''}
                    >
                      Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltroStatus('pendente')}
                      className={filtroStatus === 'pendente' ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-yellow-50'}
                    >
                      Pendentes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltroStatus('validado')}
                      className={filtroStatus === 'validado' ? 'bg-green-50 border-green-200' : 'hover:bg-green-50'}
                    >
                      Validados
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Uso</TableHead>
                      <TableHead>Validação</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qrCodesFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <QrCode className="h-8 w-8 text-gray-300" />
                            <p className="text-gray-500">Nenhum QR code encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      qrCodesFiltrados.map((qrCode) => (
                        <TableRow key={qrCode.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {qrCode.codigo.substring(0, 8)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopiarCodigo(qrCode.codigo)}
                              >
                                {copiando === qrCode.codigo ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{qrCode.cupom.codigo}</p>
                              <p className="text-xs text-gray-500">{qrCode.cupom.descricao}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {qrCode.validado ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatarDataHora(qrCode.usadoEm)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {qrCode.validadoEm ? formatarDataHora(qrCode.validadoEm) : '-'}
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard-loja/clientes/${cliente.id}/qrcode/${qrCode.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}