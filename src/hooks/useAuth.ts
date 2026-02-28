'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService, { LoginCredentials, AuthResponse, Usuario } from '@/services/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Só executa no cliente
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.data.usuario);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: typeof window !== 'undefined' ? authService.isAuthenticated() : false,
  };
}