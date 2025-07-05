// packages/webapp/src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definimos la forma de nuestro contexto
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Creamos el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Creamos el "Proveedor" del tema, que envolverá toda nuestra aplicación
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;

    // CORRECCIÓN: Quitamos la clase vieja y añadimos la nueva que Tailwind espera
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Creamos un "hook" personalizado para usar el contexto fácilmente en otros componentes
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};