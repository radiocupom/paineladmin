'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ArrowLeft, Gift, Loader2, QrCode, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import clienteService, { Cliente, UpdateClienteDTO, EstatisticasCliente, Resgate, QrCodeDetalhado } from '@/services/cliente';
import { useAuth } from '@/hooks/useAuth';

const formatarData = (data?: string | null) => {
  if (!data) return '-';
  try {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
};

const formatarMoeda = (valor?: number | string | null) => {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  if (numero === undefined || numero === null || Number.isNaN(numero)) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero);
};

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasCliente | null>(null);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [qrCodes, setQrCodes] = useState<QrCodeDetalhado[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'resgates' | 'qrcodes' | 'edit'>('overview');

  // Estados para os campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [pais, setPais] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [receberOfertas, setReceberOfertas] = useState(true);
  const [comoConheceu, setComoConheceu] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativo, setAtivo] = useState(true);

  const id = params.id as string;

  const carregarDados = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);

      const [clienteData, estatisticasData, resgatesData, qrCodesData] = await Promise.all([
        clienteService.buscarPorId(id),
        clienteService.getEstatisticasCliente(id),
        clienteService.getResgatesCliente(id, 1, 10),
        clienteService.getQrCodesCliente(id, 1, 10),
      ]);

      setCliente(clienteData);
      setEstatisticas(estatisticasData);
      setResgates(resgatesData.resgates);
      setQrCodes(qrCodesData.qrCodes);

      setNome(clienteData.nome);
      setEmail(clienteData.email);
      setWhatsapp(clienteData.whatsapp);
      setBairro(clienteData.bairro ?? '');
      setCidade(clienteData.cidade ?? '');
      setEstado(clienteData.estado ?? '');
      setGenero(clienteData.genero ?? '');
      setDataNascimento(clienteData.dataNascimento?.split('T')[0] ?? '');
      setPais(clienteData.pais ?? 'Brasil');
      setInstagram(clienteData.instagram ?? '');
      setFacebook(clienteData.facebook ?? '');
      setTiktok(clienteData.tiktok ?? '');
      setReceberOfertas(clienteData.receberOfertas ?? true);
      setComoConheceu(clienteData.comoConheceu ?? '');
      setObservacoes(clienteData.observacoes ?? '');
      setAtivo(clienteData.ativo ?? true);
    } catch {
      toast.error('Erro ao carregar cliente');
      router.push('/dashboard/clientes');
    } finally {
      setInitialLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSalvar = async () => {
  const dadosAtualizar: Partial<UpdateClienteDTO> = {};
  
  if (nome !== cliente?.nome) dadosAtualizar.nome = nome;
  if (email !== cliente?.email) dadosAtualizar.email = email;
  if (whatsapp !== cliente?.whatsapp) dadosAtualizar.whatsapp = whatsapp;
  if (bairro !== cliente?.bairro) dadosAtualizar.bairro = bairro;
  if (cidade !== cliente?.cidade) dadosAtualizar.cidade = cidade;
  if (estado !== cliente?.estado) dadosAtualizar.estado = estado;
  if (genero !== cliente?.genero) dadosAtualizar.genero = genero;
  
  // 🔥 CORREÇÃO AQUI
  const dataNascimentoOriginal = cliente?.dataNascimento 
    ? cliente.dataNascimento.split('T')[0] 
    : '';
  if (dataNascimento !== dataNascimentoOriginal) {
    dadosAtualizar.dataNascimento = dataNascimento;
  }
  
  if (pais !== cliente?.pais) dadosAtualizar.pais = pais;
  if (instagram !== cliente?.instagram) dadosAtualizar.instagram = instagram;
  if (facebook !== cliente?.facebook) dadosAtualizar.facebook = facebook;
  if (tiktok !== cliente?.tiktok) dadosAtualizar.tiktok = tiktok;
  if (receberOfertas !== cliente?.receberOfertas) {
    dadosAtualizar.receberOfertas = receberOfertas;
  }
  if (comoConheceu !== cliente?.comoConheceu) dadosAtualizar.comoConheceu = comoConheceu;
  if (observacoes !== cliente?.observacoes) dadosAtualizar.observacoes = observacoes;
  if (ativo !== cliente?.ativo) dadosAtualizar.ativo = ativo;

  if (Object.keys(dadosAtualizar).length === 0) {
    toast.info('Nenhuma alteração detectada');
    router.push('/dashboard/clientes');
    return;
  }

  try {
    setLoading(true);
    await clienteService.atualizar(id, dadosAtualizar);
    toast.success('Cliente atualizado com sucesso!');
    router.push('/dashboard/clientes');
  } catch (error: unknown) {
    type ApiError = { response?: { data?: { error?: string } } };
    const message =
      typeof error === 'object' && error !== null
        ? (error as ApiError).response?.data?.error
        : null;

    toast.error(message || 'Erro ao atualizar cliente');
  } finally {
    setLoading(false);
  }
};
  const podeEditar = () => {
    return currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  };

  if (initialLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cliente) {
    return null;
  }

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
              Cliente
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              {cliente.nome}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
              Visão geral
            </TabsTrigger>
            <TabsTrigger value="resgates" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
              Resgates
            </TabsTrigger>
            <TabsTrigger value="qrcodes" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="edit" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
              Editar
            </TabsTrigger>
          </TabsList>

          {/* Visão geral */}
          <TabsContent value="overview" className="space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {cliente.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {cliente.nome}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{cliente.email}</p>
                      <p className="text-xs text-gray-500 truncate">{cliente.whatsapp}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge
                        className={
                          cliente.ativo
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cidade</span>
                      <span className="text-right">
                        {[cliente.cidade, cliente.estado, cliente.pais]
                          .filter(Boolean)
                          .join(' - ') || 'Não informado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Recebe ofertas</span>
                      <span className="text-right">
                        {cliente.receberOfertas ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    {cliente.comoConheceu && (
                      <div className="flex items-center justify-between">
                        <span>Conheceu via</span>
                        <span className="text-right">{cliente.comoConheceu}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  {!estatisticas ? (
                    <p className="text-sm text-gray-500">Carregando estatísticas...</p>
                  ) : (
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Total de resgates</span>
                        <span className="font-semibold">{estatisticas.resgates.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cupons únicos</span>
                        <span className="font-semibold">{estatisticas.resgates.cuponsUnicos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>QR codes</span>
                        <span className="font-semibold">{estatisticas.qrCodes.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validados</span>
                        <span className="font-semibold">{estatisticas.qrCodes.validados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de validação</span>
                        <span className="font-semibold">{estatisticas.qrCodes.taxaValidacao}</span>
                      </div>
                      {estatisticas.resgates.ultimoResgate && (
                        <div className="flex justify-between">
                          <span>Último resgate</span>
                          <span className="font-semibold">
                            {formatarData(estatisticas.resgates.ultimoResgate.data)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  {!estatisticas ? (
                    <p className="text-sm text-gray-500">Carregando dados...</p>
                  ) : (
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Total gasto</span>
                        <span className="font-semibold">{formatarMoeda(Number(estatisticas.financeiro.totalGasto))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total economizado</span>
                        <span className="font-semibold">
                          {formatarMoeda(Number(estatisticas.financeiro.totalEconomizado))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ticket médio</span>
                        <span className="font-semibold">
                          {formatarMoeda(Number(estatisticas.financeiro.ticketMedio))}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Últimos resgates</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cupom</TableHead>
                        <TableHead>QR Codes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[90px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resgates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        resgates.slice(0, 5).map((resgate) => {
                          const qrValidados = resgate.qrCodes?.filter(q => q.validado).length || 0;
                          const todosValidados = resgate.qrCodes?.length
                            ? qrValidados === resgate.qrCodes.length
                            : false;

                          return (
                            <TableRow key={resgate.id} className="hover:bg-gray-50">
                              <TableCell className="text-sm text-gray-700">
                                {formatarData(resgate.resgatadoEm)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {resgate.cupom.codigo}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {resgate.qrCodes?.length ?? 0}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-[11px] ${
                                    todosValidados
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {todosValidados ? 'Completo' : 'Parcial'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Link href={`/dashboard/clientes/${id}/resgates/${resgate.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Gift className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Últimos QR Codes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Usado em</TableHead>
                        <TableHead>Validado em</TableHead>
                        <TableHead className="w-[90px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qrCodes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-sm text-gray-500">Nenhum QR code encontrado</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        qrCodes.slice(0, 5).map((qrCode) => (
                          <TableRow key={qrCode.id} className="hover:bg-gray-50">
                            <TableCell>
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {qrCode.codigo}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge className={qrCode.validado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {qrCode.validado ? 'Validado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatarData(qrCode.usadoEm)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {qrCode.validadoEm ? formatarData(qrCode.validadoEm) : '-'}
                            </TableCell>
                            <TableCell>
                              <Link href={`/dashboard/clientes/${id}/qrcode/${qrCode.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <QrCode className="h-4 w-4" />
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
            </div>
          </TabsContent>

          {/* Resgates */}
          <TabsContent value="resgates" className="space-y-6 mt-4 sm:mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resgates</CardTitle>
                <CardDescription>Veja todos os resgates deste cliente</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>QR Codes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[90px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resgates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      resgates.map((resgate) => {
                        const qrValidados = resgate.qrCodes?.filter(q => q.validado).length || 0;
                        const todosValidados = resgate.qrCodes?.length
                          ? qrValidados === resgate.qrCodes.length
                          : false;

                        return (
                          <TableRow key={resgate.id} className="hover:bg-gray-50">
                            <TableCell className="text-sm text-gray-700">
                              {formatarData(resgate.resgatadoEm)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {resgate.cupom.codigo}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {resgate.quantidade}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {resgate.qrCodes?.length ?? 0}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-[11px] ${
                                  todosValidados
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {todosValidados ? 'Completo' : 'Parcial'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/dashboard/clientes/${id}/resgates/${resgate.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Gift className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Codes */}
          <TabsContent value="qrcodes" className="space-y-6 mt-4 sm:mt-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
                <CardDescription>Verifique os QR codes gerados para este cliente</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usado em</TableHead>
                      <TableHead>Validado em</TableHead>
                      <TableHead className="w-[90px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qrCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-sm text-gray-500">Nenhum QR code encontrado</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      qrCodes.map((qrCode) => (
                        <TableRow key={qrCode.id} className="hover:bg-gray-50">
                          <TableCell>
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {qrCode.codigo}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge className={qrCode.validado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {qrCode.validado ? 'Validado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatarData(qrCode.usadoEm)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {qrCode.validadoEm ? formatarData(qrCode.validadoEm) : '-'}
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard/clientes/${id}/qrcode/${qrCode.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <QrCode className="h-4 w-4" />
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

          {/* Editar */}
          <TabsContent value="edit" className="space-y-6 mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Informações do Cliente</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Altere os dados do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4 sm:space-y-6">
                  <Tabs defaultValue="dados" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                      <TabsTrigger value="dados" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                        Dados Pessoais
                      </TabsTrigger>
                      <TabsTrigger value="endereco" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                        Endereço
                      </TabsTrigger>
                      <TabsTrigger value="social" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                        Redes Sociais
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Nome</Label>
                          <Input 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Email</Label>
                          <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">WhatsApp</Label>
                          <Input 
                            value={whatsapp} 
                            onChange={(e) => setWhatsapp(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Gênero</Label>
                          <Select value={genero} onValueChange={setGenero}>
                            <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MASCULINO" className="text-xs sm:text-sm">Masculino</SelectItem>
                              <SelectItem value="FEMININO" className="text-xs sm:text-sm">Feminino</SelectItem>
                              <SelectItem value="OUTRO" className="text-xs sm:text-sm">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Data de Nascimento</Label>
                          <Input 
                            type="date" 
                            value={dataNascimento} 
                            onChange={(e) => setDataNascimento(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">País</Label>
                          <Input 
                            value={pais} 
                            onChange={(e) => setPais(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2 space-y-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="receberOfertas"
                              checked={receberOfertas}
                              onCheckedChange={setReceberOfertas}
                              className="scale-75 sm:scale-100"
                            />
                            <Label htmlFor="receberOfertas" className="text-xs sm:text-sm">
                              Receber ofertas
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="ativo"
                              checked={ativo}
                              onCheckedChange={setAtivo}
                              className="scale-75 sm:scale-100"
                            />
                            <Label htmlFor="ativo" className="text-xs sm:text-sm">
                              Cliente ativo
                            </Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="endereco" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Bairro</Label>
                          <Input 
                            value={bairro} 
                            onChange={(e) => setBairro(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Cidade</Label>
                          <Input 
                            value={cidade} 
                            onChange={(e) => setCidade(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Estado</Label>
                          <Input 
                            value={estado} 
                            onChange={(e) => setEstado(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Instagram</Label>
                          <Input 
                            placeholder="@usuario" 
                            value={instagram} 
                            onChange={(e) => setInstagram(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Facebook</Label>
                          <Input 
                            value={facebook} 
                            onChange={(e) => setFacebook(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">TikTok</Label>
                          <Input 
                            placeholder="@usuario" 
                            value={tiktok} 
                            onChange={(e) => setTiktok(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Como conheceu?</Label>
                          <Input 
                            value={comoConheceu} 
                            onChange={(e) => setComoConheceu(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                          <Label className="text-xs sm:text-sm">Observações</Label>
                          <Input 
                            value={observacoes} 
                            onChange={(e) => setObservacoes(e.target.value)} 
                            className="h-8 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Botões de ação */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSalvar}
                      className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600"
                      disabled={loading || !podeEditar()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}