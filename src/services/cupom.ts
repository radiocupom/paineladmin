import api from './api';
import { getImageUrl } from '@/lib/image-utils';

// ================= INTERFACES =================

export interface Cupom {
  id: string;
  codigo: string;
  descricao: string;
  quantidadePorCliente: number;
  dataExpiracao: string;
  lojaId: string;
  logo: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  totalQrCodes: number;
  qrCodesUsados: number;
  ativo: boolean;
  createdAt: string;
  updatedAt?: string;
  loja?: {
    id: string;
    nome: string;
    logo: string;
    payment: boolean;
  };
  _count?: {
    resgates: number;
  };
}

export interface CreateCupomDTO {
  codigo: string;
  descricao: string;
  quantidadePorCliente: number;
  dataExpiracao: string;
  lojaId: string;
  logo?: File;
  quantidadeQrCodes?: number;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
}

export interface UpdateCupomDTO {
  codigo?: string;
  descricao?: string;
  quantidadePorCliente?: number;
  dataExpiracao?: string;
  logo?: File;
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  
}

export interface QrCodeResponse {
  mensagem: string;
  totalQrCodes: number;
  qrCodesUsados: number;
}

export interface EstatisticasCupom {
  cupom: {
    id: string;
    codigo: string;
    descricao: string;
    loja: string;
    totalQrCodes: number;
    qrCodesUsados: number;
    precoOriginal?: number;
    precoComDesconto?: number;
    percentualDesconto?: number;
    nomeProduto?: string;
  };
  estatisticas: {
    totalQrCodes: number;
    qrCodesUsados: number;
    qrCodesValidados: number;
    qrCodesDisponiveis: number;
    totalResgates: number;
    clientesAtendidos: number;
    resgatesValidados: number;
    resgatesPendentes: number;
    valorTotalResgatado: number;
    valorTotalVendido: number;
    valorTotalEconomizado: number;
    mediaTicket: number;
    taxaConversao: number;
  };
  resgates: {
    id: string;
    cliente: string;
    quantidade: number;
    resgatadoEm: string;
    validado: boolean;
    validadoEm?: string;
    valorOriginal: number;
    valorPago: number;
  }[];
}

// ================= UTILS =================

/**
 * Utilitário para tratamento de imagens
 */
const ImageUtils = {
  processCupom(cupom: Cupom): Cupom {
    if (cupom.logo) {
      cupom.logo = getImageUrl(cupom.logo);
    }
    if (cupom.loja?.logo) {
      cupom.loja.logo = getImageUrl(cupom.loja.logo);
    }
    return cupom;
  },

  processCupomList(cupons: Cupom[]): Cupom[] {
    return cupons.map(cupom => this.processCupom(cupom));
  }
};

/**
 * Utilitário para formatação de valores
 */
