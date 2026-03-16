// app/dashboard-loja/validar/dados/[qrCodeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  User, 
  Tag, 
  Store,
  Calendar,
  QrCode,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// 🔥 INTERFACES PARA TIPAGEM
interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
}

interface Loja {
  id: string;
  nome: string;
  logo?: string;
  payment?: boolean;
}

interface Cupom {
  id: string;
  codigo: string;
  descricao: string;
  titulo?: string;
  nomeProduto?: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  dataExpiracao: string;
  termos?: string;
  observacoes?: string;
  loja: Loja;
}

interface QRCodeInfo {
  id: string;
  codigo: string;
  usadoEm: string;
  validado: boolean;
  validadoEm?: string;
}

interface StatusValidacao {
  podeValidar: boolean;
  motivos: string[];
}

interface DadosQRCode {
  cliente: Cliente;
  cupom: Cupom;
  qrCode: QRCodeInfo;
  status: StatusValidacao;
}

export default function ValidarQRCodePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const qrCodeId = params.qrCodeId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosQRCode | null>(null); // 🔥 TIPADO
  const [validando, setValidando] = useState(false);
  const [validado, setValidado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [podeValidar, setPodeValidar] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('@radiocupon:redirectAfterLogin', window.location.pathname);
      router.push('/login?role=loja');
    }
  }, [user, authLoading, router]);

  // Carregar dados (USA A NOVA ROTA GET)
  const carregarDados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@raiocupon:token');
      
      const response = await fetch(
        `https://api.radiocupom.online/api/front/qrcode/dados/${qrCodeId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setDados(data.data as DadosQRCode); // 🔥 CAST
        
        // Verificar status retornado
        if (data.data.status) {
          setPodeValidar(data.data.status.podeValidar);
          if (!data.data.status.podeValidar) {
            setMensagem(data.data.status.motivos.join(', '));
          }
        }
        
        // Se já estiver validado
        if (data.data.qrCode.validado) {
          setValidado(true);
          setMensagem('Este QR code já foi utilizado em ' + 
            new Date(data.data.qrCode.validadoEm).toLocaleString('pt-BR'));
        }
      } else {
        setError(data.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Validar QR code
  const handleValidar = async () => {
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
        body: JSON.stringify({ qrCodeId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setValidado(true);
        setMensagem('✅ QR Code validado com sucesso!');
        setPodeValidar(false);
        
        // 🔥 ATUALIZAR DADOS COM TIPAGEM CORRETA
        setDados(prev => {
          if (!prev) return null;
          return {
            ...prev,
            qrCode: {
              ...prev.qrCode,
              validado: true,
              validadoEm: new Date().toISOString()
            }
          };
        });
        
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

  // Carregar dados automaticamente ao abrir a página
  useEffect(() => {
    if (user && qrCodeId) {
      carregarDados();
    }
  }, [user, qrCodeId]);

  // Loading states...
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-600 mb-4" />
              <p className="text-gray-600">Carregando dados do QR code...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  // Se tiver erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">QR Code Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/dashboard/dashboard-loja')}
              variant="outline"
              className="w-full"
            >
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não tiver dados
  if (!dados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhum dado encontrado</p>
            <Button 
              onClick={() => router.push('/dashboard/dashboard-loja')}
              variant="outline"
              className="w-full mt-4"
            >
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { cliente, cupom, qrCode, status } = dados;

  // Determinar cor e ícone do status
  const getStatusConfig = () => {
    if (validado) {
      return {
        bg: "bg-green-600",
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: "QR CODE VALIDADO"
      };
    }
    if (!podeValidar) {
      return {
        bg: "bg-red-600",
        icon: <Ban className="h-4 w-4" />,
        text: "NÃO PODE SER VALIDADO"
      };
    }
    return {
      bg: "bg-blue-600",
      icon: <QrCode className="h-4 w-4" />,
      text: "AGUARDANDO CONFIRMAÇÃO"
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-4 sm:py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg p-3 mb-1 shadow-sm">
          <p className="text-xs text-gray-600">
            Logado como: <span className="font-medium">{user.nome || user.email}</span>
          </p>
        </div>

        {/* Card Principal */}
        <Card className={`border-2 transition-colors ${
          validado ? "border-green-300" : !podeValidar ? "border-red-300" : "border-blue-200"
        }`}>
          {/* Status Badge */}
          <div className={`p-3 text-center text-white font-medium text-sm ${statusConfig.bg}`}>
            <div className="flex items-center justify-center gap-2">
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Mensagem de situação */}
            {mensagem && (
              <Alert variant={validado ? 'default' : 'destructive'}>
                <AlertDescription className="text-xs sm:text-sm">
                  {mensagem}
                </AlertDescription>
              </Alert>
            )}

            {/* Motivos (se não puder validar) */}
            {!podeValidar && !validado && status?.motivos && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-red-800 mb-1">Motivos:</p>
                <ul className="list-disc list-inside">
                  {status.motivos.map((motivo: string, index: number) => (
                    <li key={index} className="text-xs text-red-600">{motivo}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dados do Cliente */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <User className="h-4 w-4" />
                <span className="text-xs font-semibold">DADOS DO CLIENTE</span>
              </div>
              <p className="font-medium text-sm sm:text-base break-words">{cliente.nome}</p>
              <p className="text-xs text-gray-600 break-words mt-1">{cliente.email}</p>
              {cliente.whatsapp && (
                <p className="text-xs text-gray-600 mt-1">{cliente.whatsapp}</p>
              )}
            </div>

            {/* Dados do Cupom */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Tag className="h-4 w-4" />
                <span className="text-xs font-semibold">DADOS DO CUPOM</span>
              </div>
              <p className="font-medium text-sm sm:text-base">{cupom.descricao}</p>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Store className="h-3 w-3" />
                  <span>{cupom.loja.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Válido até {new Date(cupom.dataExpiracao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Informação do QR Code */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">
                Código: <span className="font-mono">{qrCode.codigo}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Resgatado em: {new Date(qrCode.usadoEm).toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Botão de confirmar validação */}
            {podeValidar && !validado && (
              <Button
                onClick={handleValidar}
                disabled={validando}
                className="w-full h-12 text-base gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {validando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {validando ? 'Validando...' : 'CONFIRMAR VALIDAÇÃO'}
              </Button>
            )}

            {/* Botão voltar */}
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/dashboard-loja')}
              className="w-full h-10 text-sm"
            >
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}