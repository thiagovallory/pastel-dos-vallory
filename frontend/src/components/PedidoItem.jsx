import React from 'react';
import { useSwipeable } from 'react-swipeable';

function PedidoItem({ pedido, idx, selecionado, setSelecionado, dark, produtos, marcarFeito, marcarPendente }) {
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (!pedido.feito) marcarFeito(pedido.id);
    },
    onSwipedLeft: () => {
      if (pedido.feito) marcarPendente(pedido.id);
    },
    trackMouse: true
  });
  
  // Soma apenas os campos de sabores (sabor_X)
  const totalSabores = produtos
    .map(sabor => pedido['sabor_' + sabor.id] || 0)
    .reduce((a, b) => a + b, 0);
  const totalItens = totalSabores;
  
  return (
    <div
      key={pedido.id}
      {...handlers}
      onClick={() => setSelecionado(idx)}
      style={{
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        background: idx === selecionado ? (dark ? '#473200' : '#ffe082') : pedido.feito ? (dark ? '#444' : '#eee') : (dark ? '#232323' : '#fff'),
        border: idx === selecionado ? '2px solid #ffb300' : '2px solid #eee',
        cursor: 'pointer',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.2s',
        color: dark ? '#fff' : '#222',
        touchAction: 'pan-y',
      }}
    >
      <div>
        <div>#{pedido.id} - {totalItens} {totalItens === 1 ? 'item' : 'itens'}</div>
        {pedido.nome && (
          <div style={{ textAlign: 'left', fontSize: 14, color: dark ? '#888' : '#666', marginTop: 2 }}>
            {pedido.nome}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          id="detalhePedido"
          onClick={(e) => {
            e.stopPropagation();
            // Função será implementada no componente pai
            if (window.showPedidoDetalhes) {
              window.showPedidoDetalhes(pedido.id);
            }
          }}
          style={{
            background: dark ? 'mediumpurple' : 'purple',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Detalhes
        </button>
        <span style={{ color: pedido.feito ? 'green' : '#ffb300', fontWeight: 'bold', width: 91 }}>
          {pedido.feito ? 'Feito' : 'Pendente'}
        </span>
      </div>
    </div>
  );
}

export default PedidoItem; 