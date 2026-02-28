// URL base da API (sem o /api)
const API_URL =  'https://api.radiocupom.online';
const API_BASE = API_URL.replace('/api', '');

/**
 * Converte um caminho de imagem para URL absoluta
 * Exemplo: "uploads\logo-1771274028977-510708990.png" → "https://api.radiocupom.online/uploads/logo-1771274028977-510708990.png"
 */
export function getImageUrl(path?: string): string {
  if (!path) return '';
  
  // Se já for URL completa, retorna ela mesma
  if (path.startsWith('http')) return path;
  
  // Se for data URL (base64), retorna ela mesma
  if (path.startsWith('data:')) return path;
  
  // 🔥 CORREÇÃO PRINCIPAL: substituir barras invertidas do Windows
  let caminhoCorrigido = path.replace(/\\/g, '/');
  
  // 🔥 Remover qualquer referência a 'dashboard' que possa ter vindo do front
  caminhoCorrigido = caminhoCorrigido.replace(/^dashboard\//, '');
  
  // 🔥 Garantir que o caminho comece com 'uploads/'
  // Se já começar com /uploads, remove a barra extra
  if (caminhoCorrigido.startsWith('/uploads/')) {
    return `${API_BASE}${caminhoCorrigido}`;
  }
  
  // Se começar com uploads/ (sem barra), adiciona a barra
  if (caminhoCorrigido.startsWith('uploads/')) {
    return `${API_BASE}/${caminhoCorrigido}`;
  }
  
  // Se for apenas o nome do arquivo (sem pasta), assume que está em uploads/
  return `${API_BASE}/uploads/${caminhoCorrigido}`;
}

/**
 * Versão com fallback para quando a imagem não carrega
 */
export function getImageUrlWithFallback(path?: string, fallbackText: string = '📷'): string {
  const url = getImageUrl(path);
  
  // Adiciona um parâmetro para evitar cache de imagens com erro
  return url ? `${url}?t=${Date.now()}` : '';
}