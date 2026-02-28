'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Plus,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import cupomService, { Cupom } from '@/services/cupom';
import qrCodeService, { QRCodeItem } from '@/services/qrcode';
import { toast } from 'sonner';
import Image from 'next/image';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

export default function QrCodesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [search, setSearch] = useState('');
  const [cupomFiltro, setCupomFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [qrCodeSelecionado, setQrCodeSelecionado] = useState<QRCodeItem | null>(null);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const [gerandoQr, setGerandoQr] = useState(false);
  const [quantidadeGerar, setQuantidadeGerar] = useState('100');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const cuponsData = await cupomService.listarMeusCupons();
      setCupons(cuponsData);

      const qrCodesData = await qrCodeService.listarQrCodesLoja();
      setQrCodes(qrCodesData);

    } catch (error) {
      toast.error('Erro ao carregar QR codes');
    } finally {
      setLoading(false);
    }
  };

  const gerarQrCodes = async () => {
    if (!cupomFiltro || cupomFiltro === 'todos') {
      toast.error('Selecione um cupom para gerar QR codes');
      return;
    }

    const quantidade = parseInt(quantidadeGerar);
    if (isNaN(quantidade) || quantidade <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    if (quantidade > 10000) {
      const confirmar = confirm('Você está gerando muitos QR codes (mais de 10.000). Continuar?');
      if (!confirmar) return;
    }

    try {
      setGerandoQr(true);
      await cupomService.gerarQrCodes(cupomFiltro, quantidade);
      toast.success(`${quantidade} QR codes gerados com sucesso!`);
      carregarDados();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar QR codes');
    } finally {
      setGerandoQr(false);
    }
  };

  const visualizarQrCode = async (qrCode: QRCodeItem) => {
    try {
      const imagem = await QRCode.toDataURL(qrCode.codigo);
      setQrCodeSelecionado(qrCode);
      setImagemSelecionada(imagem);
    } catch (error) {
      toast.error('Erro ao gerar imagem do QR code');
    }
  };

  const fecharDialog = () => {
    setQrCodeSelecionado(null);
    setImagemSelecionada(null);
  };

  const downloadQrCode = async (qrCode: QRCodeItem) => {
    try {
      const imagem = await QRCode.toDataURL(qrCode.codigo);
      const link = document.createElement('a');
      link.href = imagem;
      link.download = `qrcode-${qrCode.cupomCodigo}-${qrCode.id}.png`;
      link.click();
    } catch (error) {
      toast.error('Erro ao baixar QR code');
    }
  };

  const imprimirQrCode = (qrCode: QRCodeItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up bloqueado. Permita pop-ups para imprimir.');
      return;
    }

    QRCode.toDataURL(qrCode.codigo).then((imagem) => {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${qrCode.cupomCodigo}</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
                padding: 20px;
              }
              img {
                width: 250px;
                height: 250px;
                max-width: 80vw;
                max-height: 80vw;
              }
              h2 {
                margin: 10px 0;
                color: #333;
                font-size: clamp(16px, 4vw, 24px);
              }
              p {
                color: #666;
                margin: 5px 0;
                font-size: clamp(12px, 3vw, 14px);
              }
              .info {
                margin-top: 20px;
                font-size: clamp(10px, 2.5vw, 12px);
                color: #999;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${imagem}" alt="QR Code" />
              <h2>${qrCode.cupomDescricao}</h2>
              <p>Código: ${qrCode.cupomCodigo}</p>
              <p>Gerado em: ${new Date(qrCode.usadoEm).toLocaleString()}</p>
              ${qrCode.cliente ? `<p>Cliente: ${qrCode.cliente.nome}</p>` : ''}
              <div class="info">
                <p>Status: ${qrCode.validado ? 'Validado' : 'Pendente'}</p>
                ${qrCode.validadoEm ? `<p>Validado em: ${new Date(qrCode.validadoEm).toLocaleString()}</p>` : ''}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    });
  };

  const filtrarQrCodes = () => {
    return qrCodes.filter(qr => {
      const matchesSearch = search === '' || 
        qr.cupomCodigo.toLowerCase().includes(search.toLowerCase()) ||
        qr.cupomDescricao.toLowerCase().includes(search.toLowerCase()) ||
        qr.codigo.includes(search) ||
        qr.cliente?.nome.toLowerCase().includes(search.toLowerCase());

      const matchesCupom = cupomFiltro === 'todos' || qr.cupomId === cupomFiltro;
      const matchesStatus = statusFiltro === 'todos' ||
        (statusFiltro === 'validado' && qr.validado) ||
        (statusFiltro === 'pendente' && !qr.validado);

      return matchesSearch && matchesCupom && matchesStatus;
    });
  };

  const getStatusBadge = (validado: boolean) => {
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

  const qrCodesFiltrados = filtrarQrCodes();

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              QR Codes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie os QR codes dos seus cupons
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Total de QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{qrCodes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Validados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                {qrCodes.filter(q => q.validado).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
                {qrCodes.filter(q => !q.validado).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de filtros mobile */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full h-9 text-xs sm:text-sm"
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {mobileFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {/* Ações e Filtros */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Gerenciar QR Codes</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gere novos QR codes ou filtre os existentes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
            {/* Área de geração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Gerar QR Codes para</Label>
                <Select value={cupomFiltro} onValueChange={setCupomFiltro}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione um cupom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos" className="text-xs sm:text-sm">Todos os cupons</SelectItem>
                    {cupons.map((cupom) => (
                      <SelectItem key={cupom.id} value={cupom.id} className="text-xs sm:text-sm">
                        {cupom.codigo} - {cupom.descricao.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidadeGerar}
                  onChange={(e) => setQuantidadeGerar(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={gerarQrCodes}
                  disabled={gerandoQr}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600"
                >
                  {gerandoQr ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Gerar QR Codes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Filtros - visíveis sempre no desktop, condicional no mobile */}
            <div className={cn(
              "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t",
              !mobileFiltersOpen && 'hidden lg:grid'
            )}>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-7 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Filtrar por Cupom</Label>
                <Select value={cupomFiltro} onValueChange={setCupomFiltro}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos" className="text-xs sm:text-sm">Todos</SelectItem>
                    {cupons.map((cupom) => (
                      <SelectItem key={cupom.id} value={cupom.id} className="text-xs sm:text-sm">
                        {cupom.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Filtrar por Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos" className="text-xs sm:text-sm">Todos</SelectItem>
                    <SelectItem value="validado" className="text-xs sm:text-sm">Validados</SelectItem>
                    <SelectItem value="pendente" className="text-xs sm:text-sm">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de QR Codes - versão desktop */}
        <Card className="hidden lg:block">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Cupom</TableHead>
                  <TableHead className="text-xs">Código QR</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Geração</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Validação</TableHead>
                  <TableHead className="w-[100px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : qrCodesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <QrCode className="h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-500">Nenhum QR code encontrado</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/dashboard-loja/cupons/novo')}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar cupom
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  qrCodesFiltrados.map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="text-xs font-medium truncate">{qr.cupomCodigo}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {qr.cupomDescricao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] bg-gray-100 p-1 rounded">
                          {qr.codigo.substring(0, 15)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        {qr.cliente ? (
                          <div className="max-w-[120px]">
                            <p className="text-xs truncate">{qr.cliente.nome}</p>
                            <p className="text-[10px] text-gray-500 truncate">{qr.cliente.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs whitespace-nowrap">
                          {new Date(qr.usadoEm).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(qr.validado)}</TableCell>
                      <TableCell>
                        {qr.validadoEm ? (
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(qr.validadoEm).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => visualizarQrCode(qr)}
                            className="h-7 w-7"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadQrCode(qr)}
                            className="h-7 w-7"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => imprimirQrCode(qr)}
                            className="h-7 w-7"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
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
          {loading ? (
            <div className="col-span-full text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
            </div>
          ) : qrCodesFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhum QR code encontrado</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard-loja/cupons/novo')}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar cupom
              </Button>
            </div>
          ) : (
            qrCodesFiltrados.map((qr) => (
              <Card key={qr.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-medium truncate">
                          {qr.cupomCodigo}
                        </h3>
                        {getStatusBadge(qr.validado)}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-1">
                        {qr.cupomDescricao}
                      </p>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => visualizarQrCode(qr)}
                        className="h-7 w-7"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Informações do card */}
                  <div className="space-y-2 text-[10px] sm:text-xs">
                    <div>
                      <span className="text-gray-400">Código:</span>
                      <code className="ml-1 text-[8px] sm:text-[10px] bg-gray-100 p-1 rounded">
                        {qr.codigo.substring(0, 20)}...
                      </code>
                    </div>

                    {qr.cliente && (
                      <div>
                        <span className="text-gray-400">Cliente:</span>
                        <span className="ml-1 truncate block sm:inline">
                          {qr.cliente.nome}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block">Geração</span>
                        <span>{new Date(qr.usadoEm).toLocaleDateString()}</span>
                      </div>
                      {qr.validadoEm && (
                        <div>
                          <span className="text-gray-400 block">Validação</span>
                          <span>{new Date(qr.validadoEm).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações do card */}
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQrCode(qr)}
                      className="flex-1 h-7 text-[10px] sm:text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => imprimirQrCode(qr)}
                      className="flex-1 h-7 text-[10px] sm:text-xs"
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Imprimir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de visualização do QR code */}
        <Dialog open={!!qrCodeSelecionado} onOpenChange={fecharDialog}>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">
                QR Code - {qrCodeSelecionado?.cupomCodigo}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {qrCodeSelecionado?.cupomDescricao}
              </DialogDescription>
            </DialogHeader>
            {qrCodeSelecionado && imagemSelecionada && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                  <Image
                    src={imagemSelecionada}
                    alt="QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="w-full space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(qrCodeSelecionado.validado)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gerado em:</span>
                    <span>{new Date(qrCodeSelecionado.usadoEm).toLocaleString()}</span>
                  </div>
                  {qrCodeSelecionado.validadoEm && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Validado em:</span>
                      <span>{new Date(qrCodeSelecionado.validadoEm).toLocaleString()}</span>
                    </div>
                  )}
                  {qrCodeSelecionado.cliente && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cliente:</span>
                      <span className="truncate max-w-[200px]">{qrCodeSelecionado.cliente.nome}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => downloadQrCode(qrCodeSelecionado)}
                    className="flex-1 h-8 text-xs sm:text-sm"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => imprimirQrCode(qrCodeSelecionado)}
                    className="flex-1 h-8 text-xs sm:text-sm"
                  >
                    <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn("text-xs sm:text-sm font-medium text-gray-700", className)} {...props}>
      {children}
    </label>
  );
}