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
import { ArrowLeft, Loader2, Save, X, User } from 'lucide-react';
import { toast } from 'sonner';
import usuarioService, { Usuario } from '@/services/usuario';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin'>('admin');

  const id = params.id as string;

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        setInitialLoading(true);
        const data = await usuarioService.buscarPorId(id);
        setUsuario(data);
        
        // Preencher estados
        setNome(data.nome);
        setEmail(data.email);
        setRole(data.role as 'superadmin' | 'admin');
        
      } catch (error) {
        toast.error('Erro ao carregar usuário');
        router.push('/dashboard/usuarios');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      carregarUsuario();
    }
  }, [id, router]);

  const handleSalvar = async () => {
    try {
      setLoading(true);
      
      const dadosAtualizar: any = {};
      if (nome) dadosAtualizar.nome = nome;
      if (email) dadosAtualizar.email = email;
      if (senha) dadosAtualizar.senha = senha;
      if (role) dadosAtualizar.role = role;
      
      await usuarioService.atualizar(id, dadosAtualizar);
      toast.success('Usuário atualizado com sucesso!');
      router.push('/dashboard/usuarios');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const podeEditar = () => {
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin' && usuario?.role === 'admin') return true;
    return false;
  };

  const podeMudarRole = currentUser?.role === 'superadmin';

  if (initialLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando usuário...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!usuario) {
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
              Editar Usuário
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Editando: {usuario.nome}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Administrador</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Altere os dados do administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Nome */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="nome" className="text-xs sm:text-sm">Nome completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="senha" className="text-xs sm:text-sm">
                    Nova Senha <span className="text-gray-400 text-[10px] sm:text-xs">(opcional)</span>
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Deixe em branco para manter"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Função */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="role" className="text-xs sm:text-sm">Nível de Acesso</Label>
                  <Select
                    value={role}
                    onValueChange={(value: 'superadmin' | 'admin') => setRole(value)}
                    disabled={!podeMudarRole}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin" className="text-xs sm:text-sm">Administrador</SelectItem>
                      {currentUser?.role === 'superadmin' && (
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
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400">
          <span>ID: {usuario.id.slice(0, 8)}...</span>
          <span>Cadastro: {new Date(usuario.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}