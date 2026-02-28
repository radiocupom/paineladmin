import api from './api';

export interface KPIsResponse {
  totalLojas: number;
  lojasAtivas: number;
  totalUsuarios: number;
  cuponsAtivos: number;
  cuponsExpirados: number;
  resgatesHoje: number;
  resgatesMes: number;
  
  // 🔥 NOVAS MÉTRICAS FINANCEIRAS
  valorTotalResgatado: number;
  valorTotalVendido: number;
  valorTotalEconomizado: number;
  ticketMedio: number;
  cuponsComPreco: number;
}

export interface Transaction {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
  };
  cupom: {
    id: string;
    descricao: string;
    precoOriginal?: number;
    precoComDesconto?: number;
    loja: {
      id: string;
      nome: string;
    };
  };
}

export interface StoreDistribution {
  categoria: string;
  _count: {
    id: number;
  };
  // 🔥 Versão formatada
  categoriaLabel?: string;
  quantidade?: number;
}

export interface StoreRanking {
  lojaId: string;
  lojaNome: string;
  totalResgates: number;
  // 🔥 NOVO
  valorTotal?: number;
}

export interface GrowthMetricsResponse {
  totalLojas: number;
  totalClientes: number;
  totalResgates: number;
}

// Interface apenas para o lojista
export interface ResgateLoja {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp?: string;
  cupomId: string;
  cupomCodigo: string;
  cupomDescricao: string;
  cupomLogo?: string;
  cupomPrecoOriginal?: number;
  cupomPrecoComDesconto?: number;
  quantidade: number;
  resgatadoEm: string;
  qrCodeId?: string;
  qrCodeValidado: boolean;
  qrCodeValidadoEm?: string;
}

export interface ResumoFinanceiro {
  totalBruto: number;
  totalVendido: number;
  totalEconomizado: number;
  ticketMedio: number;
  taxaConversao: number;
  cuponsComPreco: number;
  cuponsSemPreco: number;
}

export const dashboardService = {
  // ========== ROTAS DO ADMIN ==========
  
  /**
   * Busca KPIs do dashboard incluindo métricas financeiras
   */
  async getKPIs(): Promise<KPIsResponse> {
    const { data } = await api.get('/dashboard/kpis');
    return data;
  },

  /**
   * Busca transações recentes
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    const { data } = await api.get('/dashboard/recent-transactions');
    return data;
  },

  /**
   * Busca distribuição de lojas por categoria
   */
  async getStoreDistribution(): Promise<StoreDistribution[]> {
    const { data } = await api.get('/dashboard/store-distribution');
    
    // 🔥 Formatar para o front
    const categorias: {[key: string]: string} = {
      RESTAURANTE: 'Restaurante',
      SUPERMERCADO: 'Supermercado',
      PADARIA: 'Padaria',
      LOJA_DE_ROUPAS: 'Moda',
      ELETRONICOS: 'Eletrônicos',
      OUTROS: 'Outros'
    };
    
    return data.map((item: StoreDistribution) => ({
      ...item,
      categoriaLabel: categorias[item.categoria] || item.categoria,
      quantidade: item._count?.id || 0
    }));
  },

  /**
   * Busca ranking de lojas por resgates
   */
  async getStoreRanking(): Promise<StoreRanking[]> {
    const { data } = await api.get('/dashboard/store-ranking');
    return data;
  },

  /**
   * Busca métricas de crescimento
   */
  async getGrowthMetrics(): Promise<GrowthMetricsResponse> {
    const { data } = await api.get('/dashboard/growth-metrics');
    return data;
  },

  // ========== ROTA DO LOJISTA ==========
  
  /**
   * Lista resgates da loja logada
   */
  async listarResgatesLoja(): Promise<ResgateLoja[]> {
    const response = await api.get('/front/resgates/loja');
    return response.data.data;
  },

  // ========== MÉTODOS UTILITÁRIOS ==========
  
  /**
   * Formata valor para moeda brasileira
   */
  formatarMoeda(valor: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  /**
   * Calcula resumo financeiro baseado nos KPIs
   */
  calcularResumoFinanceiro(kpis: KPIsResponse): ResumoFinanceiro {
    const totalBruto = kpis.valorTotalResgatado || 0;
    const totalVendido = kpis.valorTotalVendido || 0;
    const totalEconomizado = kpis.valorTotalEconomizado || 0;
    const ticketMedio = kpis.ticketMedio || 0;
    const cuponsComPreco = kpis.cuponsComPreco || 0;
    const totalCupons = kpis.cuponsAtivos + kpis.cuponsExpirados;
    const cuponsSemPreco = totalCupons - cuponsComPreco;
    const taxaConversao = totalBruto > 0 ? (totalVendido / totalBruto) * 100 : 0;

    return {
      totalBruto,
      totalVendido,
      totalEconomizado,
      ticketMedio,
      taxaConversao,
      cuponsComPreco,
      cuponsSemPreco
    };
  },

  /**
   * Agrupa transações por período (dia/mês/ano)
   */
  agruparTransacoesPorPeriodo(transacoes: Transaction[], periodo: 'dia' | 'mes' | 'ano' = 'dia') {
    const grupos: { [key: string]: { data: string; total: number; valor: number } } = {};

    transacoes.forEach(t => {
      const data = new Date(t.resgatadoEm);
      let chave: string;

      if (periodo === 'dia') {
        chave = data.toISOString().split('T')[0];
      } else if (periodo === 'mes') {
        chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      } else {
        chave = String(data.getFullYear());
      }

      if (!grupos[chave]) {
        grupos[chave] = { data: chave, total: 0, valor: 0 };
      }

      grupos[chave].total += t.quantidade;
      grupos[chave].valor += (t.cupom.precoComDesconto || t.cupom.precoOriginal || 0) * t.quantidade;
    });

    return Object.values(grupos).sort((a, b) => a.data.localeCompare(b.data));
  }
};