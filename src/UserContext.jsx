import React, { createContext, useState, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // Added axios for the heartbeat
const API_URL = import.meta.env.VITE_API_URL;
export const AppContext = createContext();

export function AppProvider({ children }) {
  const queryClient = useQueryClient();

  // --- AUTH STATE ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // --- VISUAL THEME STATE ---
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("site-theme") || "default");

  // --- SECURITY MODE STATE ---
  const [isRedMode, setIsRedMode] = useState(localStorage.getItem("red-mode") === "true");
  const [familyMode, setFamilyMode] = useState(localStorage.getItem("family-mode") === "true");

  // --- 1. THE HEARTBEAT (Real-time Sync) ---
  useEffect(() => {
    let interval;

    const syncIdentity = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isLoggedIn) return;

      try {
        const res = await axios.get(`${API_URL}/api/users/getMe`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update both state and localStorage with fresh notification/user data
        const updatedUser = res.data.user || res.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Heartbeat sync failed:", err);
        // If the token is invalid/expired, log them out
        if (err.response?.status === 401) logout();
      }
    };

    if (isLoggedIn) {
      syncIdentity(); // Initial run
      interval = setInterval(syncIdentity, 30000); // Sync every 30 seconds
    }

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // --- 2. THEME INITIALIZATION ---
  useEffect(() => {
    document.documentElement.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // --- 3. TAB SYNCING ---
  useEffect(() => {
    const syncStates = (e) => {
      if (e.key === "token") setIsLoggedIn(!!e.newValue);
      if (e.key === "user") setUser(JSON.parse(e.newValue));
      if (e.key === "site-theme") setCurrentTheme(e.newValue || "default");
      if (e.key === "red-mode") setIsRedMode(e.newValue === "true");
      if (e.key === "family-mode") setFamilyMode(e.newValue === "true");
    };
    window.addEventListener("storage", syncStates);
    return () => window.removeEventListener("storage", syncStates);
  }, []);

  // --- ACTIONS ---
  const updateTheme = (id) => {
    setCurrentTheme(id);
    localStorage.setItem("site-theme", id);
  };

  const toggleRedMode = () => {
    const newStatus = !isRedMode;
    setIsRedMode(newStatus);
    localStorage.setItem("red-mode", String(newStatus));
    if (newStatus) setFamilyMode(false);
    refreshData();
  };

  const toggleFamilyMode = () => {
    const newStatus = !familyMode;
    setFamilyMode(newStatus);
    localStorage.setItem("family-mode", String(newStatus));
    if (newStatus) setIsRedMode(false);
    refreshData();
  };

  const refreshData = () => {
    try {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const k = query.queryKey;
          return Array.isArray(k) && k.some(part => 
            ['manga', 'catalog', 'home'].includes(String(part).toLowerCase())
          );
        }
      });
    } catch (e) {
      console.warn('Refresh failed', e);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider value={{ 
      isLoggedIn, user, setUser, login, logout, 
      currentTheme, setTheme: updateTheme, 
      isRedMode, toggleRedMode, 
      familyMode, toggleFamilyMode 
    }}>
      {children}
    </AppContext.Provider>
  );
}