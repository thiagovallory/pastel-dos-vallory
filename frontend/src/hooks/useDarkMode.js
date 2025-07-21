import { useState, useEffect } from 'react';

function useDarkMode() {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    document.body.style.background = dark ? '#181818' : '#f1f1f1';
    document.body.style.color = dark ? '#eee' : '#222';
  }, [dark]);
  
  return [dark, setDark];
}

export default useDarkMode; 