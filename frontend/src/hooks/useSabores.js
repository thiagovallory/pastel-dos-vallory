import { useState, useEffect, useCallback } from 'react';
import { saboresAPI } from '../utils/api';

function useSabores() {
  const [sabores, setSabores] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const recarregarSabores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await saboresAPI.listar();
      setSabores(data);
    } catch (error) {
      console.error('Erro ao carregar sabores:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    recarregarSabores();
  }, [recarregarSabores]);
  
  return { sabores, loading, recarregarSabores };
}

export default useSabores; 