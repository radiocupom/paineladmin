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
import { ArrowLeft, Loader2, Upload, Store, User, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import lojaService, { Loja } from '@/services/loja';
import usuarioService from '@/services/usuario';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Schema combinado para loja + usuário
const combinedSchema = z.object({
  // Loja
  nomeLoja: z.string().min(3, 'Nome da loja deve ter no mínimo 3 caracteres').optional(),
  emailLoja: z.string().email('Email da loja inválido').optional(),
  senhaLoja: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  payment: z.boolean().optional(),
  
  // Usuário
  nomeUsuario: z.string().min(3, 'Nome do usuário deve ter no mínimo 3 caracteres').optional(),
  emailUsuario: z.string().email('Email do usuário inválido').optional(),
  senhaUsuario: z.string().optional(),
});

type CombinedForm = z.infer<typeof combinedSchema>;

export default function EditarLojaPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const id = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CombinedForm>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      payment: false,
    },
  });

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        setInitialLoading(true);
        const data = await lojaService.buscarPorId(id);
        
        setLoja(data);
        setLogoPreview(data.logo || null);
        
        // Preencher formulário com dados da loja
        setValue('nomeLoja', data.nome);
        setValue('emailLoja', data.email);
        setValue('categoria', data.categoria);
        setValue('descricao', data.descricao || '');
        setValue('payment', data.payment || false);

        // Preencher dados do usuário (se existir)
        if (data.usuario) {
          setValue('nomeUsuario', data.usuario.nome);
          setValue('emailUsuario', data.usuario.email);
        }
        
      } catch (error) {
        toast.error('Erro ao carregar loja');
        router.push('/dashboard/lojas');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      carregarLoja();
    }
  }, [id, router, setValue]);

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

  const onSubmit = async (data: CombinedForm) => {
    try {
      setLoading(true);
      
      // 1️⃣ ATUALIZAR LOJA
      const dadosLoja: any = {
        nome: data.nomeLoja,
        email: data.emailLoja,
        senha: data.senhaLoja,
        categoria: data.categoria,
        descricao: data.descricao,
        payment: data.payment,
      };
      
      // Remover campos vazios da loja
      Object.keys(dadosLoja).forEach(key => {
        if (dadosLoja[key] === undefined || dadosLoja[key] === '') {
          delete dadosLoja[key];
        }
      });
      
      if (logoFile) {
        dadosLoja.logo = logoFile;
      }

      await lojaService.atualizar(id, dadosLoja);

      // 2️⃣ ATUALIZAR USUÁRIO (se existir e se tiver dados)
      if (loja?.usuario && (data.nomeUsuario || data.emailUsuario || data.senhaUsuario)) {
        const dadosUsuario: any = {
          nome: data.nomeUsuario,
          email: data.emailUsuario,
          senha: data.senhaUsuario,
        };
        
        // Remover campos vazios do usuário
        Object.keys(dadosUsuario).forEach(key => {
          if (dadosUsuario[key] === undefined || dadosUsuario[key] === '') {
            delete dadosUsuario[key];
          }
        });

        if (Object.keys(dadosUsuario).length > 0) {
          await usuarioService.atualizar(loja.usuario.id, dadosUsuario);
        }
      }

      toast.success('Dados atualizados com sucesso!');
      router.push('/dashboard/lojas');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar');
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
            <p className="text-sm sm:text-base text-gray-500">Carregando loja...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!loja) {
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
              Editar Loja
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Editando: {loja.nome}
            </p>
          </div>
        </div>

        <Tabs defaultValue="loja" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="loja" className="text-xs sm:text-sm py-1.5 sm:py-2">
              <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Dados da Loja</span>
              <span className="xs:hidden">Loja</span>
            </TabsTrigger>
            <TabsTrigger 
              value="usuario" 
              disabled={!loja.usuario}
              className="text-xs sm:text-sm py-1.5 sm:py-2"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">
                {loja.usuario ? 'Usuário Lojista' : 'Sem usuário'}
              </span>
              <span className="xs:hidden">Usuário</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba da Loja */}
          <TabsContent value="loja">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Informações da Loja</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Altere os dados da loja
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Nome */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="nomeLoja" className="text-xs sm:text-sm">Nome da Loja</Label>
                      <Input
                        id="nomeLoja"
                        defaultValue={loja.nome}
                        {...register('nomeLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.nomeLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.nomeLoja.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="emailLoja" className="text-xs sm:text-sm">Email</Label>
                      <Input
                        id="emailLoja"
                        type="email"
                        defaultValue={loja.email}
                        {...register('emailLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.emailLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.emailLoja.message}</p>
                      )}
                    </div>

                    {/* Senha (opcional) */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="senhaLoja" className="text-xs sm:text-sm">
                        Nova Senha <span className="text-gray-400 text-[10px] sm:text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="senhaLoja"
                        type="password"
                        placeholder="Deixe em branco para manter"
                        {...register('senhaLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.senhaLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.senhaLoja.message}</p>
                      )}
                      <p className="text-[8px] sm:text-xs text-gray-400">
                        Preencha apenas se quiser alterar a senha
                      </p>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="categoria" className="text-xs sm:text-sm">Categoria</Label>
                      <Select
                        onValueChange={(value) => setValue('categoria', value)}
                        defaultValue={loja.categoria}
                      >
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESTAURANTE" className="text-xs sm:text-sm">Restaurante</SelectItem>
                          <SelectItem value="SUPERMERCADO" className="text-xs sm:text-sm">Supermercado</SelectItem>
                          <SelectItem value="PADARIA" className="text-xs sm:text-sm">Padaria</SelectItem>
                          <SelectItem value="LOJA_DE_ROUPAS" className="text-xs sm:text-sm">Loja de Roupas</SelectItem>
                          <SelectItem value="ELETRONICOS" className="text-xs sm:text-sm">Eletrônicos</SelectItem>
                          <SelectItem value="OUTROS" className="text-xs sm:text-sm">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status de Pagamento */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="payment" className="text-xs sm:text-sm">Status de Pagamento</Label>
                      <div className="flex items-center space-x-2 pt-1 sm:pt-2">
                        <Switch
                          id="payment"
                          checked={watch('payment')}
                          onCheckedChange={(checked) => setValue('payment', checked)}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="payment" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                          {watch('payment') ? 'Ativo' : 'Inativo'}
                        </Label>
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                      <Label htmlFor="descricao" className="text-xs sm:text-sm">Descrição</Label>
                      <Input
                        id="descricao"
                        defaultValue={loja.descricao || ''}
                        {...register('descricao')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Logo */}
<div className="space-y-1 sm:space-y-2 sm:col-span-2">
  <Label htmlFor="logo" className="text-xs sm:text-sm">Logo da Loja</Label>
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
    
    {/* 🔥 IMAGEM NO MESMO PADRÃO DO ARQUIVO FUNCIONAL */}
    {loja?.logo && !logoFile && (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border bg-gray-100">
          <img
            src={`https://api.radiocupom.online/uploads/${loja.logo.split('\\').pop()?.split('/').pop()}`}
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

    {/* 🔥 PREVIEW DO NOVO UPLOAD (se houver) */}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba do Usuário */}
          <TabsContent value="usuario">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Usuário Lojista</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Altere os dados do usuário associado a esta loja
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {loja.usuario ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Nome */}
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="nomeUsuario" className="text-xs sm:text-sm">Nome do Usuário</Label>
                        <Input
                          id="nomeUsuario"
                          defaultValue={loja.usuario.nome}
                          {...register('nomeUsuario')}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        />
                        {errors.nomeUsuario && (
                          <p className="text-[10px] sm:text-xs text-red-500">{errors.nomeUsuario.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="emailUsuario" className="text-xs sm:text-sm">Email</Label>
                        <Input
                          id="emailUsuario"
                          type="email"
                          defaultValue={loja.usuario.email}
                          {...register('emailUsuario')}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        />
                        {errors.emailUsuario && (
                          <p className="text-[10px] sm:text-xs text-red-500">{errors.emailUsuario.message}</p>
                        )}
                      </div>

                      {/* Senha (opcional) */}
                      <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                        <Label htmlFor="senhaUsuario" className="text-xs sm:text-sm">
                          Nova Senha <span className="text-gray-400 text-[10px] sm:text-xs">(opcional)</span>
                        </Label>
                        <Input
                          id="senhaUsuario"
                          type="password"
                          placeholder="Deixe em branco para manter"
                          {...register('senhaUsuario')}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        />
                        {errors.senhaUsuario && (
                          <p className="text-[10px] sm:text-xs text-red-500">{errors.senhaUsuario.message}</p>
                        )}
                        <p className="text-[8px] sm:text-xs text-gray-400">
                          Preencha apenas se quiser alterar a senha
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <User className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Esta loja não possui um usuário associado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* BOTÕES */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4">
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
            onClick={handleSubmit(onSubmit)}
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
    </ProtectedRoute>
  );
}