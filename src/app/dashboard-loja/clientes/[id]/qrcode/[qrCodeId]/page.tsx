// app/dashboard-loja/clientes/[id]/qrcode/[qrCodeId]/page.jsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
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
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  QrCode as QrCodeIcon,
  DollarSign,
  Gift,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Store,
  Download,
  Printer,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import clienteService, { QrCodeLoja } from '@/services/cliente';
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

export default function DetalhesQrCodePage({ 
  params 
}: { 
  params: Promise<{ id: string; qrCodeId: string }> 
}) {
  const { id, qrCodeId } = React.use(params);
  
  const router = useRouter();
  const { user } = useAuth() as { user: Usuario | null };
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<QrCodeLoja | null>(null);
  const [copiando, setCopiando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const qrContainerRef = useRef<HTMLDivElement>(null);

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

      console.log('🏪 Buscando QR code:', { lojaId, clienteId: id, qrCodeId });
      
      // Buscar todos os resgates da loja e encontrar o QR code
      const resgatesResponse = await clienteService.listarResgatesDaLoja(lojaId, 1, 50);
      
      let qrCodeEncontrado: QrCodeLoja | null = null;
      
      // Procurar o QR code em todos os resgates
      for (const resgate of resgatesResponse.resgates) {
        if (resgate.cliente?.id === id && resgate.qrCodes) {
          const qr = resgate.qrCodes.find(q => q.id === qrCodeId);
          if (qr) {
            qrCodeEncontrado = {
              ...qr,
              cupomId: resgate.cupom.id,
              cupom: resgate.cupom,
              cliente: resgate.cliente
            };
            break;
          }
        }
      }

      if (!qrCodeEncontrado) {
        console.error('❌ QR code não encontrado');
        toast.error('QR code não encontrado');
        router.push(`/dashboard-loja/clientes/${id}`);
        return;
      }

      console.log('📦 QR code encontrado:', qrCodeEncontrado);
      setQrCode(qrCodeEncontrado);
      
      // Resetar erro de logo quando carregar novo QR code
      setLogoError(false);

    } catch (error: any) {
      console.error('❌ Erro ao carregar QR code:', error);
      toast.error('Erro ao carregar dados do QR code');
      router.push(`/dashboard-loja/clientes/${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id, qrCodeId]);

  const handleCopiarCodigo = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode.codigo);
      setCopiando(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopiando(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    if (!qrContainerRef.current || !qrCode) return;
    
    try {
      setBaixando(true);
      
      // Converter o elemento para PNG
      const dataUrl = await toPng(qrContainerRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      // Criar link de download
      const link = document.createElement('a');
      link.download = `qrcode-${qrCode.cupom.codigo}-${qrCode.cliente.nome}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('QR code baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar QR code:', error);
      toast.error('Erro ao baixar QR code');
    } finally {
      setBaixando(false);
    }
  };

  const handlePrintQR = () => {
    if (!qrContainerRef.current || !qrCode) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Permita pop-ups para imprimir');
      return;
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>QR Code - ${qrCode.cupom.codigo}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin-bottom: 20px;
            }
            .info {
              margin-top: 20px;
            }
            .codigo {
              font-family: monospace;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-container">
              ${qrContainerRef.current.innerHTML}
            </div>
            <div class="info">
              <p><strong>${qrCode.cupom.codigo}</strong></p>
              <p>${qrCode.cupom.descricao}</p>
              <p class="codigo">${qrCode.codigo}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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

  // 🔥 FUNÇÃO PARA VERIFICAR SE A URL É VÁLIDA
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading || !qrCode) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando detalhes do QR code...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do QR Code</h1>
            <p className="text-gray-500 mt-1">
              Informações completas do código e seu status
            </p>
          </div>
        </div>

        {/* Card Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-orange-500" />
              Código: {qrCode.codigo}
            </CardTitle>
            <CardDescription>
              Status: {qrCode.validado ? 'Validado' : 'Pendente'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 🔥 SEÇÃO DO QR CODE VISUAL */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
              <div 
                ref={qrContainerRef}
                className="p-4 bg-white rounded-lg shadow-sm"
              >
                <QRCode
                  value={qrCode.codigo}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#f97316"
                />
                {/* 🔥 VERIFICAÇÃO DA URL ANTES DE RENDERIZAR */}
                {qrCode.cupom.logo && isValidUrl(qrCode.cupom.logo) && !logoError ? (
                  <div className="mt-2 flex justify-center">
                    <div className="w-10 h-10 relative">
                      <Image 
                        src={qrCode.cupom.logo}
                        alt="Logo da loja"
                        fill
                        className="object-contain"
                        onError={() => setLogoError(true)}
                        unoptimized={true} // Para URLs externas
                      />
                    </div>
                  </div>
                ) : qrCode.cupom.logo && !isValidUrl(qrCode.cupom.logo) ? (
                  // 🔥 FALLBACK PARA URL INVÁLIDA - Mostra iniciais da loja
                  <div className="mt-2 flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {qrCode.cupom.codigo?.substring(0, 2) || 'LO'}
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Ações do QR code */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarCodigo}
                  className="gap-2"
                >
                  {copiando ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiando ? 'Copiado!' : 'Copiar código'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQR}
                  disabled={baixando}
                  className="gap-2"
                >
                  {baixando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {baixando ? 'Baixando...' : 'Baixar imagem'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintQR}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>

            {/* Informações em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Status e Datas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {qrCode.validado ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-sm px-3 py-1">
                        <Clock className="h-4 w-4 mr-2" />
                        Pendente
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Data de uso:</span>
                      <span className="font-medium">{formatarDataHora(qrCode.usadoEm)}</span>
                    </div>

                    {qrCode.validadoEm && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Data de validação:</span>
                        <span className="font-medium text-green-600">
                          {formatarDataHora(qrCode.validadoEm)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Valores */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Valores</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço original:</span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatarMoeda(qrCode.cupom.precoOriginal || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço com desconto:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatarMoeda(qrCode.cupom.precoComDesconto || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Economia:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatarMoeda(
                        (qrCode.cupom.precoOriginal || 0) - (qrCode.cupom.precoComDesconto || 0)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Desconto:</span>
                    <span>{qrCode.cupom.percentualDesconto}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha separadora */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Informações do Cliente e Cupom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Cliente</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-orange-100">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                      {qrCode.cliente.nome?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{qrCode.cliente.nome}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {qrCode.cliente.email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {qrCode.cliente.whatsapp}
                    </p>
                  </div>
                </div>
                <Link 
                  href={`/dashboard-loja/clientes/${qrCode.cliente.id}`}
                  className="text-sm text-orange-600 hover:text-orange-700 mt-3 inline-block"
                >
                  Ver perfil completo →
                </Link>
              </div>

              {/* Cupom */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Cupom</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-500" />
                    <span className="font-mono font-bold">{qrCode.cupom.codigo}</span>
                  </div>
                  <p className="text-sm text-gray-600">{qrCode.cupom.descricao}</p>
                  {qrCode.cupom.nomeProduto && (
                    <p className="text-sm text-gray-500">
                      Produto: {qrCode.cupom.nomeProduto}
                    </p>
                  )}
                </div>
                <Link 
                  href={`/dashboard-loja/cupons/${qrCode.cupom.id}`}
                  className="text-sm text-orange-600 hover:text-orange-700 mt-3 inline-block"
                >
                  Ver detalhes do cupom →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão voltar */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full max-w-xs"
          >
            Voltar
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}