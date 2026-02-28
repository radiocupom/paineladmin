import api from './api';

// ========== INTERFACES ==========

export interface KPIsLoja {
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

export interface UltimoResgate {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  // 🔥 NOVOS CAMPOS DE VALIDAÇÃO
  qrCodeValidado?: boolean;
  qrCodeValidadoEm?: string | null;
  qrCodeUsadoEm?: string | null;
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp?: string;
  };
  cupom: {
    id: string;
    descricao: string;
    codigo: string;
    precoOriginal?: number;
    precoComDesconto?: number;
    percentualDesconto?: number;
    nomeProduto?: string;
  };
  valorOriginal?: number;
  valorPago?: number;
  economia?: number;
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
  dataExpiracao: string;
  valorTotalGerado?: number;
}

export interface ResgatePorDia {
  dia: string;
  data: string;
  total: number;
  valorTotal?: number;
}

// ========== NOVAS INTERFACES PARA QR CODES ==========

export interface QrCode {
  id: string;
  cupomId: string;
  clienteId: string;
  codigo: string;
  usadoEm: string;
  validadoEm?: string | null;
  validado: boolean;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: string;
    nome: string;
    email: string;
    whatsapp?: string;
  };
  cupom?: {
    id: string;
    descricao: string;
    codigo: string;
    precoOriginal?: number;
    precoComDesconto?: number;
    percentualDesconto?: number;
    nomeProduto?: string;
  };
}

export interface QrCodeStats {
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

export interface QrCodeFilters {
  status?: 'validado' | 'pendente';
  dataInicio?: string;
  dataFim?: string;
  clienteId?: string;
  cupomId?: string;
  page?: number;
  limit?: number;
}

export interface QrCodePaginado {
  data: QrCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DadosCompletosDashboard {
  kpis: KPIsLoja;
  ultimosResgates: UltimoResgate[];
  cuponsPopulares: CupomPopular[];
  resgatesPorDia: ResgatePorDia[];
  // 🔥 NOVOS DADOS
  qrCodeStats?: QrCodeStats;
}

export interface ResumoFinanceiro {
  totalBruto: number;
  totalVendido: number;
  totalEconomizado: number;
  ticketMedio: number;
  taxaConversao: number;
  cuponsComPreco: number;
}

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Formata valor para moeda brasileira
 */
export function formatarMoeda(valor: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data para o formato brasileiro
 */
export function formatarData(data: string | Date, incluirHora: boolean = false): string {
  const date = new Date(data);
  if (incluirHora) {
    return date.toLocaleString('pt-BR');
  }
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata percentual
 */
export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor / 100);
}

/**
 * Processa os dados brutos de resgates por dia para o formato esperado pelo componente
 */
export function processarResgatesPorDia(dadosBrutos: any[]): ResgatePorDia[] {
  const totaisPorDia: Record<string, { total: number; valorTotal: number }> = {};
  
  dadosBrutos.forEach(item => {
    const data = new Date(item.resgatadoEm).toISOString().split('T')[0];
    if (!totaisPorDia[data]) {
      totaisPorDia[data] = { total: 0, valorTotal: 0 };
    }
    totaisPorDia[data].total += (item._count || 1);
    totaisPorDia[data].valorTotal += (item.valorPago || 0);
  });
  
  // Gerar últimos 7 dias
  const dias: ResgatePorDia[] = [];
  const hoje = new Date();
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - i);
    
    const dataStr = dia.toISOString().split('T')[0];
    
    dias.push({
      dia: dia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      data: dataStr,
      total: totaisPorDia[dataStr]?.total || 0,
      valorTotal: totaisPorDia[dataStr]?.valorTotal || 0
    });
  }
  
  return dias;
}

/**
 * Calcula resumo financeiro baseado nos KPIs
 */
export function calcularResumoFinanceiro(kpis: KPIsLoja): ResumoFinanceiro {
  const totalBruto = kpis.financeiro?.valorTotalResgatado || 0;
  const totalVendido = kpis.financeiro?.valorTotalVendido || 0;
  const totalEconomizado = kpis.financeiro?.valorTotalEconomizado || 0;
  const ticketMedio = kpis.financeiro?.ticketMedio || 0;
  const cuponsComPreco = kpis.cupons?.comPreco || 0;
  const taxaConversao = totalBruto > 0 ? (totalVendido / totalBruto) * 100 : 0;

  return {
    totalBruto,
    totalVendido,
    totalEconomizado,
    ticketMedio,
    taxaConversao,
    cuponsComPreco
  };
}

/**
 * Filtra resgates por status de validação
 */
