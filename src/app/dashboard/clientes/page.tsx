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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Search,
  Edit,
  Trash,
  User,
  BarChart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clienteService, { Cliente } from '@/services/cliente';
import { toast } from 'sonner';

export default function ClientesPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.listarTodos();
      setClientes(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      await clienteService.deletar(id);
      toast.success('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleToggleStatus = async (cliente: Cliente) => {
    try {
      await clienteService.toggleStatus(cliente.id, !cliente.ativo);
      toast.success(`Cliente ${!cliente.ativo ? 'ativado' : 'desativado'}!`);
      carregarClientes();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const filtrarClientes = () => {
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search)
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const podeGerenciar = () => {
    return currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  };

  const podeExcluir = () => {
    return currentUser?.role === 'superadmin';
  };

  if (loading && clientes.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando clientes...</p>
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
              Clientes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie os clientes do sistema
            </p>
          </div>
          
          {/* Estatísticas rápidas - mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Users className="h-3 w-3 mr-1" />
              {clientes.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {clientes.filter(c => c.ativo).length} ativos
            </Badge>
          </div>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou WhatsApp..."
                className="pl-8 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de clientes - versão desktop */}
        <Card className="hidden lg:block">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Contato</TableHead>
                  <TableHead className="text-xs">Localização</TableHead>
                  <TableHead className="text-xs">Nascimento</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Cadastro</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarClientes().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrarClientes().map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                              {getInitials(cliente.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate max-w-[150px]">
                              {cliente.nome}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px]">
                              {cliente.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{cliente.whatsapp}</span>
                          </div>
                          {cliente.instagram && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] sm:text-xs text-gray-400">📷</span>
                              <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">
                                {cliente.instagram}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {cliente.cidade}/{cliente.estado}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">
                            {cliente.bairro}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{formatDate(cliente.dataNascimento)}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500">{cliente.genero}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[10px] sm:text-xs px-2 py-0.5",
                            cliente.ativo 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {formatDate(cliente.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {podeGerenciar() && (
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
                                onClick={() => router.push(`/dashboard/clientes/${cliente.id}`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/clientes/${cliente.id}/resgates`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <BarChart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(cliente)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                {cliente.ativo ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              {podeExcluir() && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 text-xs sm:text-sm cursor-pointer"
                                    onClick={() => handleDelete(cliente.id)}
                                  >
                                    <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
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
          {filtrarClientes().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filtrarClientes().map((cliente) => (
              <Card key={cliente.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Cabeçalho do card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                          {getInitials(cliente.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
                          {cliente.nome}
                        </p>
                        <Badge 
                          className={cn(
                            "mt-1 text-[8px] sm:text-[10px] px-1.5 py-0",
                            cliente.ativo 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    
                    {podeGerenciar() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/clientes/${cliente.id}`)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/clientes/${cliente.id}/resgates`)}
                            className="text-xs cursor-pointer"
                          >
                            <BarChart className="mr-2 h-3 w-3" />
                            Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(cliente)}
                            className="text-xs cursor-pointer"
                          >
                            <User className="mr-2 h-3 w-3" />
                            {cliente.ativo ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          {podeExcluir() && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 text-xs cursor-pointer"
                                onClick={() => handleDelete(cliente.id)}
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
                      <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{cliente.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">
                        {cliente.cidade}/{cliente.estado} - {cliente.bairro}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">
                        {formatDate(cliente.dataNascimento)} • {cliente.genero}
                      </span>
                    </div>
                    {cliente.instagram && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📷</span>
                        <span className="text-gray-600">{cliente.instagram}</span>
                      </div>
                    )}
                  </div>

                  {/* Data de cadastro */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Cadastro: {formatDate(cliente.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Rodapé com total de clientes */}
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>Total: {clientes.length} clientes</span>
          <span>{clientes.filter(c => c.ativo).length} ativos</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Import cn no topo do arquivo
import { cn } from '@/lib/utils';