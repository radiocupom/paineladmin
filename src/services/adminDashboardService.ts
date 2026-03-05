import api from './api';

// ============================================================================
// TIPOS COMPARTILHADOS
// ============================================================================

export interface Loja {
  id: string;
  nome: string;
  email: string;
  logo?: string;
  payment: boolean;
  categoria?: string;
  createdAt?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade?: string;
  estado?: string;
}

export interface Cupom {
  id: string;
  codigo: string;
  descricao: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  logo?: string;
  dataExpiracao?: string;
  quantidadePorCliente?: number;
  totalQrCodes?: number;
  qrCodesUsados?: number;
}

export interface Resgate {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  clienteId: string;
  cupomId: string;
  cliente?: Cliente;
  cupom?: Cupom;
}

export interface QRCode {
  id: string;
  codigo: string;
  usadoEm: string;
  validado: boolean;
  validadoEm?: string;
  clienteId: string;
  cupomId: string;
  cliente?: Cliente;
  cupom?: Cupom;
}

// ============================================================================
// TIPOS DO ADMIN (VISÃO GLOBAL)
// ============================================================================

export interface AdminKPIs {
  // Lojas
  totalLojas: number;
  lojasAtivas: number;
  lojasInativas: number;
  
  // Usuários
  totalUsuarios: number;
  
  // Clientes
  totalClientes: number;
  
  // Cupons
  totalCupons: number;
  cuponsAtivos: number;
  cuponsExpirados: number;
  cuponsComPreco: number;
  
  // Resgates
  totalResgates: number;
  resgatesHoje: number;
  resgatesSemana: number;
  resgatesMes: number;
  
  // QR Codes
  totalQrCodes: number;
  qrCodesValidados: number;
  qrCodesPendentes: number;
  
  // Financeiro
  valorTotalResgatado: number;
  valorTotalVendido: number;
  valorTotalEconomizado: number;
  ticketMedio: number;
  taxaConversao: number;
}

export interface RecentTransaction {
  id: string;
  quantidade: number;
  quantidadeValidada: number;
  resgatadoEm: string;
  status: 'pendente' | 'parcial' | 'validado';
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
  };
  cupom: {
    id: string;
    descricao: string;
    codigo: string;
    precoOriginal?: number;
    precoComDesconto?: number;
    loja: {
      id: string;
      nome: string;
    };
  };
  qrCodes: Array<{
    id: string;
    validado: boolean;
    validadoEm?: string;
  }>;
}

export interface CupomPopular {
  id: string;
  descricao: string;
  codigo: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  totalResgates: number;
  dataExpiracao?: string;
  valorTotalGerado: number;
  lojaNome?: string;
}

export interface ResgatePorDia {
  dia: string;
  data: string;
  total: number;
  valorTotal: number;
}

export interface QRCodeStats {
  totais: {
    resgatados: number;
    validados: number;
    pendentes: number;
  };
  hoje: {
    resgatados: number;
    validados: number;
    pendentes: number;
  };
  semana: {
    resgatados: number;
    validados: number;
    pendentes: number;
  };
  mes: {
    resgatados: number;
    validados: number;
    pendentes: number;
  };
  taxaValidacao: number;
  tempoMedioValidacao: number;
}

export interface QRCodeWithFilters {
  data: QRCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreDistribution {
  categoria: string;
  categoriaLabel: string;
  _count: {
    id: number;
  };
  quantidade: number;
  percentual: number;
}

export interface StoreRanking {
  lojaId: string;
  lojaNome: string;
  totalResgates: number;
  valorTotal: number;
  clientesUnicos: number;
  cuponsUtilizados: number;
}

export interface GrowthMetrics {
  totalLojas: number;
  totalClientes: number;
  totalResgates: number;
}

export interface AdminDashboardData {
  kpis: AdminKPIs;
  recentTransactions: RecentTransaction[];
  cuponsPopulares: CupomPopular[];
  resgatesPorDia: ResgatePorDia[];
  qrCodeStats: QRCodeStats;
  storeDistribution: StoreDistribution[];
  storeRanking: StoreRanking[];
  growthMetrics: GrowthMetrics;
}

// ============================================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================================

export const formatters = {
  /**
   * Formata valor para moeda brasileira
   */
  moeda(valor: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  /**
   * Formata data para padrão brasileiro
   */
  data(data: string | Date, formato: 'completo' | 'curto' | 'hora' = 'completo'): string {
    const date = typeof data === 'string' ? new Date(data) : data;
    
    switch (formato) {
      case 'curto':
        return date.toLocaleDateString('pt-BR');
      case 'hora':
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  },

  /**
   * Formata número com separadores
   */
  numero(valor: number = 0, digitos: number = 0): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: digitos,
      maximumFractionDigits: digitos
    });
  },

