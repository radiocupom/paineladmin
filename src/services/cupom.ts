// services/cupom.ts
import api from './api';
import { getImageUrl } from '@/lib/image-utils';

export interface Cupom {
  id: string;
  codigo: string;
  descricao: string;
  quantidadePorCliente: number;
  dataExpiracao: string;
  lojaId: string;
  logo: string;
  
  // 🔥 CAMPOS DE PREÇO
  precoOriginal?: number;
  precoComDesconto?: number;
  percentualDesconto?: number;
  nomeProduto?: string;
  
  totalQrCodes: number;
  qrCodesUsados: number;
  createdAt: string;
  updatedAt: string;
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
  
  // 🔥 CAMPOS DE PREÇO (OPCIONAIS)
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
  
  // 🔥 CAMPOS DE PREÇO (OPCIONAIS)
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
    
    // 🔥 CAMPOS DE PREÇO
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
    
    // 🔥 ESTATÍSTICAS FINANCEIRAS
    valorTotalResgatado: number;
    valorTotalVendido: number;
    valorTotalEconomizado: number;
    mediaTicket: number;
    taxaConversao: number;
    resgatesPendentes: number;
    resgatesValidados: number;
  };
  // 🔥 LISTAS DETALHADAS
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

class CupomService {
  /**
   * Criar novo cupom
   */
  async criar(data: CreateCupomDTO): Promise<Cupom> {
    const formData = new FormData();
    
    // Campos obrigatórios
    formData.append('codigo', data.codigo);
    formData.append('descricao', data.descricao);
    formData.append('quantidadePorCliente', String(data.quantidadePorCliente));
    formData.append('dataExpiracao', data.dataExpiracao);
    formData.append('lojaId', data.lojaId);
    
    // Campos opcionais
    if (data.quantidadeQrCodes) {
      formData.append('quantidadeQrCodes', String(data.quantidadeQrCodes));
    }
    
    // 🔥 CAMPOS DE PREÇO
    if (data.precoOriginal !== undefined) {
      formData.append('precoOriginal', String(data.precoOriginal));
    }
    if (data.precoComDesconto !== undefined) {
      formData.append('precoComDesconto', String(data.precoComDesconto));
    }
    if (data.percentualDesconto !== undefined) {
      formData.append('percentualDesconto', String(data.percentualDesconto));
    }
    if (data.nomeProduto) {
      formData.append('nomeProduto', data.nomeProduto);
    }
    
    // Logo
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    const response = await api.post('/cupons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Tratar URL da logo
    if (response.data.logo) {
      response.data.logo = getImageUrl(response.data.logo);
    }
    
    return response.data;
  }

  /**
   * Listar todos os cupons (admin/superadmin)
   */
  async listarTodas(): Promise<Cupom[]> {
    const response = await api.get('/cupons');
    
    // Tratar URLs das logos
    if (Array.isArray(response.data)) {
      response.data.forEach((cupom: Cupom) => {
        if (cupom.logo) {
          cupom.logo = getImageUrl(cupom.logo);
        }
        if (cupom.loja?.logo) {
          cupom.loja.logo = getImageUrl(cupom.loja.logo);
        }
      });
    }
    
    return response.data;
  }

  /**
   * Listar cupons da própria loja (para lojista)
   */
  async listarMeusCupons(): Promise<Cupom[]> {
    const response = await api.get('/cupons/minha-loja');
    
    // Tratar URLs das logos
    if (Array.isArray(response.data)) {
      response.data.forEach((cupom: Cupom) => {
        if (cupom.logo) {
          cupom.logo = getImageUrl(cupom.logo);
        }
        if (cupom.loja?.logo) {
          cupom.loja.logo = getImageUrl(cupom.loja.logo);
        }
      });
    }
    
    return response.data;
  }

  /**
   * Buscar cupom por ID
   */
  async buscarPorId(id: string): Promise<Cupom> {
    const response = await api.get(`/cupons/${id}`);
    const cupom = response.data;
    
    // Tratar URL da logo
    if (cupom.logo) {
      cupom.logo = getImageUrl(cupom.logo);
    }
    if (cupom.loja?.logo) {
      cupom.loja.logo = getImageUrl(cupom.loja.logo);
    }
    
    return cupom;
  }

  /**
   * Buscar cupons por loja
   */
  async buscarPorLoja(lojaId: string): Promise<Cupom[]> {
    const response = await api.get(`/cupons/loja/${lojaId}`);
    
    // Tratar URLs das logos
    if (Array.isArray(response.data)) {
      response.data.forEach((cupom: Cupom) => {
        if (cupom.logo) {
          cupom.logo = getImageUrl(cupom.logo);
        }
      });
    }
    
    return response.data;
  }

  /**
   * Atualizar cupom
   */
  async atualizar(id: string, data: UpdateCupomDTO): Promise<Cupom> {
    const formData = new FormData();
    
    // Campos existentes
    if (data.codigo) formData.append('codigo', data.codigo);
    if (data.descricao) formData.append('descricao', data.descricao);
    if (data.quantidadePorCliente !== undefined) {
      formData.append('quantidadePorCliente', String(data.quantidadePorCliente));
    }
    if (data.dataExpiracao) formData.append('dataExpiracao', data.dataExpiracao);
    
    // 🔥 CAMPOS DE PREÇO
    if (data.precoOriginal !== undefined) {
      formData.append('precoOriginal', String(data.precoOriginal));
    }
    if (data.precoComDesconto !== undefined) {
      formData.append('precoComDesconto', String(data.precoComDesconto));
    }
    if (data.percentualDesconto !== undefined) {
      formData.append('percentualDesconto', String(data.percentualDesconto));
    }
    if (data.nomeProduto) {
      formData.append('nomeProduto', data.nomeProduto);
    }
    
    // Logo
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    const response = await api.put(`/cupons/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Tratar URL da logo
    if (response.data.logo) {
      response.data.logo = getImageUrl(response.data.logo);
    }
    
    return response.data;
  }

  /**
   * Deletar cupom
   */
  async deletar(id: string): Promise<void> {
    await api.delete(`/cupons/${id}`);
  }

  /**
   * Gerar QR codes adicionais
   */
  async gerarQrCodes(id: string, quantidade: number = 1): Promise<QrCodeResponse> {
    try {
      const response = await api.post(`/cupons/${id}/qrcodes`, { quantidade });
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao gerar QR codes:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas do cupom
   */
  async getEstatisticas(id: string): Promise<EstatisticasCupom> {
    try {
      const response = await api.get(`/cupons/${id}/estatisticas`);
      
      // 🔥 LOG PARA DEBUG
      console.log('📊 Estatísticas recebidas:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Listar cupons disponíveis (público)
   */
  async listarDisponiveis(): Promise<Cupom[]> {
    const response = await api.get('/cupons/disponiveis');
    
    // Tratar URLs das logos
    if (Array.isArray(response.data)) {
      response.data.forEach((cupom: Cupom) => {
        if (cupom.logo) {
          cupom.logo = getImageUrl(cupom.logo);
        }
        if (cupom.loja?.logo) {
          cupom.loja.logo = getImageUrl(cupom.loja.logo);
        }
      });
    }
    
    return response.data;
  }

  /**
   * Formatar valor para exibição
   */
  formatarMoeda(valor: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}

export default new CupomService();