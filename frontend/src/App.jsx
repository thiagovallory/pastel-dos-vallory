import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useDarkMode from './hooks/useDarkMode';
import TelaPedir from './pages/TelaPedir';
import TelaPedidos from './pages/TelaPedidos';
import TelaAdmin from './pages/TelaAdmin';
import TelaTV from './pages/TelaTV';
import './App.css'

export default function App() {
  const [dark, setDark] = useDarkMode();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaPedir dark={dark} setDark={setDark} />} />
        <Route path="/pedir" element={<TelaPedir dark={dark} setDark={setDark} />} />
        <Route path="/pedidos" element={<TelaPedidos dark={dark} setDark={setDark} />} />
        <Route path="/admin" element={<TelaAdmin dark={dark} setDark={setDark} />} />
        <Route path="/tv" element={<TelaTV />} />
      </Routes>
    </Router>
  );
}
