'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Sparkles 
} from 'lucide-react';
import authService from '@/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await authService.login({ email, senha });
      
      if (response.success) {
        toast.success('Login realizado!', {
          description: `Bem-vindo, ${response.data.usuario.nome}!`,
        });
        
        const role = response.data.usuario.role;
        const destino = role === 'loja' ? '/dashboard-loja' : '/dashboard';
        
        window.location.href = destino;
      }
      
    } catch (error: any) {
      toast.error('Erro no login', {
        description: error.response?.data?.error || 'Erro ao fazer login',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6">
      {/* Elementos decorativos de fundo - responsivos */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] sm:bg-[size:50px_50px]" />
      
      {/* Anéis de gradiente animados - responsivos */}
      <div className="absolute top-0 -left-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 sm:bottom-40 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-[90%] sm:max-w-md px-2 sm:px-4">
        {/* Logo e título animados */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-3 sm:mb-4 animate-float">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            RadioCupon
          </h1>
          <p className="text-sm sm:text-base text-blue-200">
            Área Restrita
          </p>
        </div>

        {/* Card de login com glassmorphism */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-white">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-center text-blue-200">
              Utilize suas credenciais para entrar
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              {/* Campo de email */}
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm text-blue-100">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo de senha */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha" className="text-xs sm:text-sm text-blue-100">
                    Senha
                  </Label>
                  <button
                    type="button"
                    className="text-[10px] sm:text-xs text-blue-300 hover:text-blue-100 transition-colors"
                    onClick={() => toast.info('Entre em contato com o suporte')}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-300" />
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de login */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 sm:py-6 text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] mt-2 sm:mt-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Copyright */}
        <p className="text-center text-[10px] sm:text-xs text-blue-300/70 mt-4 sm:mt-6">
          © {new Date().getFullYear()} RadioCupon. Todos os direitos reservados.
        </p>
      </div>

      {/* Animações customizadas */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.1); }
          66% { transform: translate(-15px, 15px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}