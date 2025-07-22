import React from 'react';
import { pedidosAPI } from '../utils/api';

function DetalhePedido({ pedido, dark, onMarcarFeito, onMarcarPendente, sabores }) {
  const [editando, setEditando] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    function atualizar() {
      if (typeof window !== 'undefined') {
        // Força atualização do componente pai (TelaPedidos)
        if (window.atualizarPedidos) window.atualizarPedidos();
      }
    }
    window.addEventListener('atualizarPedidos', atualizar);
    return () => window.removeEventListener('atualizarPedidos', atualizar);
  }, []);

  if (!pedido) return <div style={{ fontSize: 20, color: '#888', textAlign: 'center' }}>Selecione um pedido</div>;
  
  // Dividir sabores em duas colunas equilibradas
  const metade = Math.ceil(sabores.length / 2);
  const col1 = sabores.slice(0, metade);
  const col2 = sabores.slice(metade);

  async function atualizarQuantidade(saborId, valor) {
    setLoading(true);
    await pedidosAPI.atualizarSabor(pedido.id, saborId, valor);
    setEditando(e => ({ ...e, [saborId]: undefined }));
    setLoading(false);
    // Força atualização do pedido na tela (emitir evento ou recarregar pedidos)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('atualizarPedidos'));
    }
  }

  function renderCol(col) {
    return col.map(sabor => (
      <div key={sabor.id} style={{ fontSize: 20, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 70 }}>{sabor.nome}:</span>
        <input
          type="text"
          value={editando[sabor.id] !== undefined ? editando[sabor.id] : pedido['sabor_' + sabor.id] || 0}
          disabled={loading || pedido.feito}
          style={{ width: 50, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', textAlign: 'center', background: dark ? '#181818' : '#fff', color: dark ? '#fff' : '#222' }}
          onChange={e => {
            const v = e.target.value;
            setEditando(ed => ({ ...ed, [sabor.id]: v }));
          }}
          onBlur={e => {
            const v = Number(e.target.value);
            if (v !== pedido['sabor_' + sabor.id]) atualizarQuantidade(sabor.id, v);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
        />
      </div>
    ));
  }

  return (
    <div style={{ padding: 20, border: '1px solid #eee', borderRadius: 10, background: dark ? '#181818' : '#fafafa', minWidth: 220, textAlign: 'left', color: dark ? '#fff' : '#222' }}>
      <h2 style={{ fontSize: 24, margin: '0 auto 18px auto', textAlign: 'center' }}>Detalhes dos pedidos</h2>
      <div style={{ display: 'flex', gap: 24, marginBottom: 5 }}>
        <div style={{ flex: 1 }}>{renderCol(col1)}</div>
        <div style={{ flex: 1 }}>{renderCol(col2)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, color: dark ? '#888' : '#aaa' }}>
            Criado em: {pedido.criado_UTC && new Date(pedido.criado_UTC + 'Z').toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 14, color: dark ? '#888' : '#aaa' }}>
            Pronto em: {pedido.pronto_UTC ? new Date(pedido.pronto_UTC + 'Z').toLocaleString('pt-BR') : '-'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, color: dark ? '#888' : '#aaa', marginTop: 2 }}>
            Valor:
          </div>
          <div style={{ fontSize: 16, color: dark ? '#888' : '#aaa', marginTop: 2 }}>
            R$ {pedido.valor_total ? pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </div>
        </div>
      </div>
      {pedido.feito
        ? (
          <button
            onClick={() => onMarcarPendente(pedido.id)}
            style={{
              marginTop: 10,
              background: '#ffb300',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              padding: '10px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            Marcar como pendente
          </button>
        )
        : (
          <button
            onClick={() => onMarcarFeito(pedido.id)}
            style={{
              marginTop: 10,
              background: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              padding: '10px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            Marcar como feito
          </button>
        )
      }
    </div>
  );
}

export default DetalhePedido; 