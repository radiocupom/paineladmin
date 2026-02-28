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
import { getImageUrl } from '@/lib/image-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Upload, Save, X, DollarSign, ShoppingBag, Percent } from 'lucide-react';
import { toast } from 'sonner';
import cupomService, { Cupom } from '@/services/cupom';
import { useAuth } from '@/hooks/useAuth';

export default function EditarCupomPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Estados para os campos existentes
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidadePorCliente, setQuantidadePorCliente] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');

  // 🔥 NOVOS ESTADOS PARA PREÇOS
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [precoComDesconto, setPrecoComDesconto] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');

  const id = params.id as string;

  useEffect(() => {
    const carregarCupom = async () => {
      try {
        setInitialLoading(true);
        const data = await cupomService.buscarPorId(id);
        setCupom(data);
      
        
        // Preencher estados existentes
        setCodigo(data.codigo);
        setDescricao(data.descricao);
        setQuantidadePorCliente(String(data.quantidadePorCliente));
        setDataExpiracao(data.dataExpiracao.split('T')[0]);
        
        // 🔥 Preencher novos campos
        setNomeProduto(data.nomeProduto || '');
        setPrecoOriginal(data.precoOriginal ? String(data.precoOriginal) : '');
        setPrecoComDesconto(data.precoComDesconto ? String(data.precoComDesconto) : '');
        setPercentualDesconto(data.percentualDesconto ? String(data.percentualDesconto) : '');
        
      } catch (error) {
        toast.error('Erro ao carregar cupom');
        router.push('/dashboard/cupons');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      carregarCupom();
    }
  }, [id, router]);

  // 🔥 FUNÇÃO ÚNICA PARA ATUALIZAR PREÇOS
  const atualizarPrecos = (origem: string, valor: string) => {
    const original = parseFloat(precoOriginal);
    const comDesconto = parseFloat(precoComDesconto);
    const percentual = parseFloat(percentualDesconto);

    // Se mudou preço original ou percentual, recalcula preço com desconto
    if ((origem === 'precoOriginal' || origem === 'percentualDesconto') && 
        !isNaN(original) && !isNaN(percentual) && original > 0 && percentual >= 0 && percentual <= 100) {
      const calculado = original - (original * (percentual / 100));
      setPrecoComDesconto(calculado.toFixed(2));
    }

    // Se mudou preço original ou preço com desconto, recalcula percentual
    if ((origem === 'precoOriginal' || origem === 'precoComDesconto') && 
        !isNaN(original) && !isNaN(comDesconto) && original > 0 && comDesconto >= 0 && comDesconto <= original) {
      const novoPercentual = ((original - comDesconto) / original) * 100;
      setPercentualDesconto(novoPercentual.toFixed(0));
    }
  };

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
    
    // 🔥 NOVOS CAMPOS
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
      router.push('/dashboard/cupons');
      return;
    }

    try {
      setLoading(true);
      await cupomService.atualizar(id, dadosAtualizar);
      toast.success('Cupom atualizado com sucesso!');
      router.push('/dashboard/cupons');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar cupom');
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
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando cupom...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cupom) {
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
              Editar Cupom
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Editando: {cupom.codigo}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Cupom</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Altere os dados do cupom, incluindo preços e produto
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
                    onChange={(e) => setCodigo(e.target.value)}
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
                    placeholder="Ex: Açaí 500ml, Camisa Preta, etc"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* PREÇO ORIGINAL */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="precoOriginal" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Preço Original (opcional)
                  </Label>
                  <Input
                    id="precoOriginal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoOriginal}
                    onChange={(e) => {
                      setPrecoOriginal(e.target.value);
                      atualizarPrecos('precoOriginal', e.target.value);
                    }}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* PREÇO COM DESCONTO */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="precoComDesconto" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Preço com Desconto (opcional)
                  </Label>
                  <Input
                    id="precoComDesconto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoComDesconto}
                    onChange={(e) => {
                      setPrecoComDesconto(e.target.value);
                      atualizarPrecos('precoComDesconto', e.target.value);
                    }}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* PERCENTUAL DE DESCONTO */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="percentualDesconto" className="text-xs sm:text-sm flex items-center gap-1">
                    <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Percentual de Desconto (opcional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentualDesconto"
                      type="number"
                      min="0"
                      max="100"
                      value={percentualDesconto}
                      onChange={(e) => {
                        setPercentualDesconto(e.target.value);
                        atualizarPrecos('percentualDesconto', e.target.value);
                      }}
                      placeholder="20"
                      className="h-8 sm:h-10 text-xs sm:text-sm flex-1"
                    />
                    <span className="text-xs sm:text-sm text-gray-500">%</span>
                  </div>
                </div>

                {/* Quantidade por Cliente */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="quantidadePorCliente" className="text-xs sm:text-sm">
                    Resgates por Cliente
                  </Label>
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
      {logoFile ? 'Trocar logo' : 'Escolher logo'}
    </Button>
    <Input
      id="logo-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleLogoChange}
    />
    
    {/* 🔥 LOGO ATUAL (mesmo padrão do arquivo funcional) */}
    {cupom?.logo && !logoFile && (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border bg-gray-100">
          <img
            src={`https://api.radiocupom.online/uploads/${cupom.logo.split('\\').pop()?.split('/').pop()}`}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500">
          Logo atual
        </span>
      </div>
    )}

    {/* 🔥 PREVIEW DA NOVA LOGO (se houver upload) */}
    {logoFile && logoPreview && (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border bg-gray-100">
          <img
            src={logoPreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500">
          Nova logo
        </span>
      </div>
    )}
  </div>
</div>
              </div>

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
                      Salvar Cupom
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