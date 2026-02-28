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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Search,
  Edit,
  Trash,
  Store,
  User,
  Calendar,
  Mail,
  Tag,
  DollarSign,
  Loader2,
  BarChart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import lojaService, { Loja } from '@/services/loja';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils'; 
 

export default function LojasPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    carregarLojas();
  }, []);

  const carregarLojas = async () => {
    try {
      setLoading(true);
      const data = await lojaService.listarTodas();
      setLojas(data);
    } catch (error) {
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
    
    try {
      await lojaService.deletar(id);
      toast.success('Loja excluída com sucesso!');
      carregarLojas();
    } catch (error) {
      toast.error('Erro ao excluir loja');
    }
  };

  const filtrarLojas = () => {
    return lojas.filter(l => 
      l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      RESTAURANTE: 'Restaurante',
      SUPERMERCADO: 'Supermercado',
      PADARIA: 'Padaria',
      LOJA_DE_ROUPAS: 'Loja de Roupas',
      ELETRONICOS: 'Eletrônicos',
      OUTROS: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  const podeGerenciar = () => {
    return currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  };

  if (loading && lojas.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando lojas...</p>
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
              Lojas
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie as lojas do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:hidden">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Store className="h-3 w-3 mr-1" />
              {lojas.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {lojas.filter(l => l.payment).length} ativas
            </Badge>
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
                  <TableHead className="text-xs">Logo</TableHead>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs">Usuário</TableHead>
                  <TableHead className="text-xs">Pagamento</TableHead>
                  <TableHead className="text-xs">Cadastro</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarLojas().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Store className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">Nenhuma loja encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrarLojas().map((loja) => (
                    <TableRow key={loja.id}>
                      <TableCell>
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
 <AvatarImage 
  src="https://api.radiocupom.online/uploads/logo-1772226996831-837721523.png"  // URL FIXA
  alt={loja.nome}
/>
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                            {loja.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] block">
                          {loja.nome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm truncate max-w-[150px] block">
                          {loja.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm">
                          {getCategoriaLabel(loja.categoria)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {loja.usuario ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate max-w-[100px]">
                              {loja.usuario.nome}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-gray-50">
                            Sem usuário
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[10px] sm:text-xs px-2 py-0.5",
                            loja.payment 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {loja.payment ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {new Date(loja.createdAt).toLocaleDateString()}
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
                              
                              {/* 🔥 BOTÃO DE MÉTRICAS */}
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/lojas/${loja.id}/metricas`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <BarChart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Métricas
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/lojas/${loja.id}/editar`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Editar
                              </DropdownMenuItem>
                              
                              {currentUser?.role === 'superadmin' && (
                                <DropdownMenuItem
                                  className="text-red-600 text-xs sm:text-sm cursor-pointer"
                                  onClick={() => handleDelete(loja.id)}
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
          {filtrarLojas().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Store className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhuma loja encontrada</p>
            </div>
          ) : (
            filtrarLojas().map((loja) => (
            <Card key={loja.id} className="overflow-hidden">
  <CardContent className="p-3 sm:p-4">
    {/* Cabeçalho do card */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage 
            src={`https://api.radiocupom.online/uploads/${loja.logo?.split('\\').pop()?.split('/').pop()}`}
            alt={loja.nome}
          />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {loja.nome.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
            {loja.nome}
          </p>
          <Badge 
            className={cn(
              "mt-1 text-[8px] sm:text-[10px] px-1.5 py-0",
              loja.payment 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            )}
          >
            {loja.payment ? 'Ativa' : 'Inativa'}
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
            {/* 🔥 BOTÃO DE MÉTRICAS */}
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/lojas/${loja.id}/metricas`)}
              className="text-xs cursor-pointer"
            >
              <BarChart className="mr-2 h-3 w-3" />
              Métricas
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/lojas/${loja.id}/editar`)}
              className="text-xs cursor-pointer"
            >
              <Edit className="mr-2 h-3 w-3" />
              Editar
            </DropdownMenuItem>
            
            {currentUser?.role === 'superadmin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 text-xs cursor-pointer"
                  onClick={() => handleDelete(loja.id)}
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
        <span className="text-gray-600 truncate">{loja.email}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Tag className="h-3 w-3 text-gray-400 flex-shrink-0" />
        <span className="text-gray-600">
          {getCategoriaLabel(loja.categoria)}
        </span>
      </div>
      
      {loja.usuario && (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {loja.usuario.nome}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
        <span className="text-gray-600">
          {new Date(loja.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  </CardContent>
</Card>
            ))
          )}
        </div>

        {/* Rodapé com total de lojas */}
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>Total: {lojas.length} lojas</span>
          <span>{lojas.filter(l => l.payment).length} ativas</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}