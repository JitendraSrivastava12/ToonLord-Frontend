import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or default to light-1
  const [theme, setTheme] = useState(localStorage.getItem('toonlord-theme') || 'light-1');

  useEffect(() => {
    // Apply the theme attribute to the root element for CSS variables to work
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toonlord-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);