  /**
   * Formata percentual
   */
  percentual(valor: number = 0, digitos: number = 1): string {
    return `${valor.toFixed(digitos)}%`;
  },

  /**
   * Traduz categoria da loja
   */
  categoriaLoja(categoria: string): string {
    const mapa: Record<string, string> = {
      RESTAURANTE: 'Restaurante',
      SUPERMERCADO: 'Supermercado',
      PADARIA: 'Padaria',
      LOJA_DE_ROUPAS: 'Moda',
      ELETRONICOS: 'Eletrônicos',
      OUTROS: 'Outros'
    };
    return mapa[categoria] || categoria;
  }
};

// ============================================================================
// SERVIÇOS DO ADMIN (VISÃO GLOBAL)
// ============================================================================

export const adminDashboardService = {
  /**
   * Busca KPIs do admin (visão global)
   */
  async getKPIs(): Promise<AdminKPIs> {
    const response = await api.get('/admin/kpis');
    return response.data.data;
  },

  /**
   * Busca transações recentes
   */
  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const response = await api.get(`/admin/recent-transactions?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca cupons mais resgatados
   */
  async getCuponsPopulares(limit: number = 5): Promise<CupomPopular[]> {
    const response = await api.get(`/admin/cupons-populares?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca resgates por dia (últimos 7 dias)
   */
  async getResgatesPorDia(): Promise<ResgatePorDia[]> {
    const response = await api.get('/admin/resgates-por-dia');
    return response.data.data;
  },

  /**
   * Busca QR codes resgatados
   */
  async getQrCodesResgatados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/admin/qrcodes/resgatados?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca QR codes validados
   */
  async getQrCodesValidados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/admin/qrcodes/validados?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca estatísticas de QR codes
   */
  async getQrCodeStats(): Promise<QRCodeStats> {
    const response = await api.get('/admin/qrcodes/stats');
    return response.data.data;
  },

  /**
   * Busca QR codes com filtros avançados
   */
  async getQrCodesWithFilters(filters: {
    status?: 'validado' | 'pendente';
    dataInicio?: string;
    dataFim?: string;
    lojaId?: string;
    clienteId?: string;
    cupomId?: string;
    page?: number;
    limit?: number;
  }): Promise<QRCodeWithFilters> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters.dataFim) params.append('dataFim', filters.dataFim);
    if (filters.lojaId) params.append('lojaId', filters.lojaId);
    if (filters.clienteId) params.append('clienteId', filters.clienteId);
    if (filters.cupomId) params.append('cupomId', filters.cupomId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/admin/qrcodes/filters?${params}`);
    return response.data.data;
  },

  /**
   * Busca QR codes resgatados por período
   */
  async getQrCodesResgatadosPorPeriodo(
    dataInicio: string,
    dataFim: string,
    limit: number = 50
  ): Promise<QRCode[]> {
    const response = await api.get(
      `/admin/qrcodes/resgatados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Busca QR codes validados por período
   */
  async getQrCodesValidadosPorPeriodo(
    dataInicio: string,
    dataFim: string,
    limit: number = 50
  ): Promise<QRCode[]> {
    const response = await api.get(
      `/admin/qrcodes/validados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Busca taxa de validação global
   */
  async getTaxaValidacao(): Promise<number> {
    const response = await api.get('/admin/qrcodes/taxa-validacao');
    return response.data.data.taxa;
  },

  /**
   * Busca tempo médio de validação global
   */
  async getTempoMedioValidacao(): Promise<number> {
    const response = await api.get('/admin/qrcodes/tempo-medio-validacao');
    return response.data.data.tempoMedio;
  },

  /**
   * Busca distribuição de lojas por categoria
   */
  async getStoreDistribution(): Promise<StoreDistribution[]> {
    const response = await api.get('/admin/store-distribution');
    return response.data.data;
  },

  /**
   * Busca ranking de lojas por resgates
   */
  async getStoreRanking(limit: number = 5): Promise<StoreRanking[]> {
    const response = await api.get(`/admin/store-ranking?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca métricas de crescimento
   */
  async getGrowthMetrics(): Promise<GrowthMetrics> {
    const response = await api.get('/admin/growth-metrics');
    return response.data.data;
  },

  /**
   * Busca todos os dados do dashboard admin em uma chamada
   */
  async getDashboardData(): Promise<AdminDashboardData> {
    const response = await api.get('/admin/dados-completos');
    return response.data.data;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default adminDashboardService;