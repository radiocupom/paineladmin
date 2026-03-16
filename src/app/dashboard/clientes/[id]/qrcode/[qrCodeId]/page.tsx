'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  Phone,
  QrCode as QrCodeIcon,
  Gift,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import clienteService, { QrCodeDetalhado, Cliente } from '@/services/cliente';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DetalhesQrCodeClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params?.id as string;
  const qrCodeId = params?.qrCodeId as string;

  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<QrCodeDetalhado | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [copiando, setCopiando] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      const response = await clienteService.getQrCodesCliente(clienteId, 1, 200);
      const encontrado = response.qrCodes.find(q => q.id === qrCodeId);

      if (!encontrado) {
        toast.error('QR code não encontrado');
        router.push(`/dashboard/clientes/${clienteId}`);
        return;
      }

      const clienteData = await clienteService.buscarPorId(clienteId);

      setQrCode(encontrado);
      setCliente(clienteData);
    } catch {
      toast.error('Erro ao carregar o QR code');
      router.push(`/dashboard/clientes/${clienteId}`);
    } finally {
      setLoading(false);
    }
  }, [clienteId, qrCodeId, router]);

  useEffect(() => {
    if (!clienteId || !qrCodeId) return;
    carregarDados();
  }, [clienteId, qrCodeId, carregarDados]);

  const formatarDataHora = (data: string | null | undefined) => {
    if (!data) return 'N/A';
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const handleCopiarCodigo = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode.codigo);
    setCopiando(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopiando(false), 2000);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando QR code...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!qrCode || !cliente) return null;

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-6 p-4 sm:p-6">
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
              Visualize informações do código e seu status de validação
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCodeIcon className="h-4 w-4" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Código</span>
                <span className="font-mono text-sm text-gray-900">{qrCode.codigo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <Badge className={qrCode.validado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {qrCode.validado ? 'Validado' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Usado em</span>
                <span className="text-sm text-gray-900">{formatarDataHora(qrCode.usadoEm)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Validado em</span>
                <span className="text-sm text-gray-900">{qrCode.validadoEm ? formatarDataHora(qrCode.validadoEm) : '-'}</span>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleCopiarCodigo}>
                  {copiando ? 'Copiado' : 'Copiar código'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">{cliente?.nome?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{cliente?.nome}</p>
                  <p className="text-xs text-gray-500">{cliente?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {cliente?.whatsapp}
              </div>
              <Link
                href={`/dashboard/clientes/${clienteId}`}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Ver perfil completo →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Cupom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Código</span>
                  <span className="text-gray-900">{qrCode.cupom.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Descrição</span>
                  <span className="text-gray-900">{qrCode.cupom.descricao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Preço</span>
                  <span className="text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(qrCode.cupom.precoComDesconto || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
