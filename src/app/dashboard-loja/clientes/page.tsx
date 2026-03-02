// app/dashboard-loja/clientes/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ← IMPORT DO LINK
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  User,
  Phone,
  MapPin,
  Loader2,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import clienteService, { ClienteWithResgates } from '@/services/cliente';

interface Usuario {
  id: string;
  lojaId?: string;
  loja?: {
    id: string;
    nome: string;
  };
  role: string;
}

interface ClienteLoja {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade?: string;        // ← TORNAR OPCIONAL
  estado?: string;         // ← TORNAR OPCIONAL
  genero?: string;         // ← TORNAR OPCIONAL
  dataNascimento?: string; // ← TORNAR OPCIONAL
  primeiroResgate: string | null;
  ultimoResgate: string | null;
  totalResgates: number;
  totalCupons: number;
  cuponsResgatados: Array<{
    id: string;
    cupomId: string;
    cupomCodigo: string;
    cupomDescricao: string;
    quantidade: number;
    data: string;
    cupom: {
      codigo: string;
      descricao: string;
      logo?: string;
    };
  }>;
}

export default function ClientesLojaPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: Usuario | null };
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteLoja[]>([]);
  const [search, setSearch] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('resgates');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
  try {
    setLoading(true);
    
    const lojaId = user?.loja?.id || user?.lojaId;
    
    if (!lojaId) {
      toast.error('ID da loja não encontrado');
      return;
    }

    console.log('📤 Buscando clientes da loja:', lojaId);
    const clientesData = await clienteService.listarClientesLoja(lojaId);
    
    console.log('📦 Dados recebidos da API:', clientesData);
    console.log('📦 Total de clientes:', clientesData?.length || 0);

    // 🔥 ADAPTA OS DADOS para o formato esperado pelo componente
    const clientesAdaptados = clientesData.map((cliente: any) => {
      const resgates = cliente.resgates || [];
      
      // Calcula primeiro e último resgate
      let primeiroResgate = null;
      let ultimoResgate = null;
      
      if (resgates.length > 0) {
        const datas = resgates.map((r: any) => new Date(r.resgatadoEm).getTime());
        primeiroResgate = new Date(Math.min(...datas)).toISOString();
        ultimoResgate = new Date(Math.max(...datas)).toISOString();
      }

      return {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        whatsapp: cliente.whatsapp,
        cidade: cliente.cidade,
        estado: cliente.estado,
        genero: cliente.genero,
        dataNascimento: cliente.dataNascimento,
        primeiroResgate,
        ultimoResgate,
        totalResgates: resgates.length,
        totalCupons: new Set(resgates.map((r: any) => r.cupom.id)).size,
        cuponsResgatados: resgates.map((r: any) => ({
          id: r.id,
          cupomId: r.cupom.id,
          cupomCodigo: r.cupom.codigo,
          cupomDescricao: r.cupom.descricao,
          quantidade: r.quantidade,
          data: r.resgatadoEm,
          cupom: {
            codigo: r.cupom.codigo,
            descricao: r.cupom.descricao,
          }
        }))
      };
    });

    console.log('✅ Clientes adaptados:', clientesAdaptados);
    setClientes(clientesAdaptados);

  } catch (error) {
    console.error('❌ Erro ao carregar clientes:', error);
    toast.error('Erro ao carregar clientes');
  } finally {
    setLoading(false);
  }
};

  const getDadosGraficoTopClientes = () => {
    if (clientes.length === 0) return [];
    
    return [...clientes]
      .sort((a, b) => (b.totalResgates || 0) - (a.totalResgates || 0))
      .slice(0, 5)
      .map(c => ({
        nome: c.nome.split(' ')[0] || c.nome,
        resgates: c.totalResgates || 0
      }));
  };

  const getDadosGraficoDistribuicao = () => {
    if (clientes.length === 0) return [];
    
    const faixas = {
      '1-5': clientes.filter(c => (c.totalResgates || 0) >= 1 && (c.totalResgates || 0) <= 5).length,
      '6-10': clientes.filter(c => (c.totalResgates || 0) >= 6 && (c.totalResgates || 0) <= 10).length,
      '11-15': clientes.filter(c => (c.totalResgates || 0) >= 11 && (c.totalResgates || 0) <= 15).length,
      '16+': clientes.filter(c => (c.totalResgates || 0) > 15).length
    };

    return Object.entries(faixas)
      .filter(([_, valor]) => valor > 0)
      .map(([faixa, valor]) => ({
        faixa,
        valor
      }));
  };

  const filtrarClientes = (): ClienteLoja[] => {
    let filtrados = [...clientes];

    if (search) {
      filtrados = filtrados.filter(c => 
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.whatsapp.includes(search)
      );
    }

    if (filtroPeriodo !== 'todos') {
      const hoje = new Date();
      const limite = new Date();

      switch (filtroPeriodo) {
        case '30dias':
          limite.setDate(hoje.getDate() - 30);
          break;
        case '90dias':
          limite.setDate(hoje.getDate() - 90);
          break;
        case 'ano':
          limite.setFullYear(hoje.getFullYear() - 1);
          break;
      }

      filtrados = filtrados.filter(c => 
        c.ultimoResgate && new Date(c.ultimoResgate) >= limite
      );
    }

    switch (ordenarPor) {
      case 'nome':
        filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'resgates':
        filtrados.sort((a, b) => (b.totalResgates || 0) - (a.totalResgates || 0));
        break;
      case 'recente':
        filtrados.sort((a, b) => {
          if (!a.ultimoResgate) return 1;
          if (!b.ultimoResgate) return -1;
          return new Date(b.ultimoResgate).getTime() - new Date(a.ultimoResgate).getTime();
        });
        break;
    }

    return filtrados;
  };

  const formatarData = (data: string | null): string => {
    if (!data) return 'Nunca';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: string | null): string => {
    if (!data) return 'Nunca';
    return new Date(data).toLocaleString('pt-BR');
  };

  const calcularIdade = (dataNascimento: string): number => {
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const clientesFiltrados = filtrarClientes();
  const dadosTopClientes = getDadosGraficoTopClientes();
  const dadosDistribuicao = getDadosGraficoDistribuicao();
  const CORES = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fecaca'];

  // Calcular totais com proteção contra NaN
  const totalClientes = clientes.length;
  const totalResgates = clientes.reduce((acc, c) => acc + (c.totalResgates || 0), 0);
  const mediaResgates = totalClientes > 0 ? (totalResgates / totalClientes).toFixed(1) : '0';
  
  const clienteTop = clientes.length > 0 
    ? [...clientes].sort((a, b) => (b.totalResgates || 0) - (a.totalResgates || 0))[0]
    : null;

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-500 mt-1">
              Clientes que resgataram cupons da sua loja
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={ordenarPor} onValueChange={setOrdenarPor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resgates">Mais resgates</SelectItem>
                <SelectItem value="recente">Mais recentes</SelectItem>
                <SelectItem value="nome">Nome</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <p className="text-xs text-gray-500 mt-1">
                clientes únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Resgates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResgates}</div>
              <p className="text-xs text-gray-500 mt-1">
                em todos os cupons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Média por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaResgates}</div>
              <p className="text-xs text-gray-500 mt-1">
                resgates/cliente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Cliente Top
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {clienteTop?.nome || '-'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {clienteTop?.totalResgates || 0} resgates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clientes</CardTitle>
              <CardDescription>
                Clientes com mais resgates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dadosTopClientes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosTopClientes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="resgates" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Resgates</CardTitle>
              <CardDescription>
                Quantidade de clientes por faixa de resgates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dadosDistribuicao.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosDistribuicao}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => {
                          const percentage = percent ? (percent * 100).toFixed(0) : 0;
                          return `${name}: ${value} (${percentage}%)`;
                        }}
                        outerRadius={100}
                        dataKey="valor"
                        nameKey="faixa"
                      >
                        {dadosDistribuicao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro de busca */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>
              Encontre clientes por nome, email ou WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite para buscar..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientesFiltrados.length} clientes encontrados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Total Resgates</TableHead>
                  <TableHead>Último Resgate</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">Nenhum cliente encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {cliente.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-xs text-gray-500">{cliente.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{cliente.whatsapp}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{cliente.cidade}/{cliente.estado}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50">
                          {cliente.totalResgates} resgates
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatarData(cliente.ultimoResgate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* 🔥 LINK PARA A PÁGINA DE DETALHES DO CLIENTE */}
                        <Link href={`/dashboard-loja/clientes/${cliente.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 🔥 REMOVIDO O MODAL DE DETALHES - AGORA USA A PÁGINA SEPARADA */}
      </div>
    </ProtectedRoute>
  );
}