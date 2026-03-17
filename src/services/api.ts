import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.radiocupom.online/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@raiocupon:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta fazer refresh do token
        const refreshToken = localStorage.getItem('@raiocupon:refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          localStorage.setItem('@raiocupon:token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se refresh falhar, redireciona para login
        localStorage.removeItem('@raiocupon:token');
        localStorage.removeItem('@raiocupon:refreshToken');
        localStorage.removeItem('@raiocupon:user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;