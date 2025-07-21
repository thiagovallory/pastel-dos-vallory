import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleDarkMode from '../components/ToggleDarkMode';
import useSabores from '../hooks/useSabores';
import { pedidosAPI } from '../utils/api';
import { getContainerStyle, titleStyle, totalBoxStyle, totalValueStyle, getNomeClienteStyle } from '../styles/common';

function TelaPedido({ dark, setDark }) {
  const { sabores, loading, recarregarSabores } = useSabores();
  const [quantidades, setQuantidades] = useState({});
  const [nomeCliente, setNomeCliente] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  // Atualiza o estado de quantidades quando sabores mudam
  useEffect(() => {
    if (sabores.length > 0) {
      setQuantidades(q => {
        const novo = { ...q };
        sabores.forEach(s => { if (!("sabor_"+s.id in novo)) novo["sabor_"+s.id] = 0; });
        // Remove sabores antigos
        Object.keys(novo).forEach(k => {
          if (k.startsWith('sabor_') && !sabores.find(s => 'sabor_' + s.id === k)) delete novo[k];
        });
        return novo;
      });
    }
  }, [sabores]);

  // Cálculo do valor total
  const total =
    sabores.reduce((acc, s) => acc + (quantidades['sabor_' + s.id] || 0) * (s.valor || 0), 0);

  useEffect(() => {
    if (mensagem && mensagem.includes('sucesso')) {
      const timer = setTimeout(() => setMensagem(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  function alterarQuantidade(key, delta) {
    const saborId = key.replace('sabor_', '');
    const sabor = sabores.find(s => s.id === Number(saborId));
    const estoqueDisponivel = sabor?.qnt || 0;
    const quantidadeAtual = quantidades[key] || 0;
    const novaQuantidade = quantidadeAtual + delta;
    
    setQuantidades(q => ({
      ...q,
      [key]: Math.max(0, Math.min(novaQuantidade, estoqueDisponivel)),
    }));
  }

  async function fazerPedido() {
    if (total === 0) {
      setMensagem('Selecione pelo menos 1 item!');
      return;
    }
    setEnviando(true);
    setMensagem('');
    try {
      // Monta o payload com nome e todos os sabores
      const payload = { nome: nomeCliente };
      sabores.forEach(s => { payload['sabor_' + s.id] = quantidades['sabor_' + s.id] || 0; });
      const resp = await pedidosAPI.criar(payload);
      if (resp.ok) {
        // Zera quantidades e nome
        const zerado = {};
        sabores.forEach(s => { zerado['sabor_' + s.id] = 0; });
        setQuantidades(zerado);
        setNomeCliente('');
        setMensagem('Pedido enviado com sucesso!');
        // Recarrega os sabores para atualizar as quantidades disponíveis
        recarregarSabores();
      } else {
        setMensagem('Erro ao enviar pedido.');
      }
    } catch (error) {
      if (error.message.includes('Estoque insuficiente')) {
        setMensagem('Estoque insuficiente para alguns itens!');
      } else {
        setMensagem('Erro de conexão.');
      }
    }
    setEnviando(false);
  }

  return (
    <div style={getContainerStyle(dark)}>
      <h1 style={titleStyle}>
        Pastel<br />
        <span style={{ fontSize: 18, display: 'block' }}>dos</span>
        Vallory
      </h1>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      
      {/* Input do Nome */}
      <div style={{ margin: '0 auto', textAlign: 'center' }}>
        <input
          type="text"
          value={nomeCliente}
          onChange={e => setNomeCliente(e.target.value)}
          placeholder="Nome do cliente (opcional)"
          style={getNomeClienteStyle(dark)}
          disabled={enviando}
        />
      </div>
      
      <div style={totalBoxStyle(dark)}>
        Total a pagar <br />
        <div style={totalValueStyle(dark)}>
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div style={{ maxWidth: 380, height: 245, overflowY: 'auto', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Carregando sabores...</div>
        ) : (
          sabores.filter(sabor => sabor.fazendo === 1 && (sabor.qnt || 0) > 0).map(sabor => (
            <div key={sabor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ flex: '0 0 140px', fontSize: 22, textAlign: 'left' }}>
                <div>{sabor.nome}</div>
                <div style={{ fontSize: 12, color: dark ? '#888' : '#666' }}>
                  Disponível: {sabor.qnt || 0}
                </div>
              </div>
            <button
              style={{
                fontSize: 28,
                width: 60,
                height: 40,
                background: '#ff5252',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                marginRight: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: dark ? 'brightness(0.8)' : 'none',
                lineHeight: 0,
                padding: 0,
              }}
              onClick={() => alterarQuantidade('sabor_' + sabor.id, -1)}
              disabled={quantidades['sabor_' + sabor.id] === 0 || enviando}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <input
              type="text"
              value={quantidades['sabor_' + sabor.id] || 0}
              readOnly
              style={{
                fontSize: 28,
                width: 60,
                height: 40,
                borderRadius: 8,
                margin: '0 4px',
                background: dark ? '#181818' : '#fff',
                color: dark ? '#fff' : '#222',
                border: dark ? '1px solid #444' : '1px solid #ccc',
                textAlign: 'center',
                boxSizing: 'border-box',
                lineHeight: '40px',
                padding: 0,
                appearance: 'none',
                outline: 'none',
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
              }}
            />
            <button
              style={{
                fontSize: 28,
                width: 60,
                height: 40,
                background: '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                marginLeft: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: dark ? 'brightness(0.8)' : 'none',
                lineHeight: 0,
                padding: 0,
              }}
              onClick={() => alterarQuantidade('sabor_' + sabor.id, 1)}
              disabled={enviando || (quantidades['sabor_' + sabor.id] || 0) >= (sabor.qnt || 0)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="9" y="4" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        ))
        )}
      </div>
      <button
        onClick={fazerPedido}
        disabled={enviando || total === 0}
        style={{
          width: '300px',
          minWidth: 180,
          height: 56,
          fontSize: 26,
          padding: 0,
          margin: '20px auto 0 auto',
          background: mensagem && mensagem.includes('sucesso') ? '#43a047' : (dark ? '#ffb300' : '#ffb300'),
          border: 'none',
          borderRadius: 8,
          color: mensagem && mensagem.includes('sucesso') ? '#fff' : (dark ? '#222' : '#222'),
          fontWeight: 'bold',
          cursor: enviando || total === 0 ? 'not-allowed' : 'pointer',
          filter: dark && !(mensagem && mensagem.includes('sucesso')) ? 'brightness(0.9)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {enviando
          ? 'Enviando...'
          : mensagem && mensagem.includes('sucesso')
            ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#fff',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10.5L9 14L15 7" stroke="#43a047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Pedido enviado!
              </span>
            )
            : 'Pedir'}
      </button>
      <div style={{ textAlign: 'center', marginBottom: 5 }}>
        <button
          onClick={() => navigate('/pedidos')}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            padding: '12px 32px',
            marginTop: 9,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            width: 200,
            transition: 'background 0.2s',
          }}
        >
          Ver pedidos
        </button>
      </div>
    </div>
  );
}

export default TelaPedido; 