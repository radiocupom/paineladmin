'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Store, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PerfilPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-xs sm:text-sm text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="text-center">
          <User className="h-8 w-8 sm:h-12 sm:w-12 text-red-300 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-red-500">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const roleLabels = {
    superadmin: { label: 'Super Administrador', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
    loja: { label: 'Lojista', color: 'bg-green-100 text-green-700' }
  };

  const roleInfo = roleLabels[user.role as keyof typeof roleLabels] || roleLabels.loja;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
        Meu Perfil
      </h1>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Informações do Usuário</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Seus dados de acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
          {/* Nome */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 xs:w-24 sm:w-28">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-500 xs:hidden">Nome</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs hidden xs:block xs:text-sm text-gray-500">Nome</p>
              <p className="text-sm sm:text-base font-medium break-all">{user.nome}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 xs:w-24 sm:w-28">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-500 xs:hidden">Email</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs hidden xs:block xs:text-sm text-gray-500">Email</p>
              <p className="text-sm sm:text-base break-all">{user.email}</p>
            </div>
          </div>

          {/* Nível de Acesso */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 xs:w-24 sm:w-28">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-500 xs:hidden">Acesso</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs hidden xs:block xs:text-sm text-gray-500">Nível de Acesso</p>
              <Badge className={cn(
                roleInfo.color,
                "text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 mt-1 xs:mt-0"
              )}>
                {roleInfo.label}
              </Badge>
            </div>
          </div>

          {/* ID da Loja (se existir) */}
          {user.lojaId && (
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 xs:w-24 sm:w-28">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-500 xs:hidden">ID Loja</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs hidden xs:block xs:text-sm text-gray-500">ID da Loja</p>
                <p className="text-xs sm:text-sm font-mono break-all bg-white p-1.5 sm:p-2 rounded border">
                  {user.lojaId}
                </p>
              </div>
            </div>
          )}

          {/* Data de cadastro (se disponível) */}
          {(user as any).createdAt && (
            <div className="text-[10px] sm:text-xs text-gray-400 text-right mt-2">
              Cadastro: {new Date((user as any).createdAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações adicionais para mobile */}
      <div className="text-center text-[10px] sm:text-xs text-gray-400">
        Último acesso: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}