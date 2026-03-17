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

export interface ConsultaQRCodeResponse {
  success: boolean;
  data: {
    cliente: {
      id: string;
      nome: string;
      email: string;
      whatsapp: string;
    };
    cupom: {
      id: string;
      codigo: string;
      descricao: string;
      titulo: string;
      nomeProduto: string;
      precoOriginal: number;
      precoComDesconto: number;
      percentualDesconto: number;
      dataExpiracao: string;
      termos: string;
      observacoes: string;
      loja: {
        id: string;
        nome: string;
        logo: string;
      };
    };
    qrCode: {
      id: string;
      codigo: string;
      usadoEm: string;
      validado: boolean;
      validadoEm: string | null;
    };
    status: {
      podeValidar: boolean;
      motivos: string[];
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
      console.error('🔴 Erro na validação:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      throw error;
    }
  }

  /**
   * Consultar dados do QR code sem validar
   * GET /api/front/qrcode/dados/:qrCodeId
   */
  async consultarDadosQRCode(qrCodeId: string): Promise<ConsultaQRCodeResponse> {
    try {
      console.log('🔵 Consultando dados do QR code:', { qrCodeId });
      
      const response = await api.get(`/front/qrcode/dados/${qrCodeId}`);
      
      console.log('✅ Dados do QR code:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Erro ao consultar QR code:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw error;
    }
  }

  /**
   * Confirmar validação do QR code (após consulta)
   * POST /api/front/validar-qrcode (com qrCodeId)
   */
  async confirmarValidacao(qrCodeId: string): Promise<ValidacaoResponse> {
    try {
      console.log('🔵 Confirmando validação do QR code:', { qrCodeId });
      
      const response = await api.post('/front/validar-qrcode', { qrCodeId });
      
      console.log('✅ Validação confirmada:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Erro ao confirmar validação:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      throw error;
    }
  }
}

export default new ValidacaoService();