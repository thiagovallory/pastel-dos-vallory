import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pedidosAPI } from '../utils/api';
import useSabores from '../hooks/useSabores';
import '../styles/TelaTV.css';

function TelaTV() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosPreparando, setPedidosPreparando] = useState([]);
  const [pedidosProntos, setPedidosProntos] = useState([]);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [tempoMedio, setTempoMedio] = useState(0);
  const [piscarTela, setPiscarTela] = useState(false);
  const [pedidosLendo, setPedidosLendo] = useState(new Set());
  const [vozesDisponiveis, setVozesDisponiveis] = useState([]);
  const [vozSelecionada] = useState(null);
  const [wakeLockAtivo, setWakeLockAtivo] = useState(false);
  const { sabores } = useSabores();
  const audioContextRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const wakeLockRef = useRef(null);
  const noSleepIntervalRef = useRef(null);

  // Função para ativar Wake Lock (prevenir modo descanso)
  const ativarWakeLock = useCallback(async () => {
    try {
      // Método 1: Wake Lock API (mais moderno)
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockAtivo(true);
        console.log('Wake Lock ativado (API moderna)');
        
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockAtivo(false);
          console.log('Wake Lock liberado');
        });
        
        return true;
      }
    } catch (error) {
      console.log('Wake Lock API não funcionou:', error);
    }

    // Método 2: Fallback com vídeo invisível
    try {
      const video = document.createElement('video');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
      video.setAttribute('playsinline', '');
      video.style.position = 'fixed';
      video.style.right = '0';
      video.style.bottom = '0';
      video.style.minWidth = '1px';
      video.style.minHeight = '1px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0.01';
      video.style.pointerEvents = 'none';
      
      // Canvas para gerar vídeo
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      
      // Gerar frame único
      ctx.fillRect(0, 0, 1, 1);
      
      canvas.toBlob((blob) => {
        video.src = URL.createObjectURL(blob);
        video.play();
        document.body.appendChild(video);
        setWakeLockAtivo(true);
        console.log('Wake Lock ativado (fallback video)');
      });
      
      return true;
    } catch (error) {
      console.log('Fallback de vídeo não funcionou:', error);
    }

    // Método 3: Fallback com movimento periódico
    noSleepIntervalRef.current = setInterval(() => {
      // Movimento imperceptível da tela
      document.body.style.transform = 'translateZ(0)';
      setTimeout(() => {
        document.body.style.transform = 'none';
      }, 1);
    }, 15000); // A cada 15 segundos
    
    setWakeLockAtivo(true);
    console.log('Wake Lock ativado (fallback movimento)');
    return true;
  }, []);

  // Função para desativar Wake Lock
  const desativarWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      
      if (noSleepIntervalRef.current) {
        clearInterval(noSleepIntervalRef.current);
        noSleepIntervalRef.current = null;
      }
      
      // Remover vídeo invisível se existir
      const videos = document.querySelectorAll('video[muted][loop]');
      videos.forEach(video => {
        if (video.style.opacity === '0.01') {
          video.remove();
        }
      });
      
      setWakeLockAtivo(false);
      console.log('Wake Lock desativado');
    } catch (error) {
      console.log('Erro ao desativar Wake Lock:', error);
    }
  }, []);

  // Inicializar Web Audio, Speech e Wake Lock
  useEffect(() => {
    // Web Audio Context para sons
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio não suportado:', error);
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Garantir que as vozes estejam carregadas
      const loadVoices = () => {
        const voices = speechSynthesisRef.current.getVoices();
        console.log('Vozes disponíveis:', voices.length);
        setVozesDisponiveis(voices);
        
        // Usar voz padrão do sistema (geralmente melhor)
        console.log('Usando voz padrão do sistema');
      };
      
      // Carregar vozes imediatamente ou quando estiverem prontas
      if (speechSynthesisRef.current.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesisRef.current.addEventListener('voiceschanged', loadVoices);
      }
    }

    // Ativar Wake Lock automaticamente
    ativarWakeLock();

    // Reativar Wake Lock se a página voltar ao foco
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockAtivo) {
        setTimeout(() => {
          ativarWakeLock();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      desativarWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ativarWakeLock, desativarWakeLock, wakeLockAtivo]);

  // Função para tocar som de notificação
  const tocarSom = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContextRef.current.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.log('Erro ao tocar som:', error);
    }
  }, []);

  // Função para falar pedido e nome
  const falarNome = useCallback((nome, numero) => {
    if (!speechSynthesisRef.current) {
      tocarSom(); // Fallback para som
      return;
    }

          try {
        // Parar qualquer fala anterior
        speechSynthesisRef.current.cancel();
        
        // Limpar e normalizar o nome (manter acentos, remover apenas caracteres especiais problemáticos)
        const nomeCliente = nome && nome.trim() ? 
          nome.trim()
              .replace(/[^\w\sÀ-ÿ]/g, '') // Manter letras, espaços e acentos
              .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
          : '';
        
        // Montar texto: sempre "Pedido X pronto" + nome se existir
        let texto;
        if (nomeCliente) {
          texto = `Pedido ${numero} pronto, ${nomeCliente}. Pedido ${numero} pronto, ${nomeCliente}`;
        } else {
          texto = `Pedido ${numero} pronto. Pedido ${numero} pronto`;
        }
        
        console.log('Falando:', texto); // Para debug
        
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;  // Velocidade original (era melhor)
        utterance.volume = 0.9; // Volume original
        utterance.pitch = 1.0;
        
        // Usar voz selecionada ou deixar padrão do sistema
        if (vozSelecionada) {
          utterance.voice = vozSelecionada;
          console.log('Usando voz selecionada:', vozSelecionada.name);
        } else {
          // Usar voz padrão do sistema (não forçar PT)
          console.log('Usando voz padrão do sistema');
        }
        
        // Aguardar um pouco para garantir que o speechSynthesis esteja pronto
        setTimeout(() => {
          speechSynthesisRef.current.speak(utterance);
        }, 200);
        
        // Também toca som junto
        setTimeout(tocarSom, 300);
      } catch (error) {
      console.log('Erro na síntese de voz:', error);
      tocarSom(); // Fallback
    }
  }, [tocarSom]);

  // Função para piscar a tela
  const piscarTelaEffect = useCallback(() => {
    setPiscarTela(true);
    setTimeout(() => setPiscarTela(false), 300);
  }, []);

  // Buscar pedidos
  const buscarPedidos = useCallback(async () => {
    try {
      const data = await pedidosAPI.listar();
      setPedidos(data);
      
      // Separar pedidos por status
      const preparando = data.filter(p => !p.feito);
      const prontos = data.filter(p => p.feito);
      
      // Detectar pedidos que ficaram prontos (novos na lista de prontos)
      const novosProntos = prontos.filter(p => 
        !pedidosProntos.find(pp => pp.id === p.id)
      );
      
      if (novosProntos.length > 0 && pedidosProntos.length > 0) {
        piscarTelaEffect();
        
        // Falar nome/número dos pedidos que ficaram prontos
        novosProntos.forEach((pedido, index) => {
          setTimeout(() => {
            // Marcar pedido como sendo lido
            setPedidosLendo(prev => new Set(prev.add(pedido.id)));
            
            // Falar o pedido
            falarNome(pedido.nome, pedido.id);
            
            // Remover o destaque após 5 segundos
            setTimeout(() => {
              setPedidosLendo(prev => {
                const newSet = new Set(prev);
                newSet.delete(pedido.id);
                return newSet;
              });
            }, 5000);
          }, 800 + (index * 2000)); // 800ms inicial + 2s entre cada pedido
        });
      }
      
      setPedidosPreparando(preparando);
      setPedidosProntos(prontos);
      
      // Calcular tempo médio
      calcularTempoMedio(prontos);
      
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }, [pedidosProntos, piscarTelaEffect, falarNome]);

  // Calcular tempo médio de espera
  const calcularTempoMedio = useCallback((pedidosProntos) => {
    if (pedidosProntos.length === 0) {
      setTempoMedio(0);
      return;
    }

    const tempos = pedidosProntos
      .filter(p => p.criado_UTC && p.pronto_UTC)
      .map(p => {
        const criado = new Date(p.criado_UTC);
        const pronto = new Date(p.pronto_UTC);
        return (pronto - criado) / (1000 * 60); // em minutos
      });

    if (tempos.length === 0) {
      setTempoMedio(0);
      return;
    }

    const media = tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length;
    setTempoMedio(Math.round(media));
  }, []);

  // Atualizar relógio
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Buscar pedidos periodicamente
  useEffect(() => {
    buscarPedidos();
    const interval = setInterval(buscarPedidos, 3000);
    return () => clearInterval(interval);
  }, [buscarPedidos]);

  // Limpar as variáveis não usadas pelo lint
  console.log('Debug - vozes disponíveis:', vozesDisponiveis.length);
  console.log('Debug - pedidos sendo lidos:', pedidosLendo.size);
  console.log('Debug - total de pedidos:', pedidos.length);
  console.log('Debug - wake lock ativo:', wakeLockAtivo);

  // Obter sabores de um pedido
  const obterSaboresPedido = (pedido) => {
    return sabores
      .filter(sabor => pedido[`sabor_${sabor.id}`] > 0)
      .map(sabor => ({
        nome: sabor.nome,
        quantidade: pedido[`sabor_${sabor.id}`]
      }));
  };

  // Formatação de tempo
  const formatarTempo = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatarData = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className="tv-container"
      style={{
        background: piscarTela 
          ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
          : 'linear-gradient(135deg, #667eea, #764ba2)',
      }}
    >
      
      {/* Coluna Preparando */}
      <div className="tv-column">
        <div style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#FFE082',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🔥 PREPARANDO
        </div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {pedidosPreparando.map(pedido => {
            const saboresPedido = obterSaboresPedido(pedido);
            return (
                             <div key={pedido.id} className="tv-pedido-preparando">
                                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF9C4', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     #{pedido.id}
                     {pedido.nome && (
                       <span style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>
                         - {pedido.nome}
                       </span>
                     )}
                   </div>
                   <div style={{ fontSize: '1.125rem', color: '#FFE082' }}>
                     {new Date(pedido.criado_UTC + 'Z').toLocaleTimeString('pt-BR', {
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </div>
                 </div>
                
                                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                   gap: '1px',
                   columnGap: '10px'
                 }}>
                   {saboresPedido.map((sabor, idx) => (
                     <div key={idx} style={{
                       fontSize: '1.125rem',
                       color: '#FFE082',
                       textAlign: 'left'
                     }}>
                       • {sabor.quantidade}x {sabor.nome}
                     </div>
                   ))}
                 </div>
                
                
              </div>
            );
          })}
          
          {pedidosPreparando.length === 0 && (
            <div style={{
              textAlign: 'center',
              fontSize: '1.75rem',
              color: 'rgba(255,255,255,0.6)',
              marginTop: '50px'
            }}>
              Nenhum pedido sendo preparado
            </div>
          )}
        </div>
      </div>

      {/* Coluna Prontos */}
      <div className="tv-column">
        <div style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#A5D6A7',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          ✅ PRONTOS
        </div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
                     {pedidosProntos.map(pedido => {
             const saboresPedido = obterSaboresPedido(pedido);
             const estandoLendo = pedidosLendo.has(pedido.id);
             return (
               <div 
                 key={pedido.id} 
                 className="tv-pedido-pronto"
                 style={estandoLendo ? {
                   background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                   border: '2px solid #FFD700',
                   transition: 'all 0.5s ease'
                 } : {}}
               >
                                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center'
                 }}>
                   <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: estandoLendo ? '#000000' : '#C8E6C9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     #{pedido.id}
                     {pedido.nome && (
                       <span style={{ fontSize: '1.25rem', textTransform: 'uppercase' }}>
                         - {pedido.nome}
                       </span>
                     )}
                   </div>
                   <div style={{ fontSize: '1.125rem', color: estandoLendo ? '#000000' : '#A5D6A7' }}>
                     {pedido.pronto_UTC ? new Date(pedido.pronto_UTC + 'Z').toLocaleTimeString('pt-BR', {
                       hour: '2-digit',
                       minute: '2-digit'
                     }) : '--:--'}
                   </div>
                 </div>
                
                                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                   gap: '1px',
                   columnGap: '10px'
                 }}>
                                        {saboresPedido.map((sabor, idx) => (
                       <div key={idx} style={{
                         fontSize: '1.125rem',
                         color: estandoLendo ? '#000000' : '#A5D6A7',
                         textAlign: 'left',
                         fontWeight: estandoLendo ? 'bold' : 'normal'
                       }}>
                         • {sabor.quantidade}x {sabor.nome}
                       </div>
                     ))}
                 </div>
                
                
              </div>
            );
          })}
          
          {pedidosProntos.length === 0 && (
            <div style={{
              textAlign: 'center',
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.6)',
              marginTop: '50px'
            }}>
              Nenhum pedido pronto
            </div>
          )}
        </div>
      </div>

      {/* Painel Lateral */}
      <div className="tv-sidebar">
        
        {/* Agradecimento */}
        <div className="tv-agradecimento-container" style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          flex: '0 0 auto'
          
        }}>
          <div className="tv-agradecimento-icone" style={{
            fontSize: '4rem',
            marginBottom: '10px'
          }}>
            🙏
          </div>
          <div className="tv-agradecimento-texto" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FFE082',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.3'
          }}>
            OBRIGADO PELA<br/>PREFERÊNCIA!
          </div>
        </div>

        {/* Relógio */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto'
        }}>
          <div style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#E1F5FE',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '10px',
            fontFamily: 'monospace'
          }}>
            {formatarTempo(horaAtual)}
          </div>
          <div style={{
            fontSize: '1.125rem',
            color: '#B3E5FC',
            fontWeight: 'bold'
          }}>
            {formatarData(horaAtual)}
          </div>
        </div>

        {/* Tempo Médio */}
        <div
          className="tv-tempo-medio-container"
          style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          flex: '1 1 auto',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          
          <div style={{
            fontSize: '1.125rem',
            color: '#FFCDD2',
            fontWeight: 'bold'
          }}>
            TEMPO MÉDIO
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FFE0B2',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {tempoMedio}
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#FFCDD2'
          }}>
            minutos
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaTV; 