import api from './api';
import { getImageUrl } from '@/lib/image-utils';

export interface QRCodeItem {
  id: string;
  codigo: string;
  cupomId: string;
  cupomCodigo: string;
  cupomDescricao: string;
  cupomLogo?: string;
  usadoEm: string;
  validado: boolean;
  validadoEm: string | null;
  cliente?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface QRCodeItemComImagem extends QRCodeItem {
  imagem: string;
}

class QrCodeService {
  /**
   * Listar QR codes da loja do lojista logado
   */
  async listarQrCodesLoja(): Promise<QRCodeItem[]> {
    const response = await api.get('/front/qrcodes/loja');
    
    // Tratar URLs das logos
    if (Array.isArray(response.data.data)) {
      response.data.data.forEach((qr: QRCodeItem) => {
        if (qr.cupomLogo) {
          qr.cupomLogo = getImageUrl(qr.cupomLogo);
        }
      });
    }
    
    return response.data.data;
  }
}

export default new QrCodeService();