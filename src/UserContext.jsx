import React, { createContext, useState, useEffect } from "react";
export const AppContext = createContext();

export function AppProvider({ children }) {
  // Initialize state directly from storage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isRedMode, setIsRedMode] = useState(localStorage.getItem("theme") === "red");

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

  return (
    <AppContext.Provider value={{ isLoggedIn, user, setUser, login, logout, isRedMode, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}