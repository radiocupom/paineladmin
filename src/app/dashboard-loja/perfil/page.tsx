'use client';

import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, Store, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PerfilPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Usuário não encontrado</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const roleLabel = {
    loja: { label: 'Lojista', color: 'bg-green-100 text-green-700' },
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
    superadmin: { label: 'Super Administrador', color: 'bg-purple-100 text-purple-700' }
  }[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700' };

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Meu Perfil
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Informações da sua conta de acesso
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              Dados do Lojista
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
            {/* Nome */}
            <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 xs:w-24 sm:w-28">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-500 xs:hidden">Nome</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs hidden xs:block xs:text-sm text-gray-500 mb-1">Nome</p>
                <p className="text-sm sm:text-base font-medium break-all">{user.nome}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 xs:w-24 sm:w-28">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-500 xs:hidden">Email</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs hidden xs:block xs:text-sm text-gray-500 mb-1">Email</p>
                <p className="text-sm sm:text-base break-all">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 xs:w-24 sm:w-28">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-500 xs:hidden">Acesso</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs hidden xs:block xs:text-sm text-gray-500 mb-1">Nível de Acesso</p>
                <Badge className={cn(
                  roleLabel.color,
                  "text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                )}>
                  {roleLabel.label}
                </Badge>
              </div>
            </div>

            {/* ID da Loja (se tiver) */}
            {(user as any).lojaId && (
              <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 xs:w-24 sm:w-28">
                  <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-500 xs:hidden">ID Loja</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs hidden xs:block xs:text-sm text-gray-500 mb-1">ID da Loja</p>
                  <p className="text-xs sm:text-sm font-mono break-all bg-white p-1.5 sm:p-2 rounded border">
                    {(user as any).lojaId}
                  </p>
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex flex-col xs:flex-row justify-between gap-2 text-[10px] sm:text-xs text-gray-400 pt-2">
              {(user as any).createdAt && (
                <span>Cadastro: {new Date((user as any).createdAt).toLocaleDateString('pt-BR')}</span>
              )}
              <span>Último acesso: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card de informações da loja (se houver) */}
        {(user as any).loja && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Informações da Loja
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Nome da Loja</p>
                  <p className="text-xs sm:text-sm font-medium">{(user as any).loja.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Email da Loja</p>
                  <p className="text-xs sm:text-sm break-all">{(user as any).loja.email}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Categoria</p>
                  <p className="text-xs sm:text-sm">{(user as any).loja.categoria}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Status</p>
                  <Badge className={cn(
                    (user as any).loja.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
                    "text-[10px] sm:text-xs"
                  )}>
                    {(user as any).loja.payment ? 'Ativo' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}