const FormatUtils = {
  currency(value: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  percent(value: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  },

  date(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  },

  dateTime(date: string | Date): string {
    return new Date(date).toLocaleString('pt-BR');
  },

  number(value: number = 0): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
};

 // ================= CUPOM SERVICE =================

class CupomService {
  /**
   * Criar novo cupom
   */
  async create(data: CreateCupomDTO): Promise<Cupom> {
    try {
      console.log('📝 [CUPOM_SERVICE] Criando cupom:', { 
        codigo: data.codigo, 
        lojaId: data.lojaId 
      });

      const formData = this.buildFormData(data);
      const response = await api.post('/cupons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const cupom = response.data?.data || response.data;
      console.log('✅ [CUPOM_SERVICE] Cupom criado:', cupom.id);
      
      return ImageUtils.processCupom(cupom);
    } catch (error) {
      console.error('❌ [CUPOM_SERVICE] Erro ao criar cupom:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Listar todos os cupons (admin/superadmin)
   */
  async getAll(): Promise<Cupom[]> {
    try {
      console.log('📋 [CUPOM_SERVICE] Listando todos os cupons');
      
      const response = await api.get('/cupons');
      const cupons = response.data?.data || response.data || [];
      
      console.log(`✅ [CUPOM_SERVICE] Encontrados ${cupons.length} cupons`);
      return ImageUtils.processCupomList(cupons);
    } catch (error) {
      console.error('❌ [CUPOM_SERVICE] Erro ao listar cupons:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Listar cupons da própria loja (lojista)
   */
  async getMyStore(): Promise<Cupom[]> {
    try {
      console.log('👤 [CUPOM_SERVICE] Listando cupons da minha loja');
      
      const response = await api.get('/cupons/minha-loja');
      const cupons = response.data?.data || response.data || [];
      
      console.log(`✅ [CUPOM_SERVICE] Encontrados ${cupons.length} cupons`);
      return ImageUtils.processCupomList(cupons);
    } catch (error) {
      console.error('❌ [CUPOM_SERVICE] Erro ao listar cupons da loja:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar cupom por ID
   */
  async getById(id: string): Promise<Cupom> {
    try {
      console.log(`🔍 [CUPOM_SERVICE] Buscando cupom: ${id}`);
      
      const response = await api.get(`/cupons/${id}`);
      const cupom = response.data?.data || response.data;
      
      console.log('✅ [CUPOM_SERVICE] Cupom encontrado:', cupom.codigo);
      return ImageUtils.processCupom(cupom);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao buscar cupom ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar cupons por loja
   */
  async getByStore(lojaId: string): Promise<Cupom[]> {
    try {
      console.log(`🏪 [CUPOM_SERVICE] Buscando cupons da loja: ${lojaId}`);
      
      const response = await api.get(`/cupons/loja/${lojaId}`);
      const cupons = response.data?.data || response.data || [];
      
      console.log(`✅ [CUPOM_SERVICE] Encontrados ${cupons.length} cupons`);
      return ImageUtils.processCupomList(cupons);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao buscar cupons da loja ${lojaId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Listar cupons disponíveis (público)
   */
  async getAvailable(): Promise<Cupom[]> {
    try {
      console.log('🌐 [CUPOM_SERVICE] Listando cupons disponíveis');
      
      const response = await api.get('/cupons/disponiveis');
      const cupons = response.data?.data || response.data || [];
      
      console.log(`✅ [CUPOM_SERVICE] Encontrados ${cupons.length} cupons disponíveis`);
      return ImageUtils.processCupomList(cupons);
    } catch (error) {
      console.error('❌ [CUPOM_SERVICE] Erro ao listar cupons disponíveis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar cupom
   */
  async update(id: string, data: UpdateCupomDTO): Promise<Cupom> {
    try {
      console.log(`🔄 [CUPOM_SERVICE] Atualizando cupom: ${id}`);

      const formData = this.buildFormData(data);
      const response = await api.put(`/cupons/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const cupom = response.data?.data || response.data;
      console.log('✅ [CUPOM_SERVICE] Cupom atualizado:', id);
      
      return ImageUtils.processCupom(cupom);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao atualizar cupom ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Deletar cupom
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ [CUPOM_SERVICE] Deletando cupom: ${id}`);
      
      await api.delete(`/cupons/${id}`);
      
      console.log('✅ [CUPOM_SERVICE] Cupom deletado:', id);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao deletar cupom ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Gerar QR codes adicionais
   */
  async generateQrCodes(id: string, quantidade: number = 1): Promise<QrCodeResponse> {
    try {
      console.log(`📱 [CUPOM_SERVICE] Gerando ${quantidade} QR codes para cupom: ${id}`);
      
      const response = await api.post(`/cupons/${id}/qrcodes`, { quantidade });
      const resultado = response.data?.data || response.data;
      
      console.log('✅ [CUPOM_SERVICE] QR codes gerados');
      return resultado;
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao gerar QR codes:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar estatísticas do cupom
   */
  async getStats(id: string): Promise<EstatisticasCupom> {
    try {
      console.log(`📊 [CUPOM_SERVICE] Buscando estatísticas do cupom: ${id}`);
      
      const response = await api.get(`/cupons/${id}/estatisticas`);
      const stats = response.data?.data || response.data;
      
      console.log('✅ [CUPOM_SERVICE] Estatísticas recebidas');
      return stats;
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao buscar estatísticas:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Ativar cupom
   */
  async activate(id: string): Promise<Cupom> {
    try {
      console.log(`🔛 [CUPOM_SERVICE] Ativando cupom: ${id}`);
      
      const response = await api.patch(`/cupons/${id}/ativar`);
      const cupom = response.data?.data || response.data;
      
      console.log('✅ [CUPOM_SERVICE] Cupom ativado');
      return ImageUtils.processCupom(cupom);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao ativar cupom:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Desativar cupom
   */
  async deactivate(id: string): Promise<Cupom> {
    try {
      console.log(`🔚 [CUPOM_SERVICE] Desativando cupom: ${id}`);
      
      const response = await api.patch(`/cupons/${id}/desativar`);
      const cupom = response.data?.data || response.data;
      
      console.log('✅ [CUPOM_SERVICE] Cupom desativado');
      return ImageUtils.processCupom(cupom);
    } catch (error) {
      console.error(`❌ [CUPOM_SERVICE] Erro ao desativar cupom:`, error);
      throw this.handleError(error);
    }
  }

  // ================= MÉTODOS PRIVADOS =================

  /**
   * Construir FormData para envio
   */
  private buildFormData(data: any): FormData {
    const formData = new FormData();
    
    // Mapeamento de campos para FormData
    const fieldMappings = [
      'codigo', 'descricao', 'quantidadePorCliente', 'dataExpiracao',
      'lojaId', 'quantidadeQrCodes', 'precoOriginal', 'precoComDesconto',
      'percentualDesconto', 'nomeProduto'
    ];

    fieldMappings.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        formData.append(field, String(data[field]));
      }
    });

    // Logo (File)
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const formDataObj: any = {};
      formData.forEach((value, key) => {
        if (value instanceof File) {
          formDataObj[key] = `File: ${value.name}`;
        } else {
          formDataObj[key] = value;
        }
      });
      console.log('📦 FormData construído:', formDataObj);
    }

    return formData;
  }

  /**
   * Tratar erros da API
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Erro da API com resposta
      const message = error.response.data?.error || 
                     error.response.data?.message || 
                     `Erro ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro desconhecido
      return new Error(error.message || 'Erro inesperado. Tente novamente.');
    }
  }
}

// ================= EXPORTS =================

// Exportar instância única (singleton)
const cupomService = new CupomService();
export default cupomService;

// Exportar utilitários para uso em componentes
export { ImageUtils, FormatUtils };

// Exportar tipo do serviço para uso em testes/injeção
export type { CupomService };