import React from 'react';

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

export default ToggleDarkMode; 