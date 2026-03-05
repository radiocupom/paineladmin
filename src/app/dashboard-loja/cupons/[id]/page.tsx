'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/image-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  QrCode, 
  Save,
  X,
  Tag,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Percent,
  Power,
  Check,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import cupomService, { Cupom } from '@/services/cupom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function DetalhesCupomPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ativando, setAtivando] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [gerandoQr, setGerandoQr] = useState(false);
  const [cupomAtivo, setCupomAtivo] = useState<boolean>(true);

  // Estados para os campos existentes
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidadePorCliente, setQuantidadePorCliente] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');

  // Estados para preços
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [precoComDesconto, setPrecoComDesconto] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');

  const id = params.id as string;

  useEffect(() => {
    carregarCupom();
  }, [id]);

  const carregarCupom = async () => {
    try {
      setInitialLoading(true);
      const data = await cupomService.getById(id);
      setCupom(data);
      setCupomAtivo(data.ativo);
      setLogoPreview(data.logo || null);
      
      // Preencher estados existentes
      setCodigo(data.codigo);
      setDescricao(data.descricao);
      setQuantidadePorCliente(String(data.quantidadePorCliente));
      setDataExpiracao(data.dataExpiracao.split('T')[0]);
      
      // Preencher novos campos
      setNomeProduto(data.nomeProduto || '');
      setPrecoOriginal(data.precoOriginal ? String(data.precoOriginal) : '');
      setPrecoComDesconto(data.precoComDesconto ? String(data.precoComDesconto) : '');
      setPercentualDesconto(data.percentualDesconto ? String(data.percentualDesconto) : '');
      
    } catch (error) {
      toast.error('Erro ao carregar cupom');
      router.push('/dashboard-loja/cupons');
    } finally {
      setInitialLoading(false);
    }
  };

  // 🔥 FUNÇÕES PARA ATIVAR/DESATIVAR
  const handleAtivar = async () => {
    try {
      setAtivando(true);
      await cupomService.activate(id);
      setCupomAtivo(true);
      toast.success('Cupom ativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao ativar cupom');
    } finally {
      setAtivando(false);
    }
  };

  const handleDesativar = async () => {
    try {
      setAtivando(true);
      await cupomService.deactivate(id);
      setCupomAtivo(false);
      toast.success('Cupom desativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desativar cupom');
    } finally {
      setAtivando(false);
    }
  };

  // 🔥 CALCULAR PREÇO COM DESCONTO BASEADO NO PERCENTUAL
  useEffect(() => {
    if (precoOriginal && percentualDesconto) {
      const original = parseFloat(precoOriginal);
      const percentual = parseFloat(percentualDesconto);
      
      if (!isNaN(original) && !isNaN(percentual) && original > 0 && percentual >= 0 && percentual <= 100) {
        const calculado = original - (original * (percentual / 100));
        setPrecoComDesconto(calculado.toFixed(2));
      }
    }
  }, [precoOriginal, percentualDesconto]);

  // 🔥 CALCULAR PERCENTUAL BASEADO NO PREÇO COM DESCONTO
  useEffect(() => {
    if (precoOriginal && precoComDesconto) {
      const original = parseFloat(precoOriginal);
      const comDesconto = parseFloat(precoComDesconto);
      
      if (!isNaN(original) && !isNaN(comDesconto) && original > 0 && comDesconto >= 0 && comDesconto <= original) {
        const percentual = ((original - comDesconto) / original) * 100;
        setPercentualDesconto(percentual.toFixed(0));
      }
    }
  }, [precoOriginal, precoComDesconto]);

  // 🔥 CALCULAR PREÇO ORIGINAL BASEADO NO PERCENTUAL E PREÇO COM DESCONTO
  useEffect(() => {
    if (percentualDesconto && precoComDesconto && !precoOriginal) {
      const percentual = parseFloat(percentualDesconto);
      const comDesconto = parseFloat(precoComDesconto);
      
      if (!isNaN(percentual) && !isNaN(comDesconto) && percentual >= 0 && percentual < 100) {
        const original = comDesconto / (1 - (percentual / 100));
        setPrecoOriginal(original.toFixed(2));
      }
    }
  }, [percentualDesconto, precoComDesconto]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    const dadosAtualizar: any = {};
    
    // Campos existentes
    if (codigo && codigo !== cupom?.codigo) dadosAtualizar.codigo = codigo;
    if (descricao && descricao !== cupom?.descricao) dadosAtualizar.descricao = descricao;
    if (quantidadePorCliente && parseInt(quantidadePorCliente) !== cupom?.quantidadePorCliente) {
      dadosAtualizar.quantidadePorCliente = parseInt(quantidadePorCliente);
    }
    if (dataExpiracao && dataExpiracao !== cupom?.dataExpiracao.split('T')[0]) {
      dadosAtualizar.dataExpiracao = dataExpiracao;
    }
    
    // Campos de preço
    if (nomeProduto !== cupom?.nomeProduto) {
      dadosAtualizar.nomeProduto = nomeProduto || undefined;
    }
    if (precoOriginal !== String(cupom?.precoOriginal || '')) {
      dadosAtualizar.precoOriginal = precoOriginal ? parseFloat(precoOriginal) : null;
    }
    if (precoComDesconto !== String(cupom?.precoComDesconto || '')) {
      dadosAtualizar.precoComDesconto = precoComDesconto ? parseFloat(precoComDesconto) : null;
    }
    if (percentualDesconto !== String(cupom?.percentualDesconto || '')) {
      dadosAtualizar.percentualDesconto = percentualDesconto ? parseInt(percentualDesconto) : null;
    }
    
    if (logoFile) {
      dadosAtualizar.logo = logoFile;
    }

    if (Object.keys(dadosAtualizar).length === 0) {
      toast.info('Nenhuma alteração detectada');
      return;
    }

    try {
      setLoading(true);
      await cupomService.update(id, dadosAtualizar);
      toast.success('Cupom atualizado com sucesso!');
      router.push('/dashboard-loja/cupons');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarQrCodes = async () => {
    try {
      setGerandoQr(true);
      const quantidade = 100;
      await cupomService.generateQrCodes(id, quantidade);
      toast.success(`${quantidade} QR codes gerados com sucesso!`);
      carregarCupom();
    } catch (error) {
      toast.error('Erro ao gerar QR codes');
    } finally {
      setGerandoQr(false);
    }
  };

  const formatarPreco = (valor?: string) => {
    if (!valor) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(valor));
  };

  const getProgresso = () => {
    if (!cupom) return { porcentagem: 0, disponiveis: 0 };
    const porcentagem = (cupom.qrCodesUsados / cupom.totalQrCodes) * 100;
    const disponiveis = cupom.totalQrCodes - cupom.qrCodesUsados;
    return { 
      porcentagem, 
      disponiveis, 
      usados: cupom.qrCodesUsados, 
      total: cupom.totalQrCodes,
      acabando: disponiveis < 10
    };
  };

  if (initialLoading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando cupom...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cupom) {
    return null;
  }

  const progresso = getProgresso();
  const expirado = new Date(cupom.dataExpiracao) < new Date();

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* ========== CABEÇALHO COM BOTÕES DE ATIVAR/DESATIVAR ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Detalhes do Cupom
                </h1>
                <Badge className={cn(
                  "ml-2 text-xs",
                  cupomAtivo 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  <Power className="h-3 w-3 mr-1" />
                  {cupomAtivo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {cupom.codigo} - {cupom.descricao}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* 🔥 BOTÕES DE ATIVAR/DESATIVAR */}
            {cupomAtivo ? (
              <Button
                onClick={handleDesativar}
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={ativando}
              >
                {ativando ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                )}
                Desativar
              </Button>
            ) : (
              <Button
                onClick={handleAtivar}
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                disabled={ativando}
              >
                {ativando ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                )}
                Ativar
              </Button>
            )}

            <Button
              onClick={handleGerarQrCodes}
              disabled={gerandoQr}
              className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              {gerandoQr ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              )}
              Gerar QR Codes
            </Button>
          </div>
        </div>

        {/* ========== FORMULÁRIO DE EDIÇÃO (APENAS DADOS, SEM STATS) ========== */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-500" />
              Informações do Cupom
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Edite as informações do seu cupom, incluindo produto e preços
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Código */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="codigo" className="text-xs sm:text-sm">Código do Cupom</Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="descricao" className="text-xs sm:text-sm">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* NOME DO PRODUTO */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="nomeProduto" className="text-xs sm:text-sm flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Nome do Produto (opcional)
                  </Label>
                  <Input
                    id="nomeProduto"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    placeholder="Ex: Açaí 500ml, Camisa Preta"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* PREÇO ORIGINAL */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="precoOriginal" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Preço Original
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">R$</span>
                    <Input
                      id="precoOriginal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={precoOriginal}
                      onChange={(e) => setPrecoOriginal(e.target.value)}
                      placeholder="0,00"
                      className="h-8 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </div>

                {/* PERCENTUAL DE DESCONTO */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="percentualDesconto" className="text-xs sm:text-sm flex items-center gap-1">
                    <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    % Desconto
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentualDesconto"
                      type="number"
                      min="0"
                      max="100"
                      value={percentualDesconto}
                      onChange={(e) => setPercentualDesconto(e.target.value)}
                      placeholder="20"
                      className="h-8 sm:h-10 text-xs sm:text-sm flex-1"
                    />
                    <span className="text-xs sm:text-sm text-gray-500">%</span>
                  </div>
                </div>

                {/* PREÇO COM DESCONTO */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="precoComDesconto" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Preço com Desconto (calculado automaticamente)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">R$</span>
                    <Input
                      id="precoComDesconto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={precoComDesconto}
                      onChange={(e) => setPrecoComDesconto(e.target.value)}
                      placeholder="0,00"
                      className="h-8 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </div>

                {/* Quantidade por Cliente */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="quantidadePorCliente" className="text-xs sm:text-sm">Resgates por Cliente</Label>
                  <Input
                    id="quantidadePorCliente"
                    type="number"
                    min="1"
                    value={quantidadePorCliente}
                    onChange={(e) => setQuantidadePorCliente(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Data de Expiração */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="dataExpiracao" className="text-xs sm:text-sm">Data de Expiração</Label>
                  <Input
                    id="dataExpiracao"
                    type="date"
                    value={dataExpiracao}
                    onChange={(e) => setDataExpiracao(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Logo */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="logo" className="text-xs sm:text-sm">Logo do Cupom</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {logoPreview ? 'Trocar logo' : 'Escolher logo'}
                    </Button>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    {logoPreview && (
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border bg-gray-100">
                          <img
                            src={getImageUrl(logoPreview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          Logo atual
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PREVIEW DOS PREÇOS */}
              {(precoOriginal || precoComDesconto || percentualDesconto) && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-xs sm:text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Preview do Produto
                  </h4>
                  <div className="space-y-2">
                    {nomeProduto && (
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Produto:</span> {nomeProduto}
                      </p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {precoOriginal && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatarPreco(precoOriginal)}
                        </span>
                      )}
                      {precoComDesconto && (
                        <span className="text-lg font-bold text-green-600">
                          {formatarPreco(precoComDesconto)}
                        </span>
                      )}
                      {percentualDesconto && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {percentualDesconto}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta de baixa quantidade */}
              {progresso.acabando && !expirado && cupomAtivo && (
                <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-yellow-800">
                      Atenção: QR codes acabando!
                    </h4>
                    <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">
                      Restam apenas {progresso.disponiveis} QR codes disponíveis. 
                      Gere mais para continuar recebendo resgates.
                    </p>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4 border-t">
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
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600"
                  disabled={loading}
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
      </div>
    </ProtectedRoute>
  );
}