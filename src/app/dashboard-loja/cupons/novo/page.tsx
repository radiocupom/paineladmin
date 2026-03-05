'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, QrCode, Save, X, Loader2, DollarSign, ShoppingBag, Percent, Store } from 'lucide-react';
import { toast } from 'sonner';
import cupomService from '@/services/cupom';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

export default function NovoCupomLojaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Estados para os campos
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidadePorCliente, setQuantidadePorCliente] = useState('1');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [quantidadeQrCodes, setQuantidadeQrCodes] = useState('1000');
  
  // 🔥 NOVOS CAMPOS DE PREÇO
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [precoComDesconto, setPrecoComDesconto] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!codigo || !descricao || !quantidadePorCliente || !dataExpiracao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar data de expiração
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataExp = new Date(dataExpiracao);
    dataExp.setHours(0, 0, 0, 0);
    
    if (dataExp <= hoje) {
      toast.error('A data de expiração deve ser futura');
      return;
    }

    // Validar quantidade de QR codes
    const qrCount = parseInt(quantidadeQrCodes);
    if (isNaN(qrCount) || qrCount < 1) {
      toast.error('Quantidade de QR codes inválida');
      return;
    }

    // Validar campos de preço
    if (precoOriginal && parseFloat(precoOriginal) <= 0) {
      toast.error('Preço original deve ser maior que zero');
      return;
    }

    if (precoComDesconto && parseFloat(precoComDesconto) <= 0) {
      toast.error('Preço com desconto deve ser maior que zero');
      return;
    }

    if (percentualDesconto) {
      const percentual = parseInt(percentualDesconto);
      if (percentual < 0 || percentual > 100) {
        toast.error('Percentual de desconto deve estar entre 0 e 100');
        return;
      }
    }

    try {
      setLoading(true);

      const dadosParaEnviar = {
        codigo,
        descricao,
        quantidadePorCliente: parseInt(quantidadePorCliente),
        dataExpiracao,
        lojaId: user?.lojaId || '',
        quantidadeQrCodes: qrCount,
        logo: logoFile || undefined,
        
        // 🔥 CAMPOS DE PREÇO
        nomeProduto: nomeProduto || undefined,
        precoOriginal: precoOriginal ? parseFloat(precoOriginal) : undefined,
        precoComDesconto: precoComDesconto ? parseFloat(precoComDesconto) : undefined,
        percentualDesconto: percentualDesconto ? parseInt(percentualDesconto) : undefined,
      };

      await cupomService.create(dadosParaEnviar);
      toast.success('Cupom criado com sucesso!');
      router.push('/dashboard-loja/cupons');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  // Formatar preço para exibição
  const formatarPreco = (valor: string) => {
    if (!valor) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(valor));
  };

  return (
    <ProtectedRoute allowedRoles={['loja']}>
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
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Novo Cupom
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Crie um novo cupom para sua loja
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Informações Básicas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Dados principais do cupom
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Código */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="codigo" className="text-xs sm:text-sm">
                    Código do Cupom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ex: DESCONTO20"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="descricao" className="text-xs sm:text-sm">
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: 20% OFF em todas as compras"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Quantidade por Cliente */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="quantidadePorCliente" className="text-xs sm:text-sm">
                    Resgates por Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantidadePorCliente"
                    type="number"
                    min="1"
                    value={quantidadePorCliente}
                    onChange={(e) => setQuantidadePorCliente(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Data de Expiração */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="dataExpiracao" className="text-xs sm:text-sm">
                    Data de Expiração <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dataExpiracao"
                    type="date"
                    value={dataExpiracao}
                    onChange={(e) => setDataExpiracao(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Quantidade de QR Codes */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="quantidadeQrCodes" className="text-xs sm:text-sm">
                    <QrCode className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    QR Codes Iniciais <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantidadeQrCodes"
                    type="number"
                    min="1"
                    value={quantidadeQrCodes}
                    onChange={(e) => setQuantidadeQrCodes(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    required
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
                      Escolher arquivo
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
                          <Image
                            src={logoPreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          Logo selecionada
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔥 CARD DE PREÇOS */}
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                Informações de Produto e Preço
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Preencha os dados do produto (opcional). Os valores são calculados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Nome do Produto */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="nomeProduto" className="text-xs sm:text-sm flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Nome do Produto
                  </Label>
                  <Input
                    id="nomeProduto"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    placeholder="Ex: Açaí 500ml, Camisa Preta"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Preço Original */}
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

                {/* Percentual de Desconto */}
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

                {/* Preço com Desconto */}
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

                {/* Preview dos preços */}
                {(precoOriginal || precoComDesconto || percentualDesconto) && (
                  <div className="sm:col-span-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-xs sm:text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 mt-4 border-t">
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
              type="submit"
              className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Criar Cupom
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}