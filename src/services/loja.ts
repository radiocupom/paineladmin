import api from './api';

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.radiocupom.online';
const API_BASE = API_URL.replace('/api', '');

// Função para tratar URL da imagem
function tratarImagemUrl(path?: string): string | undefined {
  if (!path) return undefined;
  
  // Se já for URL completa, retorna
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  
  // Corrigir barras invertidas do Windows
  let caminho = path.replace(/\\/g, '/');
  
  // Remover 'dashboard' do caminho se estiver presente
  caminho = caminho.replace(/^dashboard\//, '');
  
  // Se começar com /uploads, mantém
  if (caminho.startsWith('/uploads')) {
    return `${API_BASE}${caminho}`;
  }
  
  // Se começar com uploads/, adiciona barra
  if (caminho.startsWith('uploads/')) {
    return `${API_BASE}/${caminho}`;
  }
  
  // Se não tiver nada, assume que é um nome de arquivo
  return `${API_BASE}/uploads/${caminho}`;
}

export interface Loja {
  id: string;
  nome: string;
  email: string;
  logo?: string;
  payment: boolean;
  categoria: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface LojaComUsuario {
  loja: Loja;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface AtualizarMinhaLojaDTO {
  // Dados da loja
  nomeLoja?: string;
  categoria?: string;
  descricao?: string;
  logo?: File;
  
  // Dados do usuário
  nomeUsuario?: string;
  emailUsuario?: string;
  senhaUsuario?: string;
}


export interface CreateLojaDTO {
  nome: string;
  email: string;
  senha: string;
  categoria?: string;
  descricao?: string;
  logo?: File;
}

export interface CreateLojaComUsuarioDTO {
  nomeLoja: string;
  emailLoja: string;
  senhaLoja: string;
  categoria?: string;
  descricao?: string;
  nomeUsuario: string;
  emailUsuario: string;
  senhaUsuario: string;
  logo?: File;
}

export interface UpdateLojaDTO {
  nome?: string;
  email?: string;
  senha?: string;
  categoria?: string;
  descricao?: string;
  logo?: File;
  payment?: boolean;
}

class LojaService {
  /**
   * Criar loja COM usuário associado (rota /com-usuario)
   */
  async criarComUsuario(data: CreateLojaComUsuarioDTO): Promise<LojaComUsuario> {
    console.log('📤 Enviando dados para criar loja + usuário:', data);
    
    const formData = new FormData();
    
    // Dados da loja
    formData.append('nomeLoja', data.nomeLoja);
    formData.append('emailLoja', data.emailLoja);
    formData.append('senhaLoja', data.senhaLoja);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.descricao) formData.append('descricao', data.descricao);
    
    // Dados do usuário
    formData.append('nomeUsuario', data.nomeUsuario);
    formData.append('emailUsuario', data.emailUsuario);
    formData.append('senhaUsuario', data.senhaUsuario);
    
    // Arquivo
    if (data.logo) {
      formData.append('logo', data.logo);
      console.log('📎 Logo anexada:', data.logo.name);
    }

    // Log do FormData (versão compatível com TypeScript)
    console.log('📦 Campos do FormData:');
    // @ts-ignore - Ignorar erro de tipo para o loop
    for (let pair of formData.entries()) {
      const key = pair[0];
      const value = pair[1];
      console.log(`   - ${key}:`, value instanceof File ? `Arquivo: ${value.name}` : value);
    }

    try {
      const response = await api.post('/lojas/com-usuario', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Resposta do servidor:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erro na requisição:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Criar loja SEM usuário associado (rota /)
   */
  async criar(data: CreateLojaDTO): Promise<Loja> {
    const formData = new FormData();
    
    formData.append('nome', data.nome);
    formData.append('email', data.email);
    formData.append('senha', data.senha);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.descricao) formData.append('descricao', data.descricao);
    
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    const response = await api.post('/lojas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  /**
   * Listar todas as lojas
   */
  async listarTodas(): Promise<Loja[]> {
    const response = await api.get('/lojas');
    
    // Tratar URLs das logos
    if (Array.isArray(response.data)) {
      response.data.forEach((loja: Loja) => {
        if (loja.logo) {
          loja.logo = tratarImagemUrl(loja.logo);
        }
      });
    }
    
    return response.data;
  }

  /**
   * Buscar loja por ID
   */
  async buscarPorId(id: string): Promise<Loja> {
    const response = await api.get(`/lojas/${id}`);
    const loja = response.data;
    
    // Tratar URL da logo
    if (loja.logo) {
      loja.logo = tratarImagemUrl(loja.logo);
    }
    
    return loja;
  }

  /**
   * Buscar loja com dados do usuário
   */
  async buscarComUsuario(id: string): Promise<LojaComUsuario> {
    const response = await api.get(`/lojas/${id}/com-usuario`);
    const data = response.data;
    
    // Tratar URL da logo
    if (data.loja?.logo) {
      data.loja.logo = tratarImagemUrl(data.loja.logo);
    }
    
    return data;
  }

  /**
   * Atualizar loja
   */
  async atualizar(id: string, data: UpdateLojaDTO): Promise<Loja> {
    const formData = new FormData();
    
    if (data.nome) formData.append('nome', data.nome);
    if (data.email) formData.append('email', data.email);
    if (data.senha) formData.append('senha', data.senha);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.descricao) formData.append('descricao', data.descricao);
    
    if (data.payment !== undefined) {
      formData.append('payment', String(data.payment));
    }
    
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    const response = await api.put(`/lojas/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const loja = response.data;
    
    // Tratar URL da logo
    if (loja.logo) {
      loja.logo = tratarImagemUrl(loja.logo);
    }
    
    return loja;
  }

  /**
   * Ativar/desativar pagamento
   */
  async togglePayment(id: string, payment: boolean): Promise<Loja> {
    const response = await api.patch(`/lojas/${id}/payment`, { payment });
    const loja = response.data.loja;
    
    // Tratar URL da logo
    if (loja.logo) {
      loja.logo = tratarImagemUrl(loja.logo);
    }
    
    return loja;
  }

  /**
   * Lojista atualiza sua própria loja e dados do usuário
   */
  async atualizarMinhaLoja(data: AtualizarMinhaLojaDTO): Promise<Loja> {
    console.log('📤 Atualizando loja e usuário:', data);
    
    const formData = new FormData();
    
    // Dados da loja
    if (data.nomeLoja) formData.append('nomeLoja', data.nomeLoja);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.descricao) formData.append('descricao', data.descricao);
    
    // Dados do usuário
    if (data.nomeUsuario) formData.append('nomeUsuario', data.nomeUsuario);
    if (data.emailUsuario) formData.append('emailUsuario', data.emailUsuario);
    if (data.senhaUsuario) formData.append('senhaUsuario', data.senhaUsuario);
    
    // Logo
    if (data.logo) {
      formData.append('logo', data.logo);
      console.log('📎 Logo anexada:', data.logo.name);
    }

    // Log do FormData
    console.log('📦 Campos do FormData:');
    // @ts-ignore
    for (let pair of formData.entries()) {
      const key = pair[0];
      const value = pair[1];
      console.log(`   - ${key}:`, value instanceof File ? `Arquivo: ${value.name}` : value);
    }

    try {
      const response = await api.put('/lojas/minha-loja', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Loja e usuário atualizados:', response.data);
      
      const loja = response.data;
      
      // Tratar URL da logo
      if (loja.logo) {
        loja.logo = tratarImagemUrl(loja.logo);
      }
      
      return loja;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Deletar loja
   */
  async deletar(id: string): Promise<void> {
    await api.delete(`/lojas/${id}`);
  }
 
  /**
   * Estatísticas da loja
   */
  async getEstatisticas(id: string): Promise<any> {
    const response = await api.get(`/lojas/${id}/estatisticas`);
    return response.data;
  }

  

  
}

export default new LojaService();