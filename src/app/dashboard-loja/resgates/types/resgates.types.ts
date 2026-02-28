export interface ResgateAdaptado {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  qrCodeValidado?: boolean;
  status?: string;
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

export interface Estatisticas {
  totalResgates: number;
  resgatesHoje: number;
  resgatesSemana: number;
  resgatesMes: number;
  clientesUnicos: number;
  mediaPorDia: number;
  taxaValidacao: number;
  valorTotalBruto: number;
  valorTotalVendido: number;
  valorTotalEconomizado: number;
  ticketMedio: number;
  percentualDoTotal: string;
}

export interface FiltrosResgate {
  search: string;
  cupomId: string;
  status: string;
  periodo: string;
}