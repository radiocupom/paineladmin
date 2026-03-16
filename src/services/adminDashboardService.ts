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
// TIPOS DO LOJISTA (PARA AS NOVAS ROTAS)
// ============================================================================

export interface LojaKPIs {
  loja: {
    id: string;
    nome: string;
  };
  cupons: {
    total: number;
    ativos: number;
    expirados: number;
    comPreco: number;
  };
  resgates: {
    total: number;
    hoje: number;
    semana: number;
    mes: number;
  };
  qrCodes: {
    total: number;
    validados: number;
    pendentes: number;
  };
  clientes: {
    total: number;
  };
  financeiro: {
    valorTotalResgatado: number;
    valorTotalVendido: number;
    valorTotalEconomizado: number;
    ticketMedio: number;
  };
}

export interface ResgateLoja extends Resgate {
  cliente: Cliente;
  cupom: Cupom;
  quantidadeValidada: number;
  status: 'pendente' | 'parcial' | 'validado';
  valorOriginal: number;
  valorPago: number;
  economia: number;
  qrCodes: QRCode[];
}

export interface LojaDashboardData {
  kpis: LojaKPIs;
  ultimosResgates: ResgateLoja[];
  cuponsPopulares: CupomPopular[];
  resgatesPorDia: ResgatePorDia[];
  qrCodeStats: QRCodeStats;
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
// SERVIÇOS DO ADMIN - TODAS COM /dashboard/
// ============================================================================

export const adminDashboardService = {
  async getKPIs(): Promise<AdminKPIs> {
    const response = await api.get('/dashboard/kpis');
    return response.data.data;
  },

  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data.data;
  },

