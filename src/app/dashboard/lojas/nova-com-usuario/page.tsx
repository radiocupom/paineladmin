'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, Store, User, Save, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import lojaService, { CreateLojaComUsuarioDTO } from '@/services/loja';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const novaLojaComUsuarioSchema = z.object({
  // Dados da Loja
  nomeLoja: z.string().min(3, 'Nome da loja deve ter no mínimo 3 caracteres'),
  emailLoja: z.string().email('Email da loja inválido'),
  senhaLoja: z.string().min(6, 'Senha da loja deve ter no mínimo 6 caracteres'),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  
  // Dados do Usuário
  nomeUsuario: z.string().min(3, 'Nome do usuário deve ter no mínimo 3 caracteres'),
  emailUsuario: z.string().email('Email do usuário inválido'),
  senhaUsuario: z.string().min(6, 'Senha do usuário deve ter no mínimo 6 caracteres'),
});

type NovaLojaComUsuarioForm = z.infer<typeof novaLojaComUsuarioSchema>;

export default function NovaLojaComUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NovaLojaComUsuarioForm>({
    resolver: zodResolver(novaLojaComUsuarioSchema),
    defaultValues: {
      categoria: 'OUTROS',
    },
  });

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

  const onSubmit = async (data: NovaLojaComUsuarioForm) => {
    try {
      setLoading(true);
      
      const lojaData: CreateLojaComUsuarioDTO = {
        nomeLoja: data.nomeLoja,
        emailLoja: data.emailLoja,
        senhaLoja: data.senhaLoja,
        categoria: data.categoria,
        descricao: data.descricao,
        nomeUsuario: data.nomeUsuario,
        emailUsuario: data.emailUsuario,
        senhaUsuario: data.senhaUsuario,
        logo: logoFile || undefined,
      };

      await lojaService.criarComUsuario(lojaData);
      toast.success('Loja e usuário criados com sucesso!');
      router.push('/dashboard/lojas');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar loja');
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
              Nova Loja + Usuário
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Cadastre uma nova loja e seu respectivo lojista
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações Completas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha os dados da loja e do usuário administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <Tabs defaultValue="loja" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                  <TabsTrigger value="loja" className="text-xs sm:text-sm py-1.5 sm:py-2">
                    <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Dados da Loja</span>
                    <span className="xs:hidden">Loja</span>
                  </TabsTrigger>
                  <TabsTrigger value="usuario" className="text-xs sm:text-sm py-1.5 sm:py-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Dados do Usuário</span>
                    <span className="xs:hidden">Usuário</span>
                  </TabsTrigger>
                </TabsList>

                {/* Aba da Loja */}
                <TabsContent value="loja" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* nomeLoja */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="nomeLoja" className="text-xs sm:text-sm">
                        Nome da Loja <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomeLoja"
                        placeholder="Digite o nome da loja"
                        {...register('nomeLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.nomeLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.nomeLoja.message}</p>
                      )}
                    </div>

                    {/* emailLoja */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="emailLoja" className="text-xs sm:text-sm">
                        Email da Loja <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emailLoja"
                        type="email"
                        placeholder="loja@exemplo.com"
                        {...register('emailLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.emailLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.emailLoja.message}</p>
                      )}
                    </div>

                    {/* senhaLoja */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="senhaLoja" className="text-xs sm:text-sm">
                        Senha da Loja <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="senhaLoja"
                        type="password"
                        placeholder="••••••"
                        {...register('senhaLoja')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.senhaLoja && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.senhaLoja.message}</p>
                      )}
                    </div>

                    {/* categoria */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="categoria" className="text-xs sm:text-sm">Categoria</Label>
                      <Select
                        onValueChange={(value) => setValue('categoria', value)}
                        defaultValue="OUTROS"
                      >
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione a categoria" />
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

                    {/* descricao */}
                    <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                      <Label htmlFor="descricao" className="text-xs sm:text-sm">Descrição</Label>
                      <Input
                        id="descricao"
                        placeholder="Breve descrição da loja"
                        {...register('descricao')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    {/* logo */}
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
                </TabsContent>

                {/* Aba do Usuário */}
                <TabsContent value="usuario" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* nomeUsuario */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="nomeUsuario" className="text-xs sm:text-sm">
                        Nome do Usuário <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomeUsuario"
                        placeholder="Digite o nome do usuário"
                        {...register('nomeUsuario')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.nomeUsuario && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.nomeUsuario.message}</p>
                      )}
                    </div>

                    {/* emailUsuario */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="emailUsuario" className="text-xs sm:text-sm">
                        Email do Usuário <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emailUsuario"
                        type="email"
                        placeholder="usuario@exemplo.com"
                        {...register('emailUsuario')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.emailUsuario && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.emailUsuario.message}</p>
                      )}
                    </div>

                    {/* senhaUsuario */}
                    <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                      <Label htmlFor="senhaUsuario" className="text-xs sm:text-sm">
                        Senha do Usuário <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="senhaUsuario"
                        type="password"
                        placeholder="••••••"
                        {...register('senhaUsuario')}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.senhaUsuario && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.senhaUsuario.message}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

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
                      Criar Loja e Usuário
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