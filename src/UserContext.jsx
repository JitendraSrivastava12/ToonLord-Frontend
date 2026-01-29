import React, { createContext, useState, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
export const AppContext = createContext();

export function AppProvider({ children }) {
  // Initialize state directly from storage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isRedMode, setIsRedMode] = useState(localStorage.getItem("theme") === "red");

  const queryClient = useQueryClient();

  // Sync across tabs
  useEffect(() => {
    const syncAuth = (e) => {
      if (e.key === "token") {
        setIsLoggedIn(!!e.newValue);
      }
      if (e.key === "theme") {
        setIsRedMode(e.newValue === "red");
      }
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true); // THIS UPDATES THE UI INSTANTLY
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false); // THIS UPDATES THE UI INSTANTLY
  };

  const toggleTheme = () => {
    const newMode = !isRedMode;
    localStorage.setItem("theme", newMode ? "red" : "family");
    setIsRedMode(newMode);
  };

  // Keeps only the color change (no data refetch)
  const toggleThemeAndRefetch = () => {
    const newMode = !isRedMode;
    localStorage.setItem("theme", newMode ? "red" : "family");
    setIsRedMode(newMode);
    // Invalidate relevant queries so lists can refetch
    try {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const k = query.queryKey;
          if (!Array.isArray(k) || k.length === 0) return false;
          const first = String(k[0]).toLowerCase();
          return first.includes('manga') || first.includes('catalog') || first.includes('home');
        }
      });
    } catch (e) {
      console.warn('QueryClient not available to invalidate on theme toggle');
    }
  };

  return (
    <AppContext.Provider value={{ isLoggedIn, user, setUser, login, logout, isRedMode, toggleTheme, toggleThemeAndRefetch }}>
      {children}
    </AppContext.Provider>
  );
}