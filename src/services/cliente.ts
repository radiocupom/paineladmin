import api from './api';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais: string;
  genero?: string;
  dataNascimento?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas: boolean;
  comoConheceu?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  ultimoLogin?: string;
}

export interface CreateClienteDTO {
  nome: string;
  email: string;
  senha: string;
  whatsapp: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  dataNascimento?: string;
  pais?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas?: boolean;
  comoConheceu?: string;
  observacoes?: string;
}

export interface UpdateClienteDTO {
  nome?: string;
  email?: string;
  senha?: string;
  whatsapp?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  dataNascimento?: string;
  pais?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas?: boolean;
  comoConheceu?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface CupomResgate {
  id: string;
  codigo: string;
  descricao: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  nomeProduto?: string;
  loja?: {
    nome: string;
    logo: string;
  };
}

export interface Resgate {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  cupomId: string;
  cupom: CupomResgate;
  qrCodeValidado?: boolean;
  qrCodeValidadoEm?: string | null;
}

export interface ClienteWithResgates extends Cliente {
  resgates: Resgate[];
}

export interface EstatisticasCliente {
  cliente: Cliente;
  estatisticas: {
    totalResgates: number;
    cuponsUnicos: number;
    totalQuantidade: number;
    ultimoResgate: {
      data: string;
      cupomId: string;
    } | null;
  };
}

class ClienteService {
  /**
   * Listar todos os clientes (admin/superadmin)
   */
  async listarTodos(): Promise<Cliente[]> {
    const response = await api.get('/clientes');
    return response.data;
  }

  /**
   * Buscar cliente por ID
   */
  async buscarPorId(id: string): Promise<Cliente> {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  }

  /**
   * Buscar cliente por email
   */
  async buscarPorEmail(email: string): Promise<Cliente> {
    const response = await api.get(`/clientes/email/${email}`);
    return response.data;
  }

  /**
   * Buscar cliente com resgates
   */
  async buscarComResgates(id: string): Promise<ClienteWithResgates> {
    const response = await api.get(`/clientes/${id}/resgates`);
    return response.data;
  }

  /**
   * Buscar estatísticas do cliente
   */
  async getEstatisticas(id: string): Promise<EstatisticasCliente> {
    const response = await api.get(`/clientes/${id}/estatisticas`);
    return response.data;
  }

  /**
   * Criar cliente
   */
  async criar(data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.post('/clientes/registro', data);
    return response.data;
  }

  /**
   * Atualizar cliente
   */
  async atualizar(id: string, data: UpdateClienteDTO): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  }

  /**
   * Deletar cliente (apenas superadmin)
   */
  async deletar(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  }

  /**
   * Ativar/desativar cliente
   */
  async toggleStatus(id: string, ativo: boolean): Promise<Cliente> {
    return this.atualizar(id, { ativo });
  }

  // ================= MÉTODOS PARA O PRÓPRIO CLIENTE =================
  
  /**
   * Buscar perfil do cliente logado
   */
  async getPerfil(): Promise<Cliente> {
    const response = await api.get('/clientes/perfil');
    return response.data;
  }

  /**
   * Atualizar perfil do cliente logado
   */
  async atualizarPerfil(data: UpdateClienteDTO): Promise<Cliente> {
    const response = await api.put('/clientes/perfil', data);
    return response.data;
  }

  /**
   * Buscar resgates do próprio cliente
   */
  async getMeusResgates(): Promise<Resgate[]> {
    const response = await api.get('/clientes/perfil/resgates');
    return response.data;
  }

  /**
   * Listar clientes da loja
   */
  async listarClientesLoja(lojaId: string): Promise<ClienteWithResgates[]> {
    const response = await api.get(`/clientes/loja/${lojaId}/clientes`);
    return response.data;
  }

  /**
   * Buscar cliente específico da loja
   */
  async buscarClienteDaLoja(lojaId: string, clienteId: string): Promise<ClienteWithResgates> {
    const response = await api.get(`/clientes/loja/${lojaId}/cliente/${clienteId}`);
    return response.data;
  }
}

export default new ClienteService();