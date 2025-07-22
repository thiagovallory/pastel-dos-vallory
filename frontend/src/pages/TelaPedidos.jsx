import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleDarkMode from '../components/ToggleDarkMode';
import PedidoItem from '../components/PedidoItem';
import DetalhePedido from '../components/DetalhePedido';
import useSabores from '../hooks/useSabores';
import { pedidosAPI } from '../utils/api';
import { getContainerStyle } from '../styles/common';

function TelaPedidos({ dark, setDark }) {
  const [pedidos, setPedidos] = useState([]);
  const [selecionado, setSelecionado] = useState(0);
  const [detalhesPedido, setDetalhesPedido] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const listaRef = useRef();
  const navigate = useNavigate();
  const { sabores } = useSabores();

  useEffect(() => {
    buscarPedidos();
    const interval = setInterval(buscarPedidos, 3000);
    return () => clearInterval(interval);
  }, []);

  // Função para mostrar detalhes do pedido
  const showPedidoDetalhes = async (pedidoId) => {
    try {
      const itens = await pedidosAPI.obterItens(pedidoId);
      const pedido = pedidos.find(p => p.id === pedidoId);
      setDetalhesPedido({ id: pedidoId, nome: pedido?.nome, itens });
      setShowDetalhes(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
    }
  };

  // Expor função globalmente
  useEffect(() => {
    window.showPedidoDetalhes = showPedidoDetalhes;
    return () => {
      delete window.showPedidoDetalhes;
    };
  }, []);

  async function buscarPedidos() {
    try {
      const data = await pedidosAPI.listar();
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowDown') {
        setSelecionado(s => Math.min(s + 1, pedidos.length - 1));
      } else if (e.key === 'ArrowUp') {
        setSelecionado(s => Math.max(s - 1, 0));
      } else if (e.key === 'Enter' && pedidos[selecionado] && !pedidos[selecionado].feito) {
        marcarFeito(pedidos[selecionado].id);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pedidos, selecionado]);

  async function marcarFeito(id) {
    try {
      await pedidosAPI.marcarFeito(id, 1);
      buscarPedidos();
    } catch (error) {
      console.error('Erro ao marcar pedido como feito:', error);
    }
  }

  async function marcarPendente(id) {
    try {
      await pedidosAPI.marcarFeito(id, 0);
      buscarPedidos();
    } catch (error) {
      console.error('Erro ao marcar pedido como pendente:', error);
    }
  }

  return (
    <div style={getContainerStyle(dark)}>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      <div style={{ marginBottom: 10 }}>
        <DetalhePedido pedido={pedidos[selecionado]} dark={dark} onMarcarFeito={marcarFeito} onMarcarPendente={marcarPendente} sabores={sabores} />
      </div>
      <div style={{ height: 320, overflowY: 'auto', marginBottom: 10 }} ref={listaRef}>
        {pedidos.length === 0 && <div style={{ textAlign: 'center', color: '#888' }}>Nenhum pedido ainda.</div>}
        {pedidos.map((pedido, idx) => (
          <PedidoItem
            key={pedido.id}
            pedido={pedido}
            idx={idx}
            selecionado={selecionado}
            setSelecionado={setSelecionado}
            dark={dark}
            produtos={sabores}
            marcarFeito={marcarFeito}
            marcarPendente={marcarPendente}
          />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 5, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/pedir')}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            padding: '12px 32px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            transition: 'background 0.2s',
            width: 200,
          }}
        >
          Fazer novo pedido
        </button>
      </div>

      {/* Popup de Detalhes */}
      {showDetalhes && detalhesPedido && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: dark ? '#232323' : '#fff',
            borderRadius: 12,
            padding: 20,
            maxWidth: 400,
            width: '90%',
            maxHeight: '80%',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            color: dark ? '#fff' : '#222',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, color: dark ? 'mediumpurple' : 'purple' }}>Pedido #{detalhesPedido.id}</h2>
                {detalhesPedido.nome && (
                  <div style={{ fontSize: 16, color: dark ? '#888' : '#666', marginTop: 4 }}>
                    Cliente: {detalhesPedido.nome}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetalhes(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: dark ? 'mediumpurple' : 'purple',
                  padding: 0,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 18, color: dark ? 'mediumpurple' : 'purple' }}>Itens do Pedido:</h3>
              {detalhesPedido.itens.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid',
                  borderColor: dark ? 'mediumpurple' : 'purple',
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: dark ? 'mediumpurple' : 'purple', textAlign: 'left' }}>{item.sabor_nome}</div>
                    <div style={{ fontSize: 14, color: dark ? '#c3a8fb' : 'mediumpurple', textAlign: 'left', marginLeft: 10 }}>
                      {item.quantidade}x R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: 16, color: dark ? 'mediumpurple' : 'purple' }}>
                    R$ {item.valor_total_item.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              paddingTop: 15,
              textAlign: 'right',
              fontSize: 18,
              fontWeight: 'bold',
              color: dark ? 'mediumpurple' : 'purple'
            }}>
              Total: R$ {detalhesPedido.itens.reduce((total, item) => total + item.valor_total_item, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TelaPedidos; 