export function filtrarResgatesPorValidacao(resgates: UltimoResgate[], apenasValidados: boolean = true): UltimoResgate[] {
  return resgates.filter(r => r.qrCodeValidado === apenasValidados);
}

/**
 * Calcula estatísticas de validação dos resgates
 */
export function calcularStatsValidacao(resgates: UltimoResgate[]) {
  const total = resgates.length;
  const validados = resgates.filter(r => r.qrCodeValidado).length;
  const pendentes = total - validados;
  const taxa = total > 0 ? (validados / total) * 100 : 0;

  return {
    total,
    validados,
    pendentes,
    taxa
  };
}

// ========== SERVICE ==========

export const dashboardLojaService = {
  /**
   * Buscar KPIs principais da loja com dados financeiros
   */
  async getKPIs(): Promise<KPIsLoja> {
    try {
      console.log('📊 Buscando KPIs da loja...');
      const response = await api.get('/dashboard-loja/kpis');
      console.log('✅ KPIs carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar KPIs:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar últimos resgates da loja com valores
   * @param limit - Número de resgates a retornar
   */
  async getUltimosResgates(limit: number = 10): Promise<UltimoResgate[]> {
    try {
      console.log(`📋 Buscando últimos ${limit} resgates...`);
      const response = await api.get(`/dashboard-loja/ultimos-resgates?limit=${limit}`);
      console.log('✅ Últimos resgates carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar últimos resgates:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar cupons mais populares da loja com informações de preço
   * @param limit - Número de cupons a retornar
   */
  async getCuponsPopulares(limit: number = 5): Promise<CupomPopular[]> {
    try {
      console.log(`🔥 Buscando ${limit} cupons mais populares...`);
      const response = await api.get(`/dashboard-loja/cupons-populares?limit=${limit}`);
      console.log('✅ Cupons populares carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar cupons populares:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar resgates por dia (últimos 7 dias)
   */
  async getResgatesPorDia(): Promise<ResgatePorDia[]> {
    try {
      console.log('📅 Buscando resgates por dia...');
      const response = await api.get('/dashboard-loja/resgates-por-dia');
      console.log('✅ Resgates por dia carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar resgates por dia:', error.response?.data || error.message);
      throw error;
    }
  },

  // ========== NOVOS MÉTODOS PARA QR CODES ==========

  /**
   * Buscar QR codes resgatados
   * @param limit - Número de QR codes a retornar
   */
  async getQrCodesResgatados(limit: number = 50): Promise<QrCode[]> {
    try {
      console.log(`📱 Buscando últimos ${limit} QR codes resgatados...`);
      const response = await api.get(`/dashboard-loja/qrcodes/resgatados?limit=${limit}`);
      console.log('✅ QR codes resgatados carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR codes resgatados:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar QR codes validados
   * @param limit - Número de QR codes a retornar
   */
  async getQrCodesValidados(limit: number = 50): Promise<QrCode[]> {
    try {
      console.log(`✅ Buscando últimos ${limit} QR codes validados...`);
      const response = await api.get(`/dashboard-loja/qrcodes/validados?limit=${limit}`);
      console.log('✅ QR codes validados carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR codes validados:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar estatísticas de validação de QR codes
   */
  async getQrCodeStats(): Promise<QrCodeStats> {
    try {
      console.log('📊 Buscando estatísticas de QR codes...');
      const response = await api.get('/dashboard-loja/qrcodes/stats');
      console.log('✅ Estatísticas de QR codes carregadas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de QR codes:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar QR codes com filtros avançados
   * @param filters - Filtros para a busca
   */
  async getQrCodesWithFilters(filters: QrCodeFilters = {}): Promise<QrCodePaginado> {
    try {
      console.log('🔍 Buscando QR codes com filtros:', filters);
      
      // Construir query string
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      if (filters.clienteId) params.append('clienteId', filters.clienteId);
      if (filters.cupomId) params.append('cupomId', filters.cupomId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await api.get(`/dashboard-loja/qrcodes/filters?${params.toString()}`);
      console.log('✅ QR codes com filtros carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR codes com filtros:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar QR codes resgatados por período
   * @param dataInicio - Data inicial
   * @param dataFim - Data final
   * @param limit - Limite de resultados
   */
  async getQrCodesResgatadosPorPeriodo(
    dataInicio: string, 
    dataFim: string, 
    limit: number = 50
  ): Promise<QrCode[]> {
    try {
      console.log(`📅 Buscando QR codes resgatados de ${dataInicio} até ${dataFim}...`);
      const response = await api.get(
        `/dashboard-loja/qrcodes/resgatados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
      );
      console.log('✅ QR codes resgatados por período carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR codes resgatados por período:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar QR codes validados por período
   * @param dataInicio - Data inicial
   * @param dataFim - Data final
   * @param limit - Limite de resultados
   */
  async getQrCodesValidadosPorPeriodo(
    dataInicio: string, 
    dataFim: string, 
    limit: number = 50
  ): Promise<QrCode[]> {
    try {
      console.log(`📅 Buscando QR codes validados de ${dataInicio} até ${dataFim}...`);
      const response = await api.get(
        `/dashboard-loja/qrcodes/validados/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&limit=${limit}`
      );
      console.log('✅ QR codes validados por período carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR codes validados por período:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar taxa de validação da loja
   */
  async getTaxaValidacao(): Promise<{ taxa: number }> {
    try {
      console.log('📊 Buscando taxa de validação...');
      const response = await api.get('/dashboard-loja/qrcodes/taxa-validacao');
      console.log('✅ Taxa de validação carregada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar taxa de validação:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar tempo médio de validação
   */
  async getTempoMedioValidacao(): Promise<{ tempoMedio: number }> {
    try {
      console.log('⏱️ Buscando tempo médio de validação...');
      const response = await api.get('/dashboard-loja/qrcodes/tempo-medio-validacao');
      console.log('✅ Tempo médio de validação carregado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar tempo médio de validação:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar resgates com status de validação
   * @param limit - Número de resgates a retornar
   */
  async getResgatesComValidacao(limit: number = 10): Promise<UltimoResgate[]> {
    try {
      console.log(`📋 Buscando últimos ${limit} resgates com validação...`);
      const response = await api.get(`/dashboard-loja/resgates/com-validacao?limit=${limit}`);
      console.log('✅ Resgates com validação carregados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar resgates com validação:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Buscar todos os dados do dashboard em uma única chamada
   */
  async getDadosCompletos(): Promise<DadosCompletosDashboard> {
    try {
      console.log('📦 Buscando dados completos do dashboard...');
      console.log('🔍 URL da requisição:', '/dashboard-loja/dados-completos');
      
      const response = await api.get('/dashboard-loja/dados-completos');
      
      // 🔥 LOG DA RESPOSTA COMPLETA
      console.log('📦 RESPOSTA COMPLETA:');
      console.log('📦 Status:', response.status);
      console.log('📦 StatusText:', response.statusText);
      console.log('📦 Headers:', response.headers);
      console.log('📦 Dados recebidos:', response.data);
      
      // 🔥 VERIFICAR TIPO DOS DADOS
      console.log('📦 Tipo dos dados:', typeof response.data);
      console.log('📦 É array?', Array.isArray(response.data));
      console.log('📦 É objeto?', typeof response.data === 'object' && !Array.isArray(response.data));
      console.log('📦 Chaves do objeto:', response.data ? Object.keys(response.data) : 'null');
      
      // 🔥 VERIFICAR SE OS DADOS VIERAM VAZIOS
      if (!response.data) {
        console.error('❌ response.data é null ou undefined');
        throw new Error('Dados não recebidos da API');
      }
      
      if (Object.keys(response.data).length === 0) {
        console.error('❌ response.data é um objeto vazio');
        throw new Error('Dados vazios recebidos da API');
      }
      
      // 🔥 VERIFICAR CAMPOS OBRIGATÓRIOS
      const camposObrigatorios = ['kpis', 'ultimosResgates', 'cuponsPopulares', 'resgatesPorDia'];
      const camposRecebidos = Object.keys(response.data);
      
      console.log('📦 Campos recebidos:', camposRecebidos);
      
      const camposFaltando = camposObrigatorios.filter(campo => !response.data[campo]);
      
      if (camposFaltando.length > 0) {
        console.error('❌ Campos faltando na resposta:', camposFaltando);
        console.error('❌ Dados recebidos:', response.data);
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
      }
      
      // 🔥 VERIFICAR ESTRUTURA DE CADA CAMPO
      console.log('📦 Verificando estrutura dos campos:');
      console.log('📦 kpis:', response.data.kpis ? '✅ Presente' : '❌ Ausente');
      console.log('📦 ultimosResgates:', response.data.ultimosResgates ? `✅ Presente (${response.data.ultimosResgates.length} itens)` : '❌ Ausente');
      console.log('📦 cuponsPopulares:', response.data.cuponsPopulares ? `✅ Presente (${response.data.cuponsPopulares.length} itens)` : '❌ Ausente');
      console.log('📦 resgatesPorDia:', response.data.resgatesPorDia ? `✅ Presente (${response.data.resgatesPorDia.length} itens)` : '❌ Ausente');
      
      console.log('✅ Dados completos carregados com sucesso!');
      return response.data;
      
    } catch (error: any) {
      // 🔥 LOG DETALHADO DO ERRO
      console.error('❌ ERRO DETALHADO ao buscar dados completos:');
      
      if (error.response) {
        // Erro com resposta do servidor
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
        console.error('📡 Headers do erro:', error.response.headers);
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        console.error('📡 Sem resposta do servidor');
        console.error('📡 Request:', error.request);
      } else {
        // Erro na configuração da requisição
        console.error('📡 Erro na configuração:', error.message);
      }
      
      console.error('📡 Stack:', error.stack);
      throw error;
    }
  },

  /**
 * 🔥 NOVO MÉTODO: Buscar dados completos de uma loja específica por ID (para admin/superadmin)
 * @param lojaId - ID da loja
 */
async getDadosLojaPorId(lojaId: string): Promise<DadosCompletosDashboard> {
  try {
    console.log(`📦 Buscando dados completos da loja ${lojaId}...`);
    
    // 🔥 URL atualizada para usar a rota existente
    const response = await api.get(`/dashboard-loja/admin/${lojaId}/dados-completos`);
    
    console.log('✅ Dados da loja carregados:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar dados da loja:', error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Buscar estatísticas resumidas para o sidebar
   */
  async getResumoSidebar(): Promise<{ cuponsAtivos: number; resgatesMes: number; valorVendidoMes?: number }> {
    try {
      console.log('📊 Buscando resumo para sidebar...');
      const response = await this.getKPIs();
      return {
        cuponsAtivos: response.cupons.ativos,
        resgatesMes: response.resgates.mes,
        valorVendidoMes: response.financeiro?.valorTotalVendido || 0
      };
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
      return { cuponsAtivos: 0, resgatesMes: 0 };
    }
  },

  /**
   * Buscar dados para cards financeiros
   */
  async getCardsFinanceiros() {
    try {
      const kpis = await this.getKPIs();
      return calcularResumoFinanceiro(kpis);
    } catch (error) {
      console.error('❌ Erro ao buscar cards financeiros:', error);
      return {
        totalBruto: 0,
        totalVendido: 0,
        totalEconomizado: 0,
        ticketMedio: 0,
        taxaConversao: 0,
        cuponsComPreco: 0
      };
    }
  },

  /**
   * Buscar dashboard completo com todos os dados
   */
  async getDashboardCompleto() {
    try {
      const [kpis, ultimosResgates, cuponsPopulares, resgatesPorDia, qrCodeStats] = await Promise.all([
        this.getKPIs(),
        this.getUltimosResgates(10),
        this.getCuponsPopulares(5),
        this.getResgatesPorDia(),
        this.getQrCodeStats()
      ]);

      return {
        kpis,
        ultimosResgates,
        cuponsPopulares,
        resgatesPorDia,
        qrCodeStats,
        financeiro: calcularResumoFinanceiro(kpis)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard completo:', error);
      throw error;
    }
  }
};

// ========== HOOKS ==========

/**
 * Hook customizado para usar em componentes React
 */
export const useDashboardLoja = () => {
  return dashboardLojaService;
};

/**
 * Hook para carregar todos os dados do dashboard de uma vez
 */
export const useDashboardLojaData = () => {
  const getDados = async () => {
    try {
      const [kpis, ultimosResgates, cuponsPopulares, qrCodeStats] = await Promise.all([
        dashboardLojaService.getKPIs(),
        dashboardLojaService.getUltimosResgates(5),
        dashboardLojaService.getCuponsPopulares(5),
        dashboardLojaService.getQrCodeStats()
      ]);
      
      return {
        kpis,
        ultimosResgates,
        cuponsPopulares,
        qrCodeStats,
        financeiro: calcularResumoFinanceiro(kpis)
      };
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      throw error;
    }
  };

  return { getDados };
};

/**
 * Hook para carregar dados de QR codes com estado de loading
 */
export const useQrCodesData = () => {
  const getQrCodes = async (filters?: QrCodeFilters) => {
    try {
      const [resgatados, validados, stats] = await Promise.all([
        dashboardLojaService.getQrCodesResgatados(filters?.limit || 20),
        dashboardLojaService.getQrCodesValidados(filters?.limit || 20),
        dashboardLojaService.getQrCodeStats()
      ]);

      return {
        resgatados,
        validados,
        stats
      };
    } catch (error) {
      console.error('❌ Erro ao carregar dados de QR codes:', error);
      throw error;
    }
  };

  return { getQrCodes };
};