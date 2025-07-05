// packages/webapp/src/components/ThemeToggle.tsx

import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 15px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        background: theme === 'light' ? '#f0f0f0' : '#333',
        color: theme === 'light' ? '#333' : '#f0f0f0',
        borderRadius: '5px',
        transition: 'all 0.3s ease',
        marginRight: '20px'
      }}
    >
      {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
    </button>
  );
};
