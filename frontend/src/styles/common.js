// Estilos comuns reutilizáveis
export const getContainerStyle = (dark) => ({
  width: 380,
  margin: '0 auto',
  fontFamily: 'sans-serif',
  background: dark ? '#232323' : '#fff',
  borderRadius: 16,
  boxShadow: dark ? '0 2px 16px #0008' : '0 2px 16px #0001',
  padding: 10,
  height: 709
});

export const getInputStyle = (dark, width = 'auto') => ({
  fontSize: 18,
  padding: 8,
  borderRadius: 8,
  border: '1px solid #ccc',
  background: dark ? '#181818' : '#fff',
  color: dark ? '#fff' : '#222',
  width,
  MozAppearance: 'textfield',
  WebkitAppearance: 'none',
  appearance: 'none',
  textAlign: 'center'
});

export const getButtonStyle = (type, dark) => {
  const baseStyle = {
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 18,
    padding: '10px 24px'
  };

  switch (type) {
    case 'primary':
      return {
        ...baseStyle,
        background: '#43a047',
        color: '#fff'
      };
    case 'secondary':
      return {
        ...baseStyle,
        background: '#1976d2',
        color: '#fff'
      };
    case 'warning':
      return {
        ...baseStyle,
        background: '#ffb300',
        color: '#222'
      };
    case 'danger':
      return {
        ...baseStyle,
        background: '#ff5252',
        color: '#fff',
        filter: dark ? 'brightness(0.8)' : 'none'
      };
    case 'success':
      return {
        ...baseStyle,
        background: '#43a047',
        color: '#fff'
      };
    default:
      return baseStyle;
  }
};

export const titleStyle = {
  fontSize: 35,
  textAlign: 'center',
  marginBottom: 24,
  lineHeight: 1.1
};

export const totalBoxStyle = (dark) => ({
  width: 330,
  margin: '16px auto',
  fontSize: 22,
  textAlign: 'center',
  padding: '5px 0 10px 0',
  border: '1px solid #eee',
  borderRadius: 10,
  background: dark ? '#181818' : '#fafafa',
  color: dark ? '#fff' : '#222'
});

export const totalValueStyle = (dark) => ({
  margin: '10px auto 0 auto',
  display: 'inline-block',
  background: dark ? '#333' : '#ffe082',
  color: dark ? '#fff' : '#222',
  padding: '4px 12px',
  borderRadius: 12,
  fontWeight: 'bold',
  fontSize: 28,
  boxShadow: dark ? '0 2px 8px #0004' : '0 2px 8px #0001',
  minWidth: 120
});

export const getNomeClienteStyle = (dark) => ({
  width: 300,
  fontSize: 18,
  padding: 12,
  borderRadius: 8,
  border: dark ? '1px solid #444' : '1px solid #ccc',
  background: dark ? '#181818' : '#fff',
  color: dark ? '#fff' : '#222',
  textAlign: 'center',
  outline: 'none',
});