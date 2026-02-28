import api from './api';
import Cookies from 'js-cookie';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'superadmin' | 'admin' | 'loja';
  lojaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    usuario: Usuario;
    token: string;
    expiresIn: string;
  };
}

class AuthService {
  // Verifica se está no navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔵 [AuthService] Tentando login com:', { 
      email: credentials.email,
      senha: '***' 
    });
    
    console.log('🔵 [AuthService] URL da API:', process.env.NEXT_PUBLIC_API_URL);
    
    try {
      console.log('🔵 [AuthService] Enviando requisição para /auth/login');
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      console.log('🟢 [AuthService] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      if (response.data.success && response.data.data.token) {
        console.log('🟢 [AuthService] Login bem-sucedido, salvando dados...');
        
        const token = response.data.data.token;
        const usuario = response.data.data.usuario;
        
        // Só executa no navegador
        if (this.isBrowser()) {
          // Salvar no localStorage
          localStorage.setItem('@raiocupon:token', token);
          localStorage.setItem('@raiocupon:user', JSON.stringify(usuario));
          
          // Salvar no cookie (para o middleware)
          Cookies.set('@raiocupon:token', token, { 
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
          
          if (usuario.lojaId) {
            localStorage.setItem('@raiocupon:lojaId', usuario.lojaId);
          }
        }
        
        console.log('🟢 [AuthService] Dados salvos no localStorage e cookies');
      }
      
      return response.data;
    } catch (error: any) {
      console.log('🔴 [AuthService] Erro no login:');
      
      if (error.response) {
        console.log('🔴 [AuthService] Status do erro:', error.response.status);
        console.log('🔴 [AuthService] Dados do erro:', error.response.data);
        console.log('🔴 [AuthService] Headers:', error.response.headers);
      } else if (error.request) {
        console.log('🔴 [AuthService] Sem resposta do servidor');
        console.log('🔴 [AuthService] Request:', error.request);
      } else {
        console.log('🔴 [AuthService] Erro na configuração:', error.message);
      }
      
      console.log('🔴 [AuthService] Config da requisição:', error.config);
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('🔵 [AuthService] Fazendo logout');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('🔴 [AuthService] Erro no logout:', error);
    } finally {
      this.clearStorage();
    }
  }

  clearStorage(): void {
    console.log('🔵 [AuthService] Limpando localStorage e cookies');
    
    // Só executa no navegador
    if (this.isBrowser()) {
      // Limpar localStorage
      localStorage.removeItem('@raiocupon:token');
      localStorage.removeItem('@raiocupon:user');
      localStorage.removeItem('@raiocupon:lojaId');
      
      // Limpar cookie
      Cookies.remove('@raiocupon:token', { path: '/' });
    }
  }

  getCurrentUser(): Usuario | null {
    // Só executa no navegador
    if (!this.isBrowser()) {
      return null;
    }
    
    const userStr = localStorage.getItem('@raiocupon:user');
    console.log('🔵 [AuthService] getCurrentUser:', userStr ? 'usuário encontrado' : 'nenhum usuário');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    // Só executa no navegador
    if (!this.isBrowser()) {
      return false;
    }
    
    const token = localStorage.getItem('@raiocupon:token');
    const cookieToken = Cookies.get('@raiocupon:token');
    
    console.log('🔵 [AuthService] isAuthenticated - localStorage:', !!token);
    console.log('🔵 [AuthService] isAuthenticated - cookie:', !!cookieToken);
    
    return !!token || !!cookieToken;
  }

  getToken(): string | null {
    // Só executa no navegador
    if (!this.isBrowser()) {
      return null;
    }
    
    // Tenta pegar do localStorage primeiro, depois do cookie
    return localStorage.getItem('@raiocupon:token') || Cookies.get('@raiocupon:token') || null;
  }

  getLojaId(): string | null {
    // Só executa no navegador
    if (!this.isBrowser()) {
      return null;
    }
    
    return localStorage.getItem('@raiocupon:lojaId');
  }

  hasRole(roles: Array<'superadmin' | 'admin' | 'loja'>): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }
}

export default new AuthService();