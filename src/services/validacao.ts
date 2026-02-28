import api from './api';

export interface ValidacaoResponse {
  success: boolean;
  message: string;
  valido?: boolean;
  data?: {
    codigo: string;
    usadoEm?: string;
    validadoEm?: string;
    valorEm?: string;
    primeiraValidacao?: string;
    cliente?: {
      id: string;
      nome: string;
      email: string;
    };
    cupom?: {
      id: string;
      descricao: string;
      codigo: string;
    };
    loja?: {
      nome: string;
    };
  };
}

class ValidacaoService {
  /**
   * Validar QR code na loja
   * POST /api/front/validar-qrcode
   */
  async validarQRCode(codigo: string): Promise<ValidacaoResponse> {
    try {
      console.log('🔵 Enviando requisição para validar QR code:', { codigo });
      
      const response = await api.post('/front/validar-qrcode', { codigo });
      
      console.log('✅ Resposta:', response.data);
      return response.data;
      
    } catch (error: any) {
      // 🔥 LOG MAIS DETALHADO
      console.error('🔴 Erro na validação - DETALHES:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Se o erro veio do servidor com dados, retorna eles
      if (error.response?.data) {
        return error.response.data;
      }
      
      // Se não, lança o erro para ser capturado pelo componente
      throw error;
    }
  }
}

export default new ValidacaoService();