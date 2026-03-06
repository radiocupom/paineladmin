// cliente.ts
import api from './api';

// ================= INTERFACES =================

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
  _count?: {
    resgates: number;
    qrCodesUsados: number;
  };
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

// ================= RESGATES =================

export interface LojaResumo {
  id: string;
  nome: string;
  logo: string;
}

export interface CupomResumo {
  id: string;
  codigo: string;
  descricao: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  logo?: string;
  loja?: LojaResumo;
}

export interface QrCodeResumo {
  id: string;
  codigo: string;
  usadoEm: string;
  validado: boolean;
  validadoEm?: string;
}

// 🔥 INTERFACE DO CLIENTE DENTRO DO RESGATE
export interface ClienteResumo {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  genero?: string;
  dataNascimento?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas?: boolean;
  comoConheceu?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  ultimoLogin?: string;
}

export interface Resgate {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  cupomId: string;
  cupom: CupomResumo;
  cliente: ClienteResumo;  // ← ATUALIZADO!
  qrCodes?: QrCodeResumo[];
  qrCodesCount?: number;
  qrCodesValidados?: number;
}
export interface ResgateDetalhado extends Resgate {
  qrCodes: QrCodeResumo[];
  qrCodesCount: number;
  qrCodesValidados: number;
}

// ================= QR CODES =================

export interface QrCodeDetalhado {
  id: string;
  codigo: string;
  usadoEm: string;
  validado: boolean;
  validadoEm?: string;
  cupomId: string;
  cupom: CupomResumo;
  resgate?: {
    id: string;
    resgatadoEm: string;
  };
}

export interface QrCodeLoja extends QrCodeDetalhado {
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
  };
}

// ================= CLIENTE COM RESGATES =================

export interface ClienteWithResgates extends Cliente {
  resgates: Resgate[];
  _count: {
    resgates: number;
    qrCodesUsados: number;
  };
}

// ================= CLIENTE DA LOJA =================

export interface ClienteDaLoja extends Cliente {
  resgates: Resgate[];
  estatisticas: {
    totalResgates: number;
    totalQrCodes: number;
    qrCodesValidados: number;
    totalGasto: number;
    totalEconomizado: number;
  };
  _count: {
    resgates: number;
    qrCodesUsados: number;
  };
}

// ================= ESTATÍSTICAS =================

export interface EstatisticasCliente {
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    cidade?: string;
    estado?: string;
    ativo: boolean;
    createdAt: string;
  };
  resgates: {
    total: number;
    cuponsUnicos: number;
    quantidadeTotal: number;
    ultimoResgate: {
      data: string;
      cupomId: string;
      cupomCodigo?: string;
    } | null;
    mediaQuantidadePorResgate: number;
  };
  qrCodes: {
    total: number;
    validados: number;
    pendentes: number;
    taxaValidacao: string;
  };
  financeiro: {
    totalGasto: string;
    totalEconomizado: string;
    ticketMedio: string;
  };
}

export interface EstatisticasGerais {
  clientes: {
    total: number;
    ativos: number;
    novosMes: number;
    inativos: number;
  };
  resgates: {
    total: number;
    mes: number;
    mediaPorCliente: number;
  };
  qrCodes: {
    total: number;
    validados: number;
    pendentes: number;
    taxaValidacao: string;
  };
  financeiro: {
    economiaTotal: string;
  };
  topClientes: Array<{
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    totalResgates: number;
  }>;
}

export interface EstatisticasPorLoja {
  clientes: {
    total: number;
    unicos: number;
  };
  resgates: {
    total: number;
    mes: number;
    mediaPorCliente: number;
  };
  qrCodes: {
    total: number;
    validados: number;
    pendentes: number;
    taxaValidacao: string;
  };
  financeiro: {
    economiaTotal: string;
  };
  topClientes: Array<{
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    totalResgates: number;
  }>;
}

// ================= PAGINAÇÃO =================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListaClientesResponse {
  clientes: Cliente[];
  pagination: Pagination;
}

export interface ListaClientesLojaResponse {
  clientes: ClienteDaLoja[];
  pagination: Pagination;
}

export interface ListaResgatesResponse {
  resgates: Resgate[];
  pagination: Pagination;
}

export interface ListaQrCodesResponse {
  qrCodes: QrCodeDetalhado[];
  pagination: Pagination;
  resumo: {
    validados: number;
    pendentes: number;
  };
}

