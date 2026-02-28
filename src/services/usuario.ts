import api from './api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'superadmin' | 'admin' | 'loja';
  lojaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  role: 'superadmin' | 'admin' | 'loja';
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  senha?: string;
  role?: 'superadmin' | 'admin' | 'loja';
}

class UsuarioService {
  async listarTodos(): Promise<Usuario[]> {
    const response = await api.get('/usuarios');
    return response.data;
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data; 
  }

  async criar(data: CreateUsuarioDTO): Promise<Usuario> {
    const response = await api.post('/usuarios', data);
    return response.data;
  }

  async atualizar(id: string, data: UpdateUsuarioDTO): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  }

  async deletar(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  async buscarPerfil(): Promise<Usuario> {
    const response = await api.get('/usuarios/perfil');
    console.log('Headers enviados:', api.defaults.headers);

    return response.data;
  }
}

export default new UsuarioService();