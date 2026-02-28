'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'superadmin' | 'admin' | 'loja'>;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['superadmin', 'admin'] // por padrão, apenas admin e superadmin
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      // Verificar se o role do usuário está permitido
      if (!allowedRoles.includes(user.role)) {
        // Se for loja tentando acessar rota de admin, redireciona
        if (user.role === 'loja') {
          router.push('/dashboard-loja');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}