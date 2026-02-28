'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MoreHorizontal, 
  Search,
  Edit,
  Trash,
  Shield,
  User,
  Users,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usuarioService, { Usuario } from '@/services/usuario';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function UsuariosPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.listarTodos();
      setUsuarios(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;
    
    try {
      await usuarioService.deletar(usuarioToDelete.id);
      toast.success('Usuário excluído com sucesso!');
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    } finally {
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(u => 
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      loja: 'bg-green-100 text-green-700'
    };
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Administrador',
      loja: 'Lojista'
    };
    return (
      <Badge className={cn(
        colors[role as keyof typeof colors],
        "text-[10px] sm:text-xs px-2 py-0.5"
      )}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const podeGerenciar = (usuario: Usuario) => {
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin' && usuario.role === 'admin') return true;
    return false;
  };

  const podeExcluir = (usuario: Usuario) => {
    if (usuario.id === currentUser?.id) return false;
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin' && usuario.role === 'admin') return true;
    return false;
  };

  if (loading && usuarios.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando usuários...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Usuários
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie os administradores do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 sm:hidden">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Users className="h-3 w-3 mr-1" />
                {usuarios.length}
              </Badge>
            </div>
            
            {currentUser?.role === 'superadmin' && (
              <Button 
                onClick={() => router.push('/dashboard/usuarios/novo')}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                Novo Administrador
              </Button>
            )}
          </div>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela - versão desktop */}
        <Card className="hidden lg:block">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Nível</TableHead>
                  <TableHead className="text-xs">Cadastro</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarUsuarios().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrarUsuarios().map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate max-w-[150px]">
                            {usuario.nome}
                          </span>
                          {usuario.id === currentUser?.id && (
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 py-0 ml-1">
                              Você
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm truncate max-w-[150px] block">
                          {usuario.email}
                        </span>
                      </TableCell>
                      <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {new Date(usuario.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {podeGerenciar(usuario) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 sm:w-48">
                              <DropdownMenuLabel className="text-xs sm:text-sm">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/usuarios/${usuario.id}`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Editar
                              </DropdownMenuItem>
                              {podeExcluir(usuario) && (
                                <DropdownMenuItem
                                  className="text-red-600 text-xs sm:text-sm cursor-pointer"
                                  onClick={() => handleDeleteClick(usuario)}
                                >
                                  <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards para mobile/tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
          {filtrarUsuarios().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : (
            filtrarUsuarios().map((usuario) => (
              <Card key={usuario.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
                          {usuario.nome}
                        </p>
                        <div className="mt-1">
                          {getRoleBadge(usuario.role)}
                        </div>
                        {usuario.id === currentUser?.id && (
                          <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 py-0 mt-1">
                            Você
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {podeGerenciar(usuario) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/usuarios/${usuario.id}`)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Editar
                          </DropdownMenuItem>
                          {podeExcluir(usuario) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 text-xs cursor-pointer"
                                onClick={() => handleDeleteClick(usuario)}
                              >
                                <Trash className="mr-2 h-3 w-3" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Informações do card */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{usuario.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">
                        {new Date(usuario.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Rodapé com total de usuários */}
        <div className="flex justify-end items-center text-xs sm:text-sm text-gray-500">
          <span>Total: {usuarios.length} usuários</span>
        </div>

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="w-[90vw] max-w-md p-4 sm:p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">
                Confirmar exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm">
                Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}