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
  QrCode,
  BarChart,
  Plus,
  Copy,
  AlertCircle,
  Calendar,
  Tag,
  Loader2,
  DollarSign,
  ShoppingBag,
  Percent,
  Power
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import cupomService, { Cupom } from '@/services/cupom';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

export default function MeusCuponsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gerandoQr, setGerandoQr] = useState<string | null>(null);

  useEffect(() => {
    carregarCupons();
  }, []);

  const carregarCupons = async () => {
    try {
      setLoading(true);
      const data = await cupomService.getMyStore();
      setCupons(data);
    } catch (error) {
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
    
    try {
      await cupomService.delete(id);
      toast.success('Cupom excluído com sucesso!');
      carregarCupons();
    } catch (error) {
      toast.error('Erro ao excluir cupom');
    }
  };

  const handleGerarQrCodes = async (id: string) => {
    const quantidadeInput = prompt('Quantos QR codes deseja gerar?', '100');
    
    if (quantidadeInput === null) return;
    
    const quantidade = parseInt(quantidadeInput);
    
    if (isNaN(quantidade) || quantidade <= 0) {
      toast.error('Por favor, digite um número válido maior que zero');
      return;
    }
    
    if (quantidade > 10000) {
      const confirmar = confirm('Você está gerando muitos QR codes (mais de 10.000). Continuar?');
      if (!confirmar) return;
    }

    try {
      setGerandoQr(id);
      await cupomService.generateQrCodes(id, quantidade);
      toast.success(`${quantidade} QR codes gerados com sucesso!`);
      carregarCupons();
    } catch (error) {
      toast.error('Erro ao gerar QR codes');
    } finally {
      setGerandoQr(null);
    }
  };

  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  const filtrarCupons = () => {
    return cupons.filter(c => 
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.descricao.toLowerCase().includes(search.toLowerCase()) ||
      (c.nomeProduto && c.nomeProduto.toLowerCase().includes(search.toLowerCase()))
    );
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
            <span className="font-medium text-gray-700 truncate max-w-[150px]">
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

  // 🔥 FUNÇÃO DE STATUS ATUALIZADA - CONSIDERA ativo E dataExpiracao
  const getStatusBadge = (cupom: Cupom) => {
    const expirado = new Date(cupom.dataExpiracao) < new Date();
    
    // Se já expirou, mostra expirado (independente do ativo)
    if (expirado) {
      return <Badge className="bg-red-100 text-red-700 text-[10px] sm:text-xs">Expirado</Badge>;
    }
    
    // Se não está ativo, mostra inativo
    if (!cupom.ativo) {
      return <Badge className="bg-gray-100 text-gray-700 text-[10px] sm:text-xs flex items-center gap-1">
        <Power className="h-2 w-2" />
        Inativo
      </Badge>;
    }
    
    // Se está ativo mas acabando os QR codes
    if ((cupom.qrCodesUsados / cupom.totalQrCodes) > 0.9) {
      return <Badge className="bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs">Acabando</Badge>;
    }
    
    // Ativo e normal
    return <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs flex items-center gap-1">
      <Power className="h-2 w-2" />
      Ativo
    </Badge>;
  };

  const getProgresso = (cupom: Cupom) => {
    const porcentagem = (cupom.qrCodesUsados / cupom.totalQrCodes) * 100;
    const disponiveis = cupom.totalQrCodes - cupom.qrCodesUsados;
    return {
      texto: `${cupom.qrCodesUsados}/${cupom.totalQrCodes}`,
      porcentagem,
      disponiveis
    };
  };

  if (loading && cupons.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando seus cupons...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Meus Cupons
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie os cupons da sua loja
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 sm:hidden">
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                <Tag className="h-3 w-3 mr-1" />
                {cupons.length}
              </Badge>
            </div>
            
            <Button 
              onClick={() => router.push('/dashboard-loja/cupons/novo')}
              className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden xs:inline">Novo Cupom</span>
              <span className="xs:hidden">Criar</span>
            </Button>
          </div>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código, descrição ou produto..."
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
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Produto / Descrição</TableHead>
                  <TableHead className="text-xs">Preços</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">QR Codes</TableHead>
                  <TableHead className="text-xs">Validade</TableHead>
                  <TableHead className="text-xs">Resgates</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarCupons().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <Tag className="h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-500">Nenhum cupom encontrado</p>
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/dashboard-loja/cupons/novo')}
                          className="mt-2"
                        >
                          Criar seu primeiro cupom
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrarCupons().map((cupom) => {
                    const progresso = getProgresso(cupom);
                    
                    return (
                      <TableRow key={cupom.id}>
                        <TableCell>
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                            <AvatarImage 
                              src={getImageUrl(cupom.logo)} 
                              alt={cupom.codigo}
                            />
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] sm:text-xs">
                              {cupom.codigo.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-medium text-xs sm:text-sm">
                              {cupom.codigo}
                            </span>
                            <button
                              onClick={() => handleCopiarCodigo(cupom.codigo)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {cupom.nomeProduto || cupom.descricao}
                            </span>
                            {cupom.nomeProduto && (
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                {cupom.descricao}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 min-w-[120px]">
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
                        <TableCell>{getStatusBadge(cupom)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <div className="flex justify-between text-[10px] sm:text-xs">
                              <span className="text-gray-600">
                                {progresso.disponiveis} disp.
                              </span>
                              <span className="text-gray-400">
                                {progresso.texto}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-1.5 bg-orange-500 rounded-full transition-all"
                                style={{ width: `${progresso.porcentagem}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs sm:text-sm whitespace-nowrap">
                            {new Date(cupom.dataExpiracao).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-orange-50 text-[10px] sm:text-xs">
                            {cupom._count?.resgates || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
      onClick={() => router.push(`/dashboard-loja/cupons/${cupom.id}`)}
      className="text-xs sm:text-sm cursor-pointer"
    >
      <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      Editar
    </DropdownMenuItem>
    
    <DropdownMenuItem
      onClick={() => router.push(`/dashboard-loja/cupons/${cupom.id}/estatisticas`)}
      className="text-xs sm:text-sm cursor-pointer"
    >
      <BarChart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      Estatísticas
    </DropdownMenuItem>
    
    {/* 🔥 REDIRECIONA PARA A PÁGINA DE GERENCIAR QR CODES */}
    <DropdownMenuItem
    onClick={() => router.push(`/dashboard-loja/cupons/${cupom.id}/gerenciar`)}
      className="text-xs sm:text-sm cursor-pointer"
    >
      <QrCode className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      Gerenciar QR
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem
      className="text-red-600 text-xs sm:text-sm cursor-pointer"
      onClick={() => handleDelete(cupom.id)}
    >
      <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      Excluir
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards para mobile/tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
          {filtrarCupons().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Tag className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum cupom encontrado</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard-loja/cupons/novo')}
                className="mt-4"
              >
                Criar seu primeiro cupom
              </Button>
            </div>
          ) : (
            filtrarCupons().map((cupom) => {
              const progresso = getProgresso(cupom);
              const expirado = new Date(cupom.dataExpiracao) < new Date();
              
              return (
                <Card key={cupom.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={getImageUrl(cupom.logo)} alt={cupom.codigo} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                            {cupom.codigo.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-medium text-xs sm:text-sm">
                              {cupom.codigo}
                            </span>
                            {getStatusBadge(cupom)}
                          </div>
                          <p className="text-xs text-gray-900 font-medium truncate">
                            {cupom.nomeProduto || cupom.descricao}
                          </p>
                          {cupom.nomeProduto && (
                            <p className="text-[10px] text-gray-500 truncate">
                              {cupom.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard-loja/cupons/${cupom.id}`)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard-loja/cupons/${cupom.id}/estatisticas`)}
                            className="text-xs cursor-pointer"
                          >
                            <BarChart className="mr-2 h-3 w-3" />
                            Estatísticas
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleGerarQrCodes(cupom.id)}
                            disabled={gerandoQr === cupom.id}
                            className="text-xs cursor-pointer"
                          >
                            {gerandoQr === cupom.id ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <QrCode className="mr-2 h-3 w-3" />
                            )}
                            Gerar QR
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 text-xs cursor-pointer"
                            onClick={() => handleDelete(cupom.id)}
                          >
                            <Trash className="mr-2 h-3 w-3" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Informações do card */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      {/* PREÇOS */}
                      {(cupom.precoOriginal || cupom.precoComDesconto || cupom.percentualDesconto) && (
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-700">Preços</span>
                            </div>
                            {cupom.percentualDesconto && (
                              <Badge className="bg-green-100 text-green-700 text-[8px] px-1">
                                -{cupom.percentualDesconto}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {cupom.precoOriginal && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatarPreco(cupom.precoOriginal)}
                              </span>
                            )}
                            {cupom.precoComDesconto && (
                              <span className="text-sm font-bold text-green-600">
                                {formatarPreco(cupom.precoComDesconto)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* QR Codes */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] sm:text-xs">
                          <span className="text-gray-500">QR Codes disponíveis</span>
                          <span className={cn(
                            "font-medium",
                            progresso.disponiveis < 10 ? 'text-red-600' : 'text-gray-900'
                          )}>
                            {progresso.disponiveis}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full",
                              expirado ? 'bg-gray-400' : 'bg-orange-500'
                            )}
                            style={{ width: `${progresso.porcentagem}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 text-right">
                          {progresso.texto} usados
                        </p>
                      </div>

                      {/* Validade e Resgates */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={cn(
                            "text-[10px] sm:text-xs",
                            expirado ? 'text-red-600' : 'text-gray-600'
                          )}>
                            {cupom.dataExpiracao ? new Date(cupom.dataExpiracao).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-gray-400" />
                          <span className="text-[10px] sm:text-xs text-gray-600">
                            {cupom._count?.resgates || 0} resgates
                          </span>
                        </div>
                      </div>

                      {/* Alerta de baixa quantidade */}
                      {progresso.disponiveis < 10 && !expirado && cupom.ativo && (
                        <div className="flex items-center gap-1 p-2 bg-yellow-50 rounded-lg mt-2">
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                          <span className="text-[10px] text-yellow-700">
                            Apenas {progresso.disponiveis} QR codes restantes
                          </span>
                        </div>
                      )}
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
          <span>
            {cupons.filter(c => c.ativo && new Date(c.dataExpiracao) >= new Date() && (c.qrCodesUsados / c.totalQrCodes) <= 0.9).length} ativos
          </span>
        </div>
      </div>
    </ProtectedRoute>
  );
}