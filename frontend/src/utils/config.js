// Função para obter a URL base dinamicamente
function getDynamicBaseUrl() {
  const currentHost = window.location.hostname;
  
  // Se estiver acessando via IP (não localhost), usa o mesmo IP para o backend
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001`;
  }
  
  // Para desenvolvimento local
  return 'http://localhost:3001';
}

export const BASE_URL = getDynamicBaseUrl(); 