  async getCuponsPopulares(limit: number = 5): Promise<CupomPopular[]> {
    const response = await api.get(`/dashboard/cupons-populares?limit=${limit}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getResgatesPorDia(): Promise<ResgatePorDia[]> {
    const response = await api.get('/dashboard/resgates-por-dia');
    return response.data.data;
  },

  async getQrCodesResgatados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard/qrcodes/resgatados?limit=${limit}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getQrCodesValidados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard/qrcodes/validados?limit=${limit}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getQrCodeStats(): Promise<QRCodeStats> {
    const response = await api.get('/dashboard/qrcodes/stats');
    return response.data.data;
  },

  async getQrCodesWithFilters(filters: any): Promise<QRCodeWithFilters> {
    const params = new URLSearchParams();
    // ... params
    const response = await api.get(`/dashboard/qrcodes/filters?${params}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getQrCodesResgatadosPorPeriodo(dataInicio: string, dataFim: string, limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard/qrcodes/resgatados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getQrCodesValidadosPorPeriodo(dataInicio: string, dataFim: string, limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard/qrcodes/validados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`); // ← CORRIGIDO
    return response.data.data;
  },

  async getTaxaValidacao(): Promise<number> {
    const response = await api.get('/dashboard/qrcodes/taxa-validacao');
    return response.data.data.taxa;
  },

  async getTempoMedioValidacao(): Promise<number> {
    const response = await api.get('/dashboard/qrcodes/tempo-medio-validacao');
    return response.data.data.tempoMedio;
  },

  async getStoreDistribution(): Promise<StoreDistribution[]> {
    const response = await api.get('/dashboard/store-distribution');
    return response.data.data;
  },

  async getStoreRanking(limit: number = 5): Promise<StoreRanking[]> {
    const response = await api.get(`/dashboard/store-ranking?limit=${limit}`);
    return response.data.data;
  },

  async getGrowthMetrics(): Promise<GrowthMetrics> {
    const response = await api.get('/dashboard/growth-metrics');
    return response.data.data;
  },

  async getDashboardData(): Promise<AdminDashboardData> {
    const response = await api.get('/dashboard/dados-completos');
    return response.data.data;
  },

  // ================= ROTAS DE LOJAS (TAMBÉM COM /dashboard/) =================
  async getLojaKPIs(lojaId: string): Promise<LojaKPIs> {
    const response = await api.get(`/dashboard/lojas/${lojaId}/kpis`); // ← /dashboard/
    return response.data.data;
  },

  async getLojaUltimosResgates(lojaId: string, limit: number = 10): Promise<ResgateLoja[]> {
    const response = await api.get(`/dashboard/lojas/${lojaId}/ultimos-resgates?limit=${limit}`); // ← /dashboard/
    return response.data.data;
  },

  async getLojaCuponsPopulares(lojaId: string, limit: number = 5): Promise<CupomPopular[]> {
    const response = await api.get(`/dashboard/lojas/${lojaId}/cupons-populares?limit=${limit}`); // ← /dashboard/
    return response.data.data;
  },

  async getLojaResgatesPorDia(lojaId: string): Promise<ResgatePorDia[]> {
    const response = await api.get(`/dashboard/lojas/${lojaId}/resgates-por-dia`); // ← /dashboard/
    return response.data.data;
  },

  async getLojaQrCodeStats(lojaId: string): Promise<QRCodeStats> {
    const response = await api.get(`/dashboard/lojas/${lojaId}/qrcodes/stats`); // ← /dashboard/
    return response.data.data;
  },

// No adminDashboardService.ts, linha 467
async getLojaDadosCompletos(lojaId: string): Promise<LojaDashboardData> {
  console.log('📡 Chamando:', `/dashboard/lojas/${lojaId}/dados-completos`);
  try {
    const response = await api.get(`/dashboard/lojas/${lojaId}/dados-completos`);
    console.log('✅ Resposta:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erro completo:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });
    throw error;
  }
}
};
// ============================================================================
// SERVIÇOS DO LOJISTA (APENAS)
// ============================================================================

export const lojaDashboardService = {
  /**
   * Busca KPIs da loja logada
   */
  async getKPIs(): Promise<LojaKPIs> {
    const response = await api.get('/dashboard-loja/kpis');
    return response.data.data;
  },

  /**
   * Busca últimos resgates da loja
   */
  async getUltimosResgates(limit: number = 10): Promise<ResgateLoja[]> {
    const response = await api.get(`/dashboard-loja/ultimos-resgates?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca cupons mais resgatados
   */
  async getCuponsPopulares(limit: number = 5): Promise<CupomPopular[]> {
    const response = await api.get(`/dashboard-loja/cupons-populares?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca resgates por dia (últimos 7 dias)
   */
  async getResgatesPorDia(): Promise<ResgatePorDia[]> {
    const response = await api.get('/dashboard-loja/resgates-por-dia');
    return response.data.data;
  },

  /**
   * Busca QR codes resgatados
   */
  async getQrCodesResgatados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard-loja/qrcodes/resgatados?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca QR codes validados
   */
  async getQrCodesValidados(limit: number = 50): Promise<QRCode[]> {
    const response = await api.get(`/dashboard-loja/qrcodes/validados?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca estatísticas de QR codes
   */
  async getQrCodeStats(): Promise<QRCodeStats> {
    const response = await api.get('/dashboard-loja/qrcodes/stats');
    return response.data.data;
  },

  /**
   * Busca QR codes com filtros avançados
   */
  async getQrCodesWithFilters(filters: {
    status?: 'validado' | 'pendente';
    dataInicio?: string;
    dataFim?: string;
    clienteId?: string;
    cupomId?: string;
    page?: number;
    limit?: number;
  }): Promise<QRCodeWithFilters> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters.dataFim) params.append('dataFim', filters.dataFim);
    if (filters.clienteId) params.append('clienteId', filters.clienteId);
    if (filters.cupomId) params.append('cupomId', filters.cupomId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/dashboard-loja/qrcodes/filters?${params}`);
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
      `/dashboard-loja/qrcodes/resgatados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
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
      `/dashboard-loja/qrcodes/validados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Busca taxa de validação
   */
  async getTaxaValidacao(): Promise<number> {
    const response = await api.get('/dashboard-loja/qrcodes/taxa-validacao');
    return response.data.data.taxa;
  },

  /**
   * Busca tempo médio de validação
   */
  async getTempoMedioValidacao(): Promise<number> {
    const response = await api.get('/dashboard-loja/qrcodes/tempo-medio-validacao');
    return response.data.data.tempoMedio;
  },

  /**
   * Busca resgates com validação
   */
  async getResgatesComValidacao(limit: number = 10): Promise<ResgateLoja[]> {
    const response = await api.get(`/dashboard-loja/resgates/com-validacao?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Busca todos os dados do dashboard loja em uma chamada
   */
  async getDashboardData(): Promise<LojaDashboardData> {
    const response = await api.get('/dashboard-loja/dados-completos');
    return response.data.data;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default adminDashboardService;