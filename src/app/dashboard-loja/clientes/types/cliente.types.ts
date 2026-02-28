// types/cliente.types.ts
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais: string;
  genero?: string;
  dataNascimento?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  receberOfertas: boolean;
  comoConheceu?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  ultimoLogin?: string;
}

export interface CupomResgate {
  id: string;
  codigo: string;
  descricao: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  nomeProduto?: string;
  loja?: {
    nome: string;
    logo: string;
  };
}

export interface Resgate {
  id: string;
  quantidade: number;
  resgatadoEm: string;
  cupomId: string;
  cupomCodigo?: string;
  cupomDescricao?: string;
  cupom: CupomResgate;
  qrCodeValidado?: boolean;
  qrCodeValidadoEm?: string | null;
}

export interface ClienteWithResgates extends Cliente {
  resgates: Resgate[];
}

export interface ClienteLoja extends Cliente {
  totalResgates: number;
  totalCupons: number;
  primeiroResgate: string | null;
  ultimoResgate: string | null;
  resgates: Resgate[];
}

export interface MetricasCliente {
  totalResgates: number;
  totalGasto: number;
  totalEconomia: number;
  cuponsUnicos: number;
  mediaPorResgate: number;
  primeiroResgate?: string;
  ultimoResgate?: string;
}

export interface CupomInfo {
  id: string;
  codigo: string;
  descricao: string;
  precoOriginal?: number;
  precoComDesconto?: number;
  nomeProduto?: string;
}