export interface ListaQrCodesLojaResponse {
  qrCodes: QrCodeLoja[];
  pagination: Pagination;
}

// ================= FILTROS =================

export interface FiltrosClientes {
  search?: string;
  cidade?: string;
  estado?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltrosQrCodes {
  status?: 'validado' | 'pendente' | 'todos';
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}

// ================= SERVICE =================

class ClienteService {
  // ================= UTILITÁRIOS =================
  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ================= ROTAS PÚBLICAS =================
  
  /**
   * Criar cliente (registro público)
   */
  async criar(data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.post('/clientes/registro', data);
    return response.data.data;
  }

  /**
   * Login do cliente
   */
  async login(email: string, senha: string): Promise<{
    cliente: Cliente;
    token: string;
    expiresIn: string;
  }> {
    const response = await api.post('/clientes/login', { email, senha });
    return response.data.data;
  }

  // ================= ROTAS DO PRÓPRIO CLIENTE =================
  
  /**
   * Buscar perfil do cliente logado
   */
  async getPerfil(): Promise<Cliente> {
    const response = await api.get('/clientes/perfil');
    return response.data.data;
  }

  /**
   * Atualizar perfil do cliente logado
   */
  async atualizarPerfil(data: UpdateClienteDTO): Promise<Cliente> {
    const response = await api.put('/clientes/perfil', data);
    return response.data.data;
  }

  /**
   * Deletar própria conta
   */
  async deletarPropriaConta(): Promise<void> {
    await api.delete('/clientes/perfil');
  }

  /**
   * Buscar estatísticas do próprio cliente
   */
  async getMinhasEstatisticas(): Promise<EstatisticasCliente> {
    const response = await api.get('/clientes/perfil/estatisticas');
    return response.data.data;
  }

