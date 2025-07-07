import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
// import { useRouter } from 'next/router'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

const BASE_URL = 'http://192.168.3.217:3001';

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.body.style.background = dark ? '#181818' : '#f1f1f1';
    document.body.style.color = dark ? '#eee' : '#222';
  }, [dark]);
  return [dark, setDark];
}

function ToggleDarkMode({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(d => !d)}
      style={{
        position: 'absolute',
        right: 14,
        top: 10,
        background: dark ? '#333' : '#fff',
        color: dark ? '#fff' : '#222',
        border: 'none',
        borderRadius: 20,
        padding: '5px 8px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px #0002',
      }}
      aria-label="Alternar modo escuro"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}

function useSabores() {
  const [sabores, setSabores] = useState([]);
  useEffect(() => {
    fetch(`${BASE_URL}/api/sabores`)
      .then(r => r.json())
      .then(data => setSabores(data));
  }, []);
  return sabores;
}

function TelaPedido({ dark, setDark }) {
  const sabores = useSabores();
  const [quantidades, setQuantidades] = useState({});
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
    sabores.reduce((acc, s) => acc + (quantidades['sabor_' + s.id] || 0) * (s.nome === 'Caldo' ? 5 : 12), 0);

  useEffect(() => {
    if (mensagem && mensagem.includes('sucesso')) {
      const timer = setTimeout(() => setMensagem(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  function alterarQuantidade(key, delta) {
    setQuantidades(q => ({
      ...q,
      [key]: Math.max(0, (q[key] || 0) + delta),
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
      // Monta o payload com todos os sabores
      const payload = {};
      sabores.forEach(s => { payload['sabor_' + s.id] = quantidades['sabor_' + s.id] || 0; });
      const resp = await fetch(`${BASE_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        // Zera quantidades
        const zerado = {};
        sabores.forEach(s => { zerado['sabor_' + s.id] = 0; });
        setQuantidades(zerado);
        setMensagem('Pedido enviado com sucesso!');
      } else {
        setMensagem('Erro ao enviar pedido.');
      }
    } catch {
      setMensagem('Erro de conexão.');
    }
    setEnviando(false);
  }

  return (
    <div style={{ width: 380,
  margin: '0 auto',
  fontFamily: 'sans-serif',
  background: dark ? '#232323' : '#fff',
  borderRadius: 16,
  boxShadow: dark ? '0 2px 16px #0008' : '0 2px 16px #0001',
  padding: 10,
  height: 709 }}>
      <h1 style={{ fontSize: 35, textAlign: 'center', marginBottom: 24, lineHeight: 1.1 }}>
        Pastel<br />
        <span style={{ fontSize: 18, display: 'block' }}>dos</span>
        Vallory
      </h1>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      <div style={{ width: 280, margin: '0 auto 26px auto', fontSize: 24, textAlign: 'center', padding: 24, border: '1px solid #eee', borderRadius: 10, background: dark ? '#181818' : '#fafafa', color: dark ? '#fff' : '#222' }}>
        Total a pagar <br />
        <div
          style={{
            margin: '10px auto 0 auto',
            display: 'inline-block',
            background: dark ? '#333' : '#ffe082',
            color: dark ? '#fff' : '#222',
            padding: '8px 24px',
            borderRadius: 12,
            fontWeight: 'bold',
            fontSize: 28,
            boxShadow: dark ? '0 2px 8px #0004' : '0 2px 8px #0001',
            minWidth: 120,
          }}
        >
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div style={{ maxWidth: 380, height: 245, overflowY: 'auto', margin: '0 auto' }}>
        {sabores.filter(sabor => sabor.fazendo === 1).map(sabor => (
          <div key={sabor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <span style={{ flex: '0 0 140px', fontSize: 22, textAlign: 'left' }}>{sabor.nome}</span>
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
              disabled={enviando}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="9" y="4" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        ))}
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
        background: idx === selecionado ? (dark ? '#333' : '#ffe082') : pedido.feito ? (dark ? '#444' : '#e0e0e0') : (dark ? '#232323' : '#fff'),
        border: idx === selecionado ? '2px solid #ffb300' : '1px solid #eee',
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
      <span>
        #{pedido.id} - {totalItens} itens
      </span>
      <span style={{ color: pedido.feito ? 'green' : '#ffb300', fontWeight: 'bold' }}>
        {pedido.feito ? 'Feito' : 'Pendente'}
      </span>
    </div>
  );
}

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
    await fetch(`${BASE_URL}/api/pedidos/${pedido.id}/sabor/${saborId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: Number(valor) })
    });
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
          type="number"
          min={0}
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
    <div style={{ padding: 24, border: '1px solid #eee', borderRadius: 10, background: dark ? '#181818' : '#fafafa', minWidth: 220, textAlign: 'left', color: dark ? '#fff' : '#222' }}>
      <h2 style={{ fontSize: 24, margin: '0 auto 18px auto', textAlign: 'center' }}>Detalhes dos pedidos</h2>
      <div style={{ display: 'flex', gap: 24, marginBottom: 5 }}>
        <div style={{ flex: 1 }}>{renderCol(col1)}</div>
        <div style={{ flex: 1 }}>{renderCol(col2)}</div>
      </div>
      <div style={{ fontSize: 14, color: dark ? '#888' : '#aaa' }}>
        Criado em: {pedido.criado_UTC && new Date(pedido.criado_UTC + 'Z').toLocaleString('pt-BR')}
      </div>
      <div style={{ fontSize: 14, color: dark ? '#888' : '#aaa' }}>
        Pronto em: {pedido.pronto_UTC ? new Date(pedido.pronto_UTC + 'Z').toLocaleString('pt-BR') : '-'}
      </div>
      {pedido.feito
        ? (
          <button
            onClick={() => onMarcarPendente(pedido.id)}
            style={{
              marginTop: 16,
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
              marginTop: 16,
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

function TelaPedidos({ dark, setDark }) {
  const [pedidos, setPedidos] = useState([]);
  const [selecionado, setSelecionado] = useState(0);
  const listaRef = useRef();
  const navigate = useNavigate();
  const sabores = useSabores();

  useEffect(() => {
    buscarPedidos();
    const interval = setInterval(buscarPedidos, 3000);
    return () => clearInterval(interval);
  }, []);

  function buscarPedidos() {
    fetch(`${BASE_URL}/api/pedidos`)
      .then(r => r.json())
      .then(data => setPedidos(data));
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

  function marcarFeito(id) {
    fetch(`${BASE_URL}/api/pedidos/${id}/feito`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feito: 1 })
    }).then(() => buscarPedidos());
  }

  function marcarPendente(id) {
    fetch(`${BASE_URL}/api/pedidos/${id}/feito`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feito: 0 })
    }).then(() => buscarPedidos());
  }

  return (
    <div style={{ width: 380, margin: '0 auto', fontFamily: 'sans-serif', background: dark ? '#232323' : '#fff', borderRadius: 16, boxShadow: dark ? '0 2px 16px #0008' : '0 2px 16px #0001', padding: 10, height: 709 }}>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      <div style={{ marginBottom: 10 }}>
        <DetalhePedido pedido={pedidos[selecionado]} dark={dark} onMarcarFeito={marcarFeito} onMarcarPendente={marcarPendente} sabores={sabores} />
      </div>
      <div style={{ height: 310, overflowY: 'auto', marginBottom: 20 }} ref={listaRef}>
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
      <div style={{ textAlign: 'center', marginBottom: 5 }}>
        <button
          onClick={() => navigate('/pedido')}
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
    </div>
  );
}

function TelaAdmin({ dark, setDark }) {
  const [sabores, setSabores] = useState([]);
  const [novoSabor, setNovoSabor] = useState('');
  const [loading, setLoading] = useState(false);

  function buscarSabores() {
    fetch(`${BASE_URL}/api/sabores`)
      .then(r => r.json())
      .then(data => setSabores(data));
  }

  useEffect(() => {
    buscarSabores();
  }, []);

  function adicionarSabor(e) {
    e.preventDefault();
    if (!novoSabor.trim()) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/sabores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoSabor.trim() })
    })
      .then(() => {
        setNovoSabor('');
        buscarSabores();
      })
      .finally(() => setLoading(false));
  }

  function atualizarSabor(id, campo, valor) {
    setLoading(true);
    fetch(`${BASE_URL}/api/sabores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: valor })
    })
      .then(() => buscarSabores())
      .finally(() => setLoading(false));
  }

  return (
    <div style={{ width: 380, margin: '0 auto', fontFamily: 'sans-serif', background: dark ? '#232323' : '#fff', borderRadius: 16, boxShadow: dark ? '0 2px 16px #0008' : '0 2px 16px #0001', padding: 10, height: 709 }}>
      <h1 style={{ fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Administração de Sabores</h1>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      <form onSubmit={adicionarSabor} style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
        <input
          type="text"
          value={novoSabor}
          onChange={e => setNovoSabor(e.target.value)}
          placeholder="Novo sabor"
          style={{ fontSize: 18, padding: 8, borderRadius: 8, border: '1px solid #ccc', flex: 1, background: dark ? '#181818' : '#fff', color: dark ? '#fff' : '#222' }}
          disabled={loading}
        />
        <button type="submit" style={{ fontSize: 18, padding: '8px 18px', borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', fontWeight: 'bold' }} disabled={loading}>
          Adicionar
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', color: dark ? '#fff' : '#222' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Sabor</th>
            <th style={{ textAlign: 'center', padding: 8 }}>Fazendo</th>
            <th style={{ textAlign: 'center', padding: 8 }}>Qtd</th>
          </tr>
        </thead>
        <tbody>
          {sabores.map(sabor => (
            <tr key={sabor.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{sabor.nome}</td>
              <td style={{ textAlign: 'center', padding: 8 }}>
                <input
                  type="checkbox"
                  checked={!!sabor.fazendo}
                  onChange={e => atualizarSabor(sabor.id, 'fazendo', e.target.checked ? 1 : 0)}
                  disabled={loading}
                  style={{ width: 22, height: 22, filter: dark ? 'invert(1)' : 'none' }}
                />
              </td>
              <td style={{ textAlign: 'center', padding: 8 }}>
                <input
                  type="number"
                  value={sabor.qnt}
                  min={0}
                  onChange={e => atualizarSabor(sabor.id, 'qnt', Number(e.target.value))}
                  disabled={loading}
                  style={{ width: 60, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', textAlign: 'center', background: dark ? '#181818' : '#fff', color: dark ? '#fff' : '#222' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useDarkMode();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaPedido dark={dark} setDark={setDark} />} />
        <Route path="/pedido" element={<TelaPedido dark={dark} setDark={setDark} />} />
        <Route path="/pedidos" element={<TelaPedidos dark={dark} setDark={setDark} />} />
        <Route path="/admin" element={<TelaAdmin dark={dark} setDark={setDark} />} />
      </Routes>
    </Router>
  );
}
