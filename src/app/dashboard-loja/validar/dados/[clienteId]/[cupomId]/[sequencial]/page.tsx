// app/validar/dados/[clienteId]/[cupomId]/[sequencial]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  User, 
  Tag, 
  Hash,
  Store,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface DadosValidacao {
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp?: string;
  };
  cupom: {
    id: string;
    codigo: string;
    descricao: string;
    loja: {
      nome: string;
    };
    dataExpiracao: string;
  };
}

export default function ValidarQRCodePage() {
  const { user, loading: authLoading } = useAuth(); // 🔥 CORRIGIDO: loading ao invés de isLoading
  const router = useRouter();
  const params = useParams();
  
  const clienteId = params.clienteId as string;
  const cupomId = params.cupomId as string;
  const sequencial = params.sequencial as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosValidacao | null>(null);
  const [validando, setValidando] = useState(false);
  const [validado, setValidado] = useState(false);
  const [codigoLoja, setCodigoLoja] = useState('');
  const [mensagem, setMensagem] = useState('');

  // 🔥 VERIFICAR AUTENTICAÇÃO PRIMEIRO
  useEffect(() => {
    if (!authLoading && !user) {
      // Salvar a URL atual para redirecionar de volta após o login
      localStorage.setItem('@radiocupon:redirectAfterLogin', window.location.pathname);
      router.push('/login?role=loja');
    }
  }, [user, authLoading, router]);

  // Buscar dados do cliente e cupom (só se estiver autenticado)
  useEffect(() => {
    const buscarDados = async () => {
      if (!user) return; // 🔥 Só busca se estiver logado
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('@raiocupon:token');
        
        const response = await fetch(
          `https://api.radiocupom.online/api/front/validar/dados/${clienteId}/${cupomId}/${sequencial}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expirado, redirecionar para login
            localStorage.removeItem('@raiocupon:token');
            router.push('/login?role=loja');
            return;
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao carregar dados');
        }

        const data = await response.json();
        
        if (!data.cliente || !data.cupom) {
          throw new Error('Dados incompletos');
        }

        setDados(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (clienteId && cupomId && sequencial && user) {
      buscarDados();
    }
  }, [clienteId, cupomId, sequencial, user, router]);

  // Função para validar o QR code
  const handleValidar = async () => {
    if (!codigoLoja.trim()) {
      toast.error('Digite o código do QR code');
      return;
    }

    try {
      setValidando(true);
      setMensagem('');

      const token = localStorage.getItem('@raiocupon:token');
      
      const response = await fetch('https://api.radiocupom.online/api/front/validar-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo: codigoLoja.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setValidado(true);
        setMensagem('✅ QR Code validado com sucesso!');
        toast.success('QR Code validado!');
      } else {
        setMensagem(data.error || 'Erro ao validar QR code');
        toast.error(data.error || 'Erro na validação');
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor');
      toast.error('Erro ao validar');
    } finally {
      setValidando(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-600 mb-4" />
              <p className="text-gray-600">Verificando autenticação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não tem user, não renderiza nada (o useEffect já redirecionou)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-600 mb-4" />
              <p className="text-gray-600">Carregando dados do resgate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">QR Code Inválido</CardTitle>
            <CardDescription className="text-red-600">
              Não foi possível carregar os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-gray-500 mb-4">
              <p>ID: {clienteId?.substring(0, 8)}...</p>
              <p>Protocolo: {sequencial}</p>
            </div>

            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhum dado encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-4 sm:py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header com info do lojista */}
        <div className="bg-white rounded-t-lg p-3 mb-1 shadow-sm">
          <p className="text-xs text-gray-600">
            Logado como: <span className="font-medium">{user.nome || user.email}</span>
          </p>
        </div>

        {/* Card Principal */}
        <Card className={cn(
          "border-2 transition-colors",
          validado ? "border-green-300" : "border-orange-200"
        )}>
          {/* Status Badge */}
          <div className={cn(
            "p-3 text-center text-white font-medium text-sm",
            validado ? "bg-green-600" : "bg-orange-600"
          )}>
            {validado ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>QR CODE VALIDADO</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Hash className="h-4 w-4" />
                <span>AGUARDANDO VALIDAÇÃO</span>
              </div>
            )}
          </div>

          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Sequencial */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Hash className="h-3 w-3" />
                <span className="text-xs">Código de Validação</span>
              </div>
              <p className="text-lg sm:text-xl font-mono font-bold text-center bg-white p-2 rounded border">
                {sequencial}
              </p>
              <p className="text-[10px] text-gray-400 text-center mt-1">
                Confira se este número corresponde ao QR code
              </p>
            </div>

            {/* Dados do Cliente */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <User className="h-4 w-4" />
                <span className="text-xs font-semibold">DADOS DO CLIENTE</span>
              </div>
              <p className="font-medium text-sm sm:text-base break-words">{dados.cliente.nome}</p>
              <p className="text-xs text-gray-600 break-words mt-1">{dados.cliente.email}</p>
              {dados.cliente.whatsapp && (
                <p className="text-xs text-gray-600 mt-1">{dados.cliente.whatsapp}</p>
              )}
            </div>

            {/* Dados do Cupom */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Tag className="h-4 w-4" />
                <span className="text-xs font-semibold">DADOS DO CUPOM</span>
              </div>
              <p className="font-medium text-sm sm:text-base">{dados.cupom.descricao}</p>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Store className="h-3 w-3" />
                  <span>{dados.cupom.loja.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Válido até {new Date(dados.cupom.dataExpiracao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Formulário de Validação */}
            {!validado ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Código do QR Code
                  </label>
                  <Input
                    placeholder="Digite o código do QR code"
                    value={codigoLoja}
                    onChange={(e) => setCodigoLoja(e.target.value)}
                    disabled={validando}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    O código está na parte inferior do QR code
                  </p>
                </div>

                {mensagem && (
                  <Alert variant={mensagem.includes('sucesso') ? 'default' : 'destructive'}>
                    <AlertDescription className="text-xs sm:text-sm">
                      {mensagem}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleValidar}
                  disabled={validando || !codigoLoja.trim()}
                  className="w-full h-9 sm:h-10 text-sm gap-2"
                >
                  {validando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {validando ? 'Validando...' : 'Confirmar Validação'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-3">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Resgate validado com sucesso!</p>
                  <p className="text-xs mt-1">O cliente já pode utilizar o benefício</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full h-8 text-xs"
                >
                  Validar Outro QR Code
                </Button>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="text-[10px] text-gray-400 text-center border-t pt-3">
              <p>Loja: {dados.cupom.loja.nome}</p>
              <p className="mt-1">Protocolo: {clienteId.substring(0, 4)}.../{cupomId.substring(0, 4)}/{sequencial}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function para className condicional
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}