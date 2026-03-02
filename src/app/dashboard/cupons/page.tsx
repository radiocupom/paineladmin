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
  Ticket,
  QrCode,
  BarChart,
  Store,
  Loader2,
  Calendar,
  Tag,
  Users,
  DollarSign,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import cupomService, { Cupom } from '@/services/cupom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CuponsPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    carregarCupons();
  }, []);

  const carregarCupons = async () => {
    try {
      setLoading(true);
      const data = await cupomService.listarTodas();
      setCupons(data);
    } catch (error) {
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = async (id: string) => {
  const cupom = cupons.find(c => c.id === id);
  
  // Se tiver resgates, avisa com mensagem amigável
  if (cupom?._count?.resgates && cupom._count.resgates > 0) {
    const mensagem = `⚠️ ATENÇÃO ⚠️\n\nEste cupom possui ${cupom._count.resgates} resgate(s) vinculado(s).\nSe você excluir, esses resgates serão perdidos permanentemente.\n\nTem certeza que deseja continuar?`;
    
    if (!confirm(mensagem)) return;
  } else {
    // Se não tiver resgates, confirmação normal
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
  }
  
  try {
    await cupomService.deletar(id);
    toast.success('Cupom excluído com sucesso!');
    carregarCupons();
  } catch (error: any) {
    console.error('❌ Erro ao deletar:', error);
    toast.error(error.response?.data?.error || 'Erro ao excluir cupom');
  }
};
  const handleGerarQrCodes = async (id: string) => {
    try {
      const quantidadeInput = prompt('Quantos QR codes deseja gerar?', '100');
      
      if (quantidadeInput === null) return;
      
      const quantidade = parseInt(quantidadeInput);
      if (isNaN(quantidade) || quantidade <= 0) {
        toast.error('Quantidade inválida');
        return;
      }
      
      const response = await cupomService.gerarQrCodes(id, quantidade);
      toast.success(response.mensagem || `${quantidade} QR codes gerados com sucesso!`);
      carregarCupons();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar QR codes');
    }
  };

  const filtrarCupons = () => {
    return cupons.filter(c => 
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.descricao.toLowerCase().includes(search.toLowerCase()) ||
      c.loja?.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.nomeProduto && c.nomeProduto.toLowerCase().includes(search.toLowerCase()))
    );
  };

  // 🔥 FUNÇÃO PARA FORMATAR DATA NO FUSO DE SÃO PAULO
  // Substitua a função formatarDataSP por esta:

const formatarDataSP = (data: string) => {
  // Cria uma data a partir da string
  const dataObj = new Date(data);
  
  // Adiciona 1 dia para compensar o fuso
  dataObj.setDate(dataObj.getDate() + 1);
  
  // Formata sem timezone
  return dataObj.toLocaleDateString('pt-BR');
};

// Ou, se preferir manter o fuso SP mas forçar o dia correto:
const formatarDataCorrigida = (data: string) => {
  const dataObj = new Date(data);
  // Ajusta para meio-dia para evitar problemas de fuso
  dataObj.setHours(12, 0, 0, 0);
  return dataObj.toLocaleDateString('pt-BR');
};

  // 🔥 FUNÇÃO PARA VERIFICAR SE ESTÁ EXPIRADO (considerando SP)
  const isExpirado = (dataExpiracao: string) => {
    const hoje = new Date();
    const dataSP = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    dataSP.setHours(0, 0, 0, 0);
    
    const expiracaoSP = new Date(new Date(dataExpiracao).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    expiracaoSP.setHours(0, 0, 0, 0);
    
    return expiracaoSP < dataSP;
  };

  const getStatusBadge = (cupom: Cupom) => {
    if (isExpirado(cupom.dataExpiracao)) {
      return <Badge className="bg-red-100 text-red-700 text-[10px] sm:text-xs">Expirado</Badge>;
    }
    if (!cupom.loja?.payment) {
      return <Badge className="bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs">Loja inativa</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs">Ativo</Badge>;
  };

  const getProgresso = (cupom: Cupom) => {
    return `${cupom.qrCodesUsados}/${cupom.totalQrCodes}`;
  };

  // 🔥 FUNÇÃO PARA FORMATAR PREÇO
  const formatarPreco = (valor?: number) => {
    if (valor === undefined || valor === null) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // 🔥 FUNÇÃO PARA RENDERIZAR PREÇOS
  const renderPrecos = (cupom: Cupom) => {
    if (!cupom.precoOriginal && !cupom.precoComDesconto && !cupom.percentualDesconto) {
      return null;
    }

    return (
      <div className="flex flex-col gap-1">
        {cupom.nomeProduto && (
          <div className="flex items-center gap-1 text-xs">
            <ShoppingBag className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-700 truncate max-w-[100px]">
              {cupom.nomeProduto}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          {cupom.precoOriginal && (
            <span className="text-xs text-gray-400 line-through">
              {formatarPreco(cupom.precoOriginal)}
            </span>
          )}
          
          {cupom.precoComDesconto && (
            <span className="text-xs font-bold text-green-600">
              {formatarPreco(cupom.precoComDesconto)}
            </span>
          )}
          
          {cupom.percentualDesconto && (
            <Badge className="bg-green-100 text-green-700 text-[10px]">
              <Percent className="h-2 w-2 mr-1" />
              {cupom.percentualDesconto}% OFF
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const podeGerenciar = () => {
    return currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  };

  // 🔥 FILTRO DE CUPONS ATIVOS COM FUSO SP
  const cuponsAtivos = cupons.filter(c => 
    !isExpirado(c.dataExpiracao) && c.loja?.payment
  ).length;

  if (loading && cupons.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando cupons...</p>
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
              Cupons
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie os cupons do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:hidden">
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <Ticket className="h-3 w-3 mr-1" />
              {cupons.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {cuponsAtivos} ativos
            </Badge>
          </div>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código, descrição, loja ou produto..."
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
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">Preços</TableHead>
                  <TableHead className="text-xs">Loja</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">QR Codes</TableHead>
                  <TableHead className="text-xs">Validade (SP)</TableHead>
                  <TableHead className="text-xs">Resgates</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarCupons().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Ticket className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">Nenhum cupom encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrarCupons().map((cupom) => (
                    <TableRow key={cupom.id}>
                      <TableCell>
  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
    <AvatarImage 
      src={`https://api.radiocupom.online/uploads/${cupom.logo?.split('\\').pop()?.split('/').pop() || ''}`}
      alt={cupom.codigo}
    />
    <AvatarFallback className="bg-purple-100 text-purple-600 text-xs sm:text-sm">
      {cupom.codigo.charAt(0)}
    </AvatarFallback>
  </Avatar>
</TableCell>
                      <TableCell>
                        <span className="font-mono font-medium text-xs sm:text-sm">
                          {cupom.codigo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs sm:text-sm truncate max-w-[150px] block">
                            {cupom.descricao}
                          </span>
                          {renderPrecos(cupom)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          {cupom.nomeProduto && (
                            <span className="text-xs font-medium text-gray-700">
                              {cupom.nomeProduto}
                            </span>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {cupom.precoOriginal && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatarPreco(cupom.precoOriginal)}
                              </span>
                            )}
                            {cupom.precoComDesconto && (
                              <span className="text-xs font-bold text-green-600">
                                {formatarPreco(cupom.precoComDesconto)}
                              </span>
                            )}
                          </div>
                          {cupom.percentualDesconto && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] w-fit">
                              <Percent className="h-2 w-2 mr-1" />
                              {cupom.percentualDesconto}% OFF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Store className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate max-w-[100px]">
                            {cupom.loja?.nome || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(cupom)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs sm:text-sm">
                            {getProgresso(cupom)}
                          </span>
                          <div className="w-20 sm:w-24 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-1.5 bg-blue-600 rounded-full"
                              style={{ width: `${(cupom.qrCodesUsados / cupom.totalQrCodes) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {formatarDataSP(cupom.dataExpiracao)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {cupom._count?.resgates || 0}
                        </Badge>
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
                                onClick={() => router.push(`/dashboard/cupons/${cupom.id}`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/cupons/${cupom.id}/estatisticas`)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <BarChart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Estatísticas
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleGerarQrCodes(cupom.id)}
                                className="text-xs sm:text-sm cursor-pointer"
                              >
                                <QrCode className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Gerar QR Codes
                              </DropdownMenuItem>
                              {currentUser?.role === 'superadmin' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 text-xs sm:text-sm cursor-pointer"
                                    onClick={() => handleDelete(cupom.id)}
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
          {filtrarCupons().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Ticket className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum cupom encontrado</p>
            </div>
          ) : (
            filtrarCupons().map((cupom) => {
              const expirado = isExpirado(cupom.dataExpiracao);
              return (
                <Card key={cupom.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                       <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
  <AvatarImage 
    src={`https://api.radiocupom.online/uploads/${cupom.logo?.split('\\').pop()?.split('/').pop() || ''}`}
    alt={cupom.codigo}
  />
  <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
    {cupom.codigo.charAt(0)}
  </AvatarFallback>
</Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-xs sm:text-sm">
                              {cupom.codigo}
                            </span>
                            {getStatusBadge(cupom)}
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                            {cupom.descricao}
                          </p>
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
                              onClick={() => router.push(`/dashboard/cupons/${cupom.id}`)}
                              className="text-xs cursor-pointer"
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/cupons/${cupom.id}/estatisticas`)}
                              className="text-xs cursor-pointer"
                            >
                              <BarChart className="mr-2 h-3 w-3" />
                              Estatísticas
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleGerarQrCodes(cupom.id)}
                              className="text-xs cursor-pointer"
                            >
                              <QrCode className="mr-2 h-3 w-3" />
                              Gerar QR
                            </DropdownMenuItem>
                            {currentUser?.role === 'superadmin' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 text-xs cursor-pointer"
                                  onClick={() => handleDelete(cupom.id)}
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
                      {renderPrecos(cupom) && (
                        <div className="mb-2">
                          {renderPrecos(cupom)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Store className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">
                          {cupom.loja?.nome || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <QrCode className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          QR Codes: {getProgresso(cupom)}
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full",
                            expirado ? "bg-red-500" : "bg-blue-600"
                          )}
                          style={{ width: `${(cupom.qrCodesUsados / cupom.totalQrCodes) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className={cn(
                          "text-gray-600",
                          expirado && "text-red-600 font-medium"
                        )}>
                          Validade: {formatarDataSP(cupom.dataExpiracao)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          Resgates: {cupom._count?.resgates || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Rodapé com total de cupons */}
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>Total: {cupons.length} cupons</span>
          <span>{cuponsAtivos} ativos</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}