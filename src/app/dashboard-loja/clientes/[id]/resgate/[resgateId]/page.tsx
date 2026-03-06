// app/dashboard-loja/clientes/[id]/resgate/[resgateId]/page.jsx
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
  QrCode,
  DollarSign,
  Gift,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import clienteService, { 
  QrCodeLoja,
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

interface ResgateDetalhado {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  cupomId: string;
  cupom: {
    id: string;
    codigo: string;
    descricao: string;
    precoOriginal?: number;
    precoComDesconto?: number;
    percentualDesconto?: number;
    nomeProduto?: string;
    logo?: string;
  };
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
  };
  qrCodes: QrCodeLoja[];
}

export default function DetalhesResgatePage({ 
  params 
}: { 
  params: Promise<{ id: string; resgateId: string }> 
}) {
  const { id, resgateId } = React.use(params);
  
  const router = useRouter();
  const { user } = useAuth() as { user: Usuario | null };
  const [loading, setLoading] = useState(true);
  const [resgate, setResgate] = useState<ResgateDetalhado | null>(null);
  const [copiando, setCopiando] = useState<string | null>(null);

  const carregarDados = async () => {
  try {
    setLoading(true);
    
    const currentUser = authService.getCurrentUser() as Usuario | null;
    const lojaId = currentUser?.loja?.id || currentUser?.lojaId;

    if (!lojaId) {
      toast.error('ID da loja não encontrado');
      router.push('/dashboard-loja/clientes');
      return;
    }

    console.log('🏪 Buscando QR codes do resgate:', { lojaId, clienteId: id, resgateId });
    
    // 🔥 CHAMADA CORRETA - já está funcionando!
    const qrCodesData = await clienteService.buscarQrCodesPorResgateDaLoja(lojaId, id, resgateId);
    console.log('📦 QR Codes recebidos:', qrCodesData);

    if (!qrCodesData || qrCodesData.length === 0) {
      toast.error('Nenhum QR code encontrado');
      router.push(`/dashboard-loja/clientes/${id}`);
      return;
    }

    // 🔥 Buscar dados do cliente (já que o QR code não traz)
    const clienteData = await clienteService.buscarClienteDaLoja(lojaId, id);
    
    // 🔥 MONTAR O RESGATE COM OS DADOS COMBINADOS
    const primeiroQr = qrCodesData[0];
    
    const resgateData: ResgateDetalhado = {
      id: resgateId,
      quantidade: qrCodesData.length,
      resgatadoEm: primeiroQr.usadoEm,
      cupomId: primeiroQr.cupomId,
      cupom: {
        id: primeiroQr.cupom.id,
        codigo: primeiroQr.cupom.codigo,
        descricao: primeiroQr.cupom.descricao,
        precoOriginal: primeiroQr.cupom.precoOriginal,
        precoComDesconto: primeiroQr.cupom.precoComDesconto,
        percentualDesconto: primeiroQr.cupom.percentualDesconto,
        nomeProduto: primeiroQr.cupom.nomeProduto,
        logo: primeiroQr.cupom.loja?.logo
      },
      cliente: {
        id: clienteData.id,
        nome: clienteData.nome,
        email: clienteData.email,
        whatsapp: clienteData.whatsapp
      },
      // 🔥 IMPORTANTE: Manter a estrutura que a API retornou
      qrCodes: qrCodesData.map(q => ({
        ...q,
        cupom: q.cupom  // Já vem com o cupom
      }))
    };

    setResgate(resgateData);

  } catch (error) {
    console.error('❌ Erro:', error);
    toast.error('Erro ao carregar dados');
    router.push(`/dashboard-loja/clientes/${id}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    carregarDados();
  }, [id, resgateId]);

  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiando(codigo);
    toast.success('Código copiado!');
    setTimeout(() => setCopiando(null), 2000);
  };

  const formatarDataHora = (data: string | null): string => {
    if (!data) return 'N/A';
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const calcularEconomia = (original: number, comDesconto: number): number => {
    return (original || 0) - (comDesconto || 0);
  };

  // MOSTRAR LOADING ENQUANTO CARREGA
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando detalhes do resgate...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // SE NÃO TIVER DADOS, NÃO RENDERIZA NADA
  if (!resgate) {
    return null;
  }

  const economia = calcularEconomia(
    resgate.cupom.precoOriginal || 0,
    resgate.cupom.precoComDesconto || 0
  );

  const todosValidados = resgate.qrCodes.every(q => q.validado);
  const qrValidados = resgate.qrCodes.filter(q => q.validado).length;

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-6 p-6 max-w-5xl mx-auto">
        {/* Cabeçalho com navegação */}
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
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Resgate</h1>
            <p className="text-gray-500 mt-1">
              Informações completas do resgate e seus QR codes
            </p>
          </div>
        </div>

        {/* Cards de resumo em grid 3 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card do Cliente */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-orange-100">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    {resgate.cliente.nome?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{resgate.cliente.nome}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {resgate.cliente.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {resgate.cliente.whatsapp}
                  </p>
                </div>
              </div>
              <Link 
                href={`/dashboard-loja/clientes/${resgate.cliente.id}`}
                className="text-xs text-orange-600 hover:text-orange-700 mt-3 inline-block"
              >
                Ver perfil completo →
              </Link>
            </CardContent>
          </Card>

          {/* Card do Cupom */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Cupom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  <span className="font-mono font-bold">{resgate.cupom.codigo}</span>
                </div>
                <p className="text-sm text-gray-600">{resgate.cupom.descricao}</p>
                {resgate.cupom.nomeProduto && (
                  <p className="text-xs text-gray-500">
                    Produto: {resgate.cupom.nomeProduto}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-orange-50">
                    {resgate.quantidade}x
                  </Badge>
                  {todosValidados ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Parcial
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Valores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Original:</span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatarMoeda(resgate.cupom.precoOriginal || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pago:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatarMoeda(resgate.cupom.precoComDesconto || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">Economia:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatarMoeda(economia)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Desconto:</span>
                  <span>{resgate.cupom.percentualDesconto}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Resgate */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Resgate</CardTitle>
            <CardDescription>
              Detalhes sobre quando e como o resgate foi realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Data do resgate:</span>
                  <span className="font-medium">{formatarDataHora(resgate.resgatadoEm)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">QR codes gerados:</span>
                  <span className="font-medium">{resgate.qrCodes.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">QR codes validados:</span>
                  <span className="font-medium text-green-600">{qrValidados}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">QR codes pendentes:</span>
                  <span className="font-medium text-yellow-600">{resgate.qrCodes.length - qrValidados}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle>QR Codes do Resgate</CardTitle>
            <CardDescription>
              {resgate.qrCodes.length} {resgate.qrCodes.length === 1 ? 'código gerado' : 'códigos gerados'} 
              {' • '}
              {qrValidados} validados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Uso</TableHead>
                  <TableHead>Data de Validação</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resgate.qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {qrCode.codigo}
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
                      {qrCode.validado ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
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
                      <Link href={`/dashboard-loja/clientes/${resgate.cliente.id}/qrcode/${qrCode.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Botão de voltar */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full max-w-xs"
          >
            Voltar para lista de resgates
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}