  /**
   * Buscar resgates do próprio cliente com paginação
   */
  async getMeusResgates(page = 1, limit = 10): Promise<ListaResgatesResponse> {
    const query = this.buildQueryString({ page, limit });
    const response = await api.get(`/clientes/perfil/resgates${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes do próprio resgate
   */
  async getQrCodesDoResgate(resgateId: string): Promise<QrCodeDetalhado[]> {
    const response = await api.get(`/clientes/perfil/resgates/${resgateId}/qrcodes`);
    return response.data.data;
  }

  /**
   * Buscar QR codes do próprio cliente com paginação
   */
  async getMeusQrCodes(page = 1, limit = 20, status?: 'validado' | 'pendente'): Promise<ListaQrCodesResponse> {
    const query = this.buildQueryString({ page, limit, status });
    const response = await api.get(`/clientes/perfil/qrcodes${query}`);
    return response.data.data;
  }

  /**
   * Buscar detalhes de um QR code específico
   */
  async getQrCodeDetalhes(qrCodeId: string): Promise<QrCodeDetalhado> {
    const response = await api.get(`/clientes/perfil/qrcodes/${qrCodeId}`);
    return response.data.data;
  }

  // ================= ROTAS DE ADMIN/SUPERADMIN =================
  
  /**
   * Listar todos os clientes com paginação e filtros
   */
  async listarTodos(
    page = 1,
    limit = 20,
    filters: FiltrosClientes = {},
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<ListaClientesResponse> {
    const query = this.buildQueryString({
      page,
      limit,
      ...filters,
      sortBy,
      sortOrder
    });
    
    const response = await api.get(`/clientes${query}`);
    return response.data.data;
  }

  /**
   * Buscar estatísticas gerais
   */
  async getEstatisticasGerais(): Promise<EstatisticasGerais> {
    const response = await api.get('/clientes/estatisticas/gerais');
    return response.data.data;
  }

  /**
   * Buscar cliente por ID
   */
  async buscarPorId(id: string): Promise<Cliente> {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data;
  }

  /**
   * Buscar cliente por email
   */
  async buscarPorEmail(email: string): Promise<Cliente> {
    const response = await api.get(`/clientes/por-email/${email}`);
    return response.data.data;
  }

  /**
   * Buscar estatísticas de um cliente específico
   */
  async getEstatisticasCliente(id: string): Promise<EstatisticasCliente> {
    const response = await api.get(`/clientes/${id}/estatisticas`);
    return response.data.data;
  }

  /**
   * Buscar resgates de um cliente específico
   */
  async getResgatesCliente(id: string, page = 1, limit = 10): Promise<ListaResgatesResponse> {
    const query = this.buildQueryString({ page, limit });
    const response = await api.get(`/clientes/${id}/resgates${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes de um cliente específico
   */
  async getQrCodesCliente(
    id: string,
    page = 1,
    limit = 20,
    status?: 'validado' | 'pendente'
  ): Promise<ListaQrCodesResponse> {
    const query = this.buildQueryString({ page, limit, status });
    const response = await api.get(`/clientes/${id}/qrcodes${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes de um resgate específico
   */
  async getQrCodesPorResgate(clienteId: string, resgateId: string): Promise<QrCodeDetalhado[]> {
    const response = await api.get(`/clientes/${clienteId}/resgates/${resgateId}/qrcodes`);
    return response.data.data;
  }

  /**
   * Atualizar cliente (admin)
   */
  async atualizar(id: string, data: UpdateClienteDTO): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data.data;
  }

  /**
   * Deletar cliente (admin)
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

  // ================= ROTAS DE LOJA =================
  
  /**
   * Listar clientes da loja com paginação
   */
  async listarClientesDaLoja(
    lojaId: string,
    page = 1,
    limit = 20,
    filters: FiltrosClientes = {},
    sortBy: 'ultimoResgate' | 'totalResgates' | 'totalGasto' | 'nome' = 'ultimoResgate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<ListaClientesLojaResponse> {
    const query = this.buildQueryString({
      page,
      limit,
      ...filters,
      sortBy,
      sortOrder
    });
    
    const response = await api.get(`/clientes/loja/${lojaId}/clientes${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes da loja
   */
  async listarQrCodesDaLoja(
    lojaId: string,
    page = 1,
    limit = 20,
    filters: FiltrosQrCodes = {}
  ): Promise<ListaQrCodesLojaResponse> {
    const query = this.buildQueryString({
      page,
      limit,
      ...filters
    });
    
    const response = await api.get(`/clientes/loja/${lojaId}/qrcodes${query}`);
    return response.data.data;
  }

  /**
   * Listar resgates da loja
   */
  async listarResgatesDaLoja(
    lojaId: string,
    page = 1,
    limit = 20,
    dataInicio?: string,
    dataFim?: string
  ): Promise<ListaResgatesResponse> {
    const query = this.buildQueryString({ page, limit, dataInicio, dataFim });
    const response = await api.get(`/clientes/loja/${lojaId}/resgates${query}`);
    return response.data.data;
  }

  /**
   * Buscar estatísticas da loja
   */
  async getEstatisticasDaLoja(lojaId: string): Promise<EstatisticasPorLoja> {
    const response = await api.get(`/clientes/loja/${lojaId}/estatisticas`);
    return response.data.data;
  }

  /**
   * Buscar cliente específico da loja
   */
  async buscarClienteDaLoja(lojaId: string, clienteId: string): Promise<ClienteDaLoja> {
    const response = await api.get(`/clientes/loja/${lojaId}/cliente/${clienteId}`);
    return response.data.data;
  }

  /**
   * Buscar resgates de um cliente da loja
   */
  async buscarResgatesClienteDaLoja(
    lojaId: string,
    clienteId: string,
    page = 1,
    limit = 10
  ): Promise<ListaResgatesResponse> {
    const query = this.buildQueryString({ page, limit });
    const response = await api.get(`/clientes/loja/${lojaId}/cliente/${clienteId}/resgates${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes de um cliente da loja
   */
  async buscarQrCodesClienteDaLoja(
    lojaId: string,
    clienteId: string,
    page = 1,
    limit = 20,
    status?: 'validado' | 'pendente'
  ): Promise<ListaQrCodesLojaResponse> {
    const query = this.buildQueryString({ page, limit, status });
    const response = await api.get(`/clientes/loja/${lojaId}/cliente/${clienteId}/qrcodes${query}`);
    return response.data.data;
  }

  /**
   * Buscar QR codes de um resgate específico da loja
   */
  async buscarQrCodesPorResgateDaLoja(
    lojaId: string,
    clienteId: string,
    resgateId: string
  ): Promise<QrCodeLoja[]> {
    const response = await api.get(`/clientes/loja/${lojaId}/cliente/${clienteId}/resgate/${resgateId}/qrcodes`);
    return response.data.data;
  }
}

export default new ClienteService();