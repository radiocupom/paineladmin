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
import { ArrowLeft, Save, X, Loader2, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import usuarioService from '@/services/usuario';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Schema atualizado: apenas superadmin e admin
const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['superadmin', 'admin']),
});

type UsuarioForm = z.infer<typeof usuarioSchema>;

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      role: 'admin',
    },
  });

  const onSubmit = async (data: UsuarioForm) => {
    try {
      setLoading(true);
      await usuarioService.criar(data);
      toast.success('Usuário criado com sucesso!');
      router.push('/dashboard/usuarios');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Apenas superadmin pode criar outros superadmins
  const podeCriarSuperAdmin = user?.role === 'superadmin';

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
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
              Novo Usuário
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Cadastre um novo administrador
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Administrador</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha os dados para criar um novo administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Nome */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="nome" className="text-xs sm:text-sm">
                    Nome completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Digite o nome"
                    {...register('nome')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.nome && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.nome.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    {...register('email')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.email && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="senha" className="text-xs sm:text-sm">
                    Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••"
                    {...register('senha')}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {errors.senha && (
                    <p className="text-[10px] sm:text-xs text-red-500">{errors.senha.message}</p>
                  )}
                </div>

                {/* Função */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="role" className="text-xs sm:text-sm">
                    Nível de Acesso <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value: 'superadmin' | 'admin') => setValue('role', value)}
                    defaultValue="admin"
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin" className="text-xs sm:text-sm">Administrador</SelectItem>
                      {podeCriarSuperAdmin && (
                        <SelectItem value="superadmin" className="text-xs sm:text-sm">Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                      Criar Administrador
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Dica de segurança */}
        <div className="text-center text-[10px] sm:text-xs text-gray-400">
          Apenas Super Administradores podem criar outros Super Administradores
        </div>
      </div>
    </ProtectedRoute>
  );
}