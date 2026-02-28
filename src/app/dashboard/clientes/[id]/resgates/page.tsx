'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Loader2,
  Ticket,
  Store,
  Calendar,
  TrendingUp,
  Award,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Download,
  User,
  DollarSign,
  CreditCard,
  TrendingDown,
  Gift,
  Percent,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import clienteService, { ClienteWithResgates } from '@/services/cliente';
import { cn } from '@/lib/utils';

// Funções auxiliares
const formatarMoeda = (valor: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatarTelefone = (telefone: string): string => {
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 11) {
    return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
  }
  return telefone;
};

const calcularIdade = (dataNascimento?: string): number | null => {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade;
};

export default function DetalheClientePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<ClienteWithResgates | null>(null);
  const [resgates, setResgates] = useState<any[]>([]);

  const id = params.id as string;

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await clienteService.buscarComResgates(id);
      setCliente(data);
      setResgates(data.resgates || []);
      console.log('📦 Dados do cliente:', data);
    } catch (error) {
      toast.error('Erro ao carregar dados do cliente');
      router.push('/dashboard/clientes');
    } finally {
      setLoading(false);
    }
  };

  const exportarDados = () => {
    if (resgates.length === 0) return;
    
    const dadosCSV = resgates.map(r => ({
      'Data': formatarData(r.resgatadoEm),
      'Cupom': r.cupom.codigo,
      'Descrição': r.cupom.descricao,
      'Loja': r.cupom.loja?.nome || '-',
      'Quantidade': r.quantidade,
      'Valor Original': r.cupom.precoOriginal || 0,
      'Valor Pago': r.cupom.precoComDesconto || 0,
      'Status': r.qrCodeValidado ? 'Validado' : 'Pendente'
    }));

    const csv = [
      Object.keys(dadosCSV[0]).join(','),
      ...dadosCSV.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cliente_${cliente?.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Cálculos financeiros
  const totalGasto = resgates.reduce((acc, r) => {
    return acc + (r.cupom.precoComDesconto || 0) * r.quantidade;
  }, 0);

  const totalEconomizado = resgates.reduce((acc, r) => {
    const original = (r.cupom.precoOriginal || 0) * r.quantidade;
    const pago = (r.cupom.precoComDesconto || 0) * r.quantidade;
    return acc + (original - pago);
  }, 0);

  const totalBruto = resgates.reduce((acc, r) => {
    return acc + (r.cupom.precoOriginal || 0) * r.quantidade;
  }, 0);

  const ticketMedio = resgates.length > 0 ? totalGasto / resgates.length : 0;

  const lojasVisitadas = new Set(resgates.map(r => r.cupom.loja?.nome)).size;
  const cuponsUnicos = new Set(resgates.map(r => r.cupom.id)).size;
  const validados = resgates.filter(r => r.qrCodeValidado).length;
  const taxaValidacao = resgates.length > 0 ? (validados / resgates.length) * 100 : 0;

  const idade = calcularIdade(cliente?.dataNascimento);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando dados do cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cliente) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <User className="h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cliente não encontrado</h2>
          <Button onClick={() => router.back()} variant="outline">
            Voltar
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                {cliente.nome}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate max-w-[250px] sm:max-w-md">
                {cliente.email} • {cliente.whatsapp}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={exportarDados}
            className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 gap-1 sm:gap-2 w-full sm:w-auto"
            disabled={resgates.length === 0}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Exportar Dados</span>
            <span className="xs:hidden">Exportar</span>
          </Button>
        </div>

        {/* Cards de informações do cliente */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> Nome
                </p>
                <p className="text-sm font-medium">{cliente.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <a href={`mailto:${cliente.email}`} className="text-sm font-medium hover:text-blue-600 hover:underline">
                  {cliente.email}
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> WhatsApp
                </p>
                <a 
                  href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-green-600 hover:underline"
                >
                  {formatarTelefone(cliente.whatsapp)}
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Idade
                </p>
                <p className="text-sm font-medium">{idade ? `${idade} anos` : 'Não informado'}</p>
              </div>
              {cliente.cidade && cliente.estado && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localização
                  </p>
                  <p className="text-sm font-medium">{cliente.cidade}/{cliente.estado}</p>
                </div>
              )}
              {cliente.genero && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Gênero</p>
                  <p className="text-sm font-medium">{cliente.genero}</p>
                </div>
              )}
              {cliente.comoConheceu && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Como conheceu</p>
                  <p className="text-sm font-medium">{cliente.comoConheceu}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Status</p>
                <Badge className={cn(
                  "text-xs",
                  cliente.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                )}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards financeiros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-orange-500" />
                Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-orange-600">
                {formatarMoeda(totalGasto)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-green-500" />
                Economia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-green-600">
                {formatarMoeda(totalEconomizado)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-purple-500" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-purple-600">
                {formatarMoeda(ticketMedio)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <Percent className="h-3 w-3 text-blue-500" />
                Validação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-blue-600">
                {taxaValidacao.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                Resgates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold">
                {resgates.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Cupons Únicos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold">
                {cuponsUnicos}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <Store className="h-3 w-3" />
                Lojas Visitadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold">
                {lojasVisitadas}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Validados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-green-600">
                {validados}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Redes Sociais */}
        {(cliente.instagram || cliente.facebook || cliente.tiktok) && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-4">
                {cliente.instagram && (
                  <a 
                    href={`https://instagram.com/${cliente.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
                  >
                    <Instagram className="h-4 w-4" />
                    {cliente.instagram}
                  </a>
                )}
                {cliente.facebook && (
                  <a 
                    href={`https://facebook.com/${cliente.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Facebook className="h-4 w-4" />
                    {cliente.facebook}
                  </a>
                )}
                {cliente.tiktok && (
                  <a 
                    href={`https://tiktok.com/@${cliente.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                  >
                    <Globe className="h-4 w-4" />
                    {cliente.tiktok}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {cliente.observacoes && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Observações</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{cliente.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Resgates - versão desktop */}
        <Card className="hidden lg:block">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Histórico de Resgates</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {resgates.length} resgates encontrados • Total gasto: {formatarMoeda(totalGasto)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Loja</TableHead>
                  <TableHead className="text-xs">Cupom</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">Qtd</TableHead>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Data/Hora</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
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
                  resgates.map((resgate) => (
                    <TableRow key={resgate.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] sm:text-xs">
                              {resgate.cupom.loja?.nome?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs sm:text-sm font-medium truncate max-w-[100px]">
                            {resgate.cupom.loja?.nome || 'Loja'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-[10px] sm:text-xs font-mono">
                          {resgate.cupom.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm truncate max-w-[150px] block">
                          {resgate.cupom.descricao}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs">
                          {resgate.quantidade}x
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm font-medium text-green-600">
                          {formatarMoeda((resgate.cupom.precoComDesconto || 0) * resgate.quantidade)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {formatarData(resgate.resgatadoEm)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {resgate.qrCodeValidado ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs">
                            <CheckCircle2 className="h-2 w-2 mr-1" />
                            Validado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[10px] sm:text-xs">
                            <Clock className="h-2 w-2 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards para mobile/tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
          {resgates.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Ticket className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
            </div>
          ) : (
            resgates.map((resgate) => (
              <Card key={resgate.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start gap-2 mb-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs sm:text-sm">
                        {resgate.cupom.loja?.nome?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-medium truncate max-w-[120px]">
                          {resgate.cupom.loja?.nome || 'Loja'}
                        </h3>
                        <Badge variant="outline" className="bg-orange-50 text-[8px] sm:text-[10px] px-1.5">
                          {resgate.cupom.codigo}
                        </Badge>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-1">
                        {resgate.cupom.descricao}
                      </p>
                    </div>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px]",
                      resgate.qrCodeValidado 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    )}>
                      {resgate.quantidade}x
                    </Badge>
                  </div>

                  {/* Informações do card */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{new Date(resgate.resgatadoEm).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-green-600">
                        {formatarMoeda((resgate.cupom.precoComDesconto || 0) * resgate.quantidade)}
                      </span>
                    </div>
                  </div>

                  {/* Badge de status */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    {resgate.qrCodeValidado ? (
                      <Badge className="bg-green-100 text-green-700 text-[8px] sm:text-[10px]">
                        <CheckCircle2 className="h-2 w-2 mr-1" />
                        Validado em {resgate.qrCodeValidadoEm ? new Date(resgate.qrCodeValidadoEm).toLocaleDateString() : '-'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[8px] sm:text-[10px]">
                        <Clock className="h-2 w-2 mr-1" />
                        Aguardando validação
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Informações do sistema */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-gray-400 border-t pt-4">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>ID: {cliente.id.slice(0, 8)}...</span>
          </div>
          <div>Cadastro: {new Date(cliente.createdAt).toLocaleDateString()}</div>
          {cliente.ultimoLogin && (
            <div>Último login: {new Date(cliente.ultimoLogin).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}