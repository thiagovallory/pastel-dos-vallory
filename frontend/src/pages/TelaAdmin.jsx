import React, { useState, useEffect } from 'react';
import ToggleDarkMode from '../components/ToggleDarkMode';
import useSabores from '../hooks/useSabores';
import { saboresAPI } from '../utils/api';
import { getContainerStyle, getInputStyle } from '../styles/common';

function TelaAdmin({ dark, setDark }) {
  const [sabores, setSabores] = useState([]);
  const [novoSabor, setNovoSabor] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [editandoValores, setEditandoValores] = useState({});

  const { sabores: saboresFromHook, recarregarSabores } = useSabores();

  // Usar sabores do hook, mas manter estado local para edição
  useEffect(() => {
    setSabores(saboresFromHook);
  }, [saboresFromHook]);

  async function adicionarSabor(e) {
    e.preventDefault();
    if (!novoSabor.trim()) return;
    setLoading(true);
    try {
      await saboresAPI.criar(novoSabor, novoValor);
      setNovoSabor('');
      setNovoValor('');
      recarregarSabores();
    } catch (error) {
      console.error('Erro ao adicionar sabor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarSabor(id, campo, valor) {
    setLoading(true);
    try {
      await saboresAPI.atualizar(id, campo, valor);
      recarregarSabores();
    } catch (error) {
      console.error('Erro ao atualizar sabor:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={getContainerStyle(dark)}>
      <h1 style={{ fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Administração de Sabores</h1>
      <ToggleDarkMode dark={dark} setDark={setDark} />
      <form onSubmit={adicionarSabor} style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
        <input
          type="text"
          value={novoSabor}
          onChange={e => setNovoSabor(e.target.value)}
          placeholder="Novo sabor"
          style={{ ...getInputStyle(dark, 150), flex: 1 }}
          disabled={loading}
        />
        <input
          type="text"
          value={novoValor}
          onChange={e => {
            // Permite apenas números, vírgula e ponto
            let v = e.target.value.replace(/[^0-9.,]/g, '');
            // Se houver mais de uma vírgula ou ponto, mantém só o primeiro
            v = v.replace(/([.,])(.*)[.,]/, '$1$2');
            setNovoValor(v);
          }}
          placeholder="R$"
          inputMode="decimal"
          style={getInputStyle(dark, 50)}
          disabled={loading}
        />
        <button 
          type="submit" 
          style={{ 
            fontSize: 18, 
            padding: '8px 18px', 
            borderRadius: 8, 
            background: '#43a047', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 'bold' 
          }} 
          disabled={loading}
        >
          Adicionar
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', color: dark ? '#fff' : '#222' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Sabor</th>
            <th style={{ textAlign: 'center', padding: 8 }}>Fazendo</th>
            <th style={{ textAlign: 'center', padding: 8 }}>Qtd</th>
            <th style={{ textAlign: 'center', padding: 8 }}>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {sabores.map(sabor => (
            <tr key={sabor.id} style={{ borderBottom: '1px solid #eee' }}>
              {/* Sabor */}
              <td style={{ textAlign: 'left',padding: 8 }}>{sabor.nome}</td>
              {/* Fazendo */}
              <td style={{ textAlign: 'center', padding: 8 }}>
                <input
                  type="checkbox"
                  checked={!!sabor.fazendo}
                  onChange={e => atualizarSabor(sabor.id, 'fazendo', e.target.checked ? 1 : 0)}
                  disabled={loading}
                  style={{ width: 22, height: 22, filter: dark ? 'invert(1)' : 'none' }}
                />
              </td>
              {/* Qtd */}
              <td style={{ textAlign: 'center', padding: 8 }}>
                <input
                  type="text"
                  value={editandoValores[`qnt_${sabor.id}`] !== undefined ? editandoValores[`qnt_${sabor.id}`] : (sabor.qnt || 0)}
                  onChange={e => {
                    // Permite apenas números - atualiza apenas localmente
                    const v = e.target.value.replace(/\D/g, '');
                    setEditandoValores(prev => ({ ...prev, [`qnt_${sabor.id}`]: v }));
                  }}
                  onBlur={e => {
                    // Garante que o valor seja atualizado quando sair do campo
                    const v = e.target.value.replace(/\D/g, '');
                    atualizarSabor(sabor.id, 'qnt', v ? Number(v) : 0);
                    // Remove do estado de edição
                    setEditandoValores(prev => {
                      const novo = { ...prev };
                      delete novo[`qnt_${sabor.id}`];
                      return novo;
                    });
                  }}
                  disabled={loading}
                  inputMode="numeric"
                  style={getInputStyle(dark, 60)}
                />
              </td>
              {/* Valor */}
              <td style={{ textAlign: 'center', padding: 8 }}>
                <input
                  type="text"
                  value={editandoValores[`valor_${sabor.id}`] !== undefined ? editandoValores[`valor_${sabor.id}`] : (sabor.valor !== undefined && sabor.valor !== null ? String(sabor.valor) : '')}
                  onChange={e => {
                    // Permite apenas números, vírgula e ponto - atualiza apenas localmente
                    let v = e.target.value.replace(/[^0-9.,]/g, '');
                    v = v.replace(/([.,])(.*)[.,]/, '$1$2');
                    setEditandoValores(prev => ({ ...prev, [`valor_${sabor.id}`]: v }));
                  }}
                  onBlur={e => {
                    // Garante que o valor seja atualizado quando sair do campo
                    let v = e.target.value.replace(/[^0-9.,]/g, '');
                    v = v.replace(/([.,])(.*)[.,]/, '$1$2');
                    atualizarSabor(sabor.id, 'valor', v ? parseFloat(v.replace(',', '.')) : 0);
                    // Remove do estado de edição
                    setEditandoValores(prev => {
                      const novo = { ...prev };
                      delete novo[`valor_${sabor.id}`];
                      return novo;
                    });
                  }}
                  disabled={loading}
                  inputMode="decimal"
                  style={getInputStyle(dark, 80)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TelaAdmin; 