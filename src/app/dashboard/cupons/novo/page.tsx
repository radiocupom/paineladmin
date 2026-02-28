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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, QrCode, Save, X, Loader2, DollarSign, ShoppingBag, Percent } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import cupomService from '@/services/cupom';
import lojaService, { Loja } from '@/services/loja';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

const novoCupomSchema = z.object({
  codigo: z.string().min(3, 'Código deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  quantidadePorCliente: z.string().min(1, 'Quantidade é obrigatória'),
  dataExpiracao: z.string().min(1, 'Data de expiração é obrigatória'),
  lojaId: z.string().min(1, 'Loja é obrigatória'),
  quantidadeQrCodes: z.string().optional(),
  
  // 🔥 NOVOS CAMPOS DE PREÇO (OPCIONAIS)
  nomeProduto: z.string().optional(),
  precoOriginal: z.string().optional(),
  precoComDesconto: z.string().optional(),
  percentualDesconto: z.string().optional(),
});

type NovoCupomForm = z.infer<typeof novoCupomSchema>;

export default function NovoCupomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // 🔥 ESTADOS PARA OS CAMPOS DE PREÇO
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [precoComDesconto, setPrecoComDesconto] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NovoCupomForm>({
    resolver: zodResolver(novoCupomSchema),
    defaultValues: {
      quantidadeQrCodes: '1000',
    },
  });

  // 🔥 CALCULAR PREÇO COM DESCONTO BASEADO NO PERCENTUAL
  useEffect(() => {
    if (precoOriginal && percentualDesconto) {
      const original = parseFloat(precoOriginal);
      const percentual = parseFloat(percentualDesconto);
      
      if (!isNaN(original) && !isNaN(percentual) && original > 0 && percentual >= 0 && percentual <= 100) {
        const calculado = original - (original * (percentual / 100));
        setPrecoComDesconto(calculado.toFixed(2));
        setValue('precoComDesconto', calculado.toFixed(2));
      }
    }
  }, [precoOriginal, percentualDesconto, setValue]);

  // 🔥 CALCULAR PERCENTUAL BASEADO NO PREÇO COM DESCONTO
  useEffect(() => {
    if (precoOriginal && precoComDesconto) {
      const original = parseFloat(precoOriginal);
      const comDesconto = parseFloat(precoComDesconto);
      
      if (!isNaN(original) && !isNaN(comDesconto) && original > 0 && comDesconto >= 0 && comDesconto <= original) {
        const percentual = ((original - comDesconto) / original) * 100;
        setPercentualDesconto(percentual.toFixed(0));
        setValue('percentualDesconto', percentual.toFixed(0));
      }
    }
  }, [precoOriginal, precoComDesconto, setValue]);

  // 🔥 CALCULAR PREÇO ORIGINAL BASEADO NO PERCENTUAL E PREÇO COM DESCONTO
  useEffect(() => {
    if (percentualDesconto && precoComDesconto && !precoOriginal) {
      const percentual = parseFloat(percentualDesconto);
      const comDesconto = parseFloat(precoComDesconto);
      
      if (!isNaN(percentual) && !isNaN(comDesconto) && percentual >= 0 && percentual < 100) {
        const original = comDesconto / (1 - (percentual / 100));
        setPrecoOriginal(original.toFixed(2));
        setValue('precoOriginal', original.toFixed(2));
      }
    }
  }, [percentualDesconto, precoComDesconto, precoOriginal, setValue]);

  useEffect(() => {
    carregarLojas();
  }, []);

  const carregarLojas = async () => {
    try {
      const data = await lojaService.listarTodas();
      setLojas(data);
    } catch (error) {
      toast.error('Erro ao carregar lojas');
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

  const onSubmit = async (data: NovoCupomForm) => {
    try {
      setLoading(true);
      
      // Validar data de expiração
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataExpiracao = new Date(data.dataExpiracao);
      dataExpiracao.setHours(0, 0, 0, 0);
      
      if (dataExpiracao <= hoje) {
        toast.error('A data de expiração deve ser futura');
        setLoading(false);
        return;
      }

      // 🔥 VALIDAR CAMPOS DE PREÇO
      if (data.precoOriginal && parseFloat(data.precoOriginal) <= 0) {
        toast.error('Preço original deve ser maior que zero');
        setLoading(false);
        return;
      }

      if (data.precoComDesconto && parseFloat(data.precoComDesconto) <= 0) {
        toast.error('Preço com desconto deve ser maior que zero');
        setLoading(false);
        return;
      }

      if (data.percentualDesconto) {
        const percentual = parseInt(data.percentualDesconto);
        if (percentual < 0 || percentual > 100) {
          toast.error('Percentual de desconto deve estar entre 0 e 100');
          setLoading(false);
          return;
        }
      }

      const dadosParaEnviar = {
        codigo: data.codigo,
        descricao: data.descricao,
        quantidadePorCliente: parseInt(data.quantidadePorCliente),
        dataExpiracao: data.dataExpiracao,
        lojaId: data.lojaId,
        quantidadeQrCodes: data.quantidadeQrCodes ? parseInt(data.quantidadeQrCodes) : 1000,
        logo: logoFile || undefined,
        
        // 🔥 NOVOS CAMPOS DE PREÇO
        nomeProduto: data.nomeProduto || undefined,
        precoOriginal: data.precoOriginal ? parseFloat(data.precoOriginal) : undefined,
        precoComDesconto: data.precoComDesconto ? parseFloat(data.precoComDesconto) : undefined,
        percentualDesconto: data.percentualDesconto ? parseInt(data.percentualDesconto) : undefined,
      };
      
      console.log('📤 Enviando cupom:', dadosParaEnviar);
      
      await cupomService.criar(dadosParaEnviar);
      toast.success('Cupom criado com sucesso!');
      router.push('/dashboard/cupons');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

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
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Novo Cupom
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Cadastre um novo cupom no sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Cupom</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha os dados para criar um novo cupom, incluindo informações de produto e preços
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Código */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="codigo" className="text-xs sm:text-sm">
                    Código do Cupom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    placeholder="Ex: DESCONTO20"
                    {...register('codigo')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.codigo && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.codigo.message}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="descricao" className="text-xs sm:text-sm">
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="descricao"
                    placeholder="Ex: 20% OFF em todas as compras"
                    {...register('descricao')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.descricao && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.descricao.message}</p>
                  )}
                </div>

                {/* 🔥 NOME DO PRODUTO */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="nomeProduto" className="text-xs sm:text-sm flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Nome do Produto (opcional)
                  </Label>
                  <Input
                    id="nomeProduto"
                    placeholder="Ex: Açaí 500ml, Camisa Preta"
                    {...register('nomeProduto')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
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
                    placeholder="Ex: 1"
                    {...register('quantidadePorCliente')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.quantidadePorCliente && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.quantidadePorCliente.message}</p>
                  )}
                </div>

                {/* Data de Expiração */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="dataExpiracao" className="text-xs sm:text-sm">
                    Data de Expiração <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dataExpiracao"
                    type="date"
                    {...register('dataExpiracao')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.dataExpiracao && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.dataExpiracao.message}</p>
                  )}
                </div>

                {/* 🔥 PREÇO ORIGINAL */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="precoOriginal" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    Preço Original (opcional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">R$</span>
                    <Input
                      id="precoOriginal"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={precoOriginal}
                      onChange={(e) => setPrecoOriginal(e.target.value)}
                      className="h-8 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </div>

                {/* 🔥 PREÇO COM DESCONTO */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="precoComDesconto" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Preço com Desconto (opcional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">R$</span>
                    <Input
                      id="precoComDesconto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={precoComDesconto}
                      onChange={(e) => setPrecoComDesconto(e.target.value)}
                      className="h-8 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </div>

                {/* 🔥 PERCENTUAL DE DESCONTO */}
                <div className="space-y-1 sm:space-y-2">
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
                      placeholder="20"
                      value={percentualDesconto}
                      onChange={(e) => setPercentualDesconto(e.target.value)}
                      className="h-8 sm:h-10 text-xs sm:text-sm flex-1"
                    />
                    <span className="text-xs sm:text-sm text-gray-500">%</span>
                  </div>
                </div>

                {/* Loja */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="lojaId" className="text-xs sm:text-sm">
                    Loja <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('lojaId', value)}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Selecione a loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {lojas.map((loja) => (
                        <SelectItem key={loja.id} value={loja.id} className="text-xs sm:text-sm">
                          {loja.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.lojaId && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.lojaId.message}</p>
                  )}
                </div>

                {/* Quantidade de QR Codes */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="quantidadeQrCodes" className="text-xs sm:text-sm">
                    <QrCode className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    QR Codes Iniciais
                  </Label>
                  <Input
                    id="quantidadeQrCodes"
                    type="number"
                    min="1"
                    defaultValue="1000"
                    {...register('quantidadeQrCodes')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Quantidade de QR codes disponíveis inicialmente
                  </p>
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
                  type="submit"
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600"
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
                      Criar Cupom
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}