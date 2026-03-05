'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QrCode, Loader2, Search, Filter, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import cupomService, { Cupom } from '@/services/cupom';
import qrCodeService, { QRCodeItem } from '@/services/qrcode';

export default function GerenciarQrCodesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [cupomFiltro, setCupomFiltro] = useState('todos');
  const [quantidadeGerar, setQuantidadeGerar] = useState('100');
  const [gerandoQr, setGerandoQr] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const cuponsData = await cupomService.getMyStore();
      setCupons(cuponsData);
      const qrCodesData = await qrCodeService.listarQrCodesLoja();
      setQrCodes(qrCodesData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
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
      await cupomService.generateQrCodes(cupomFiltro, quantidade);
      toast.success(`${quantidade} QR codes gerados com sucesso!`);
      carregarDados();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar QR codes');
    } finally {
      setGerandoQr(false);
    }
  };

  const totalQrCodes = qrCodes.length;
  const totalValidados = qrCodes.filter(q => q.validado).length;
  const totalPendentes = qrCodes.filter(q => !q.validado).length;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4 border-4 border-orange-200 border-t-orange-600 rounded-full" />
            <p className="text-sm text-gray-500">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0 max-w-7xl mx-auto">
        {/* Cabeçalho com botão voltar */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Gerenciar QR Codes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gere novos QR codes ou filtre os existentes
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
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{totalQrCodes}</div>
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
                {totalValidados}
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
                {totalPendentes}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de filtros mobile */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full h-9 text-xs sm:text-sm"
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {mobileFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {/* Card principal - Gerenciar QR Codes */}
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
                    <SelectItem value="todos" className="text-xs sm:text-sm">Selecione um cupom</SelectItem>
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

             
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}