import { BASE_URL } from './config';

// API para Pedidos
export const pedidosAPI = {
  criar: async (payload) => {
    const resp = await fetch(`${BASE_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    // Se não foi bem sucedido, tentar ler a mensagem de erro
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao criar pedido');
    }
    
    return resp;
  },

  listar: async () => {
    const resp = await fetch(`${BASE_URL}/api/pedidos`);
    return resp.json();
  },

  obterItens: async (pedidoId) => {
    const resp = await fetch(`${BASE_URL}/api/pedidos/${pedidoId}/itens`);
    return resp.json();
  },

  marcarFeito: async (id, feito) => {
    return fetch(`${BASE_URL}/api/pedidos/${id}/feito`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feito })
    });
  },

  atualizarSabor: async (pedidoId, saborId, quantidade) => {
    return fetch(`${BASE_URL}/api/pedidos/${pedidoId}/sabor/${saborId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: Number(quantidade) })
    });
  }
};

// API para Sabores
export const saboresAPI = {
  listar: async () => {
    const resp = await fetch(`${BASE_URL}/api/sabores`);
    return resp.json();
  },

  criar: async (nome, valor) => {
    return fetch(`${BASE_URL}/api/sabores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), valor: valor ? Number(valor.replace(',', '.')) : 0 })
    });
  },

  atualizar: async (id, campo, valor) => {
    return fetch(`${BASE_URL}/api/sabores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: valor })
    });
  }
}; 