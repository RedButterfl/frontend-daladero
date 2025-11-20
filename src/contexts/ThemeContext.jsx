// ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Lecture SYNCHRONE au montage → évite le flash
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem('theme');
    if (saved) return saved;

    // Si pas sauvegardé, on suit la préférence système
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Appliquer le thème IMMÉDIATEMENT au montage (avant le paint)
  useEffect(() => {
    const root = document.documentElement;

    // Nettoyer les classes précédentes
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Sauvegarder aussi dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Synchroniser avec les données utilisateur quand elles arrivent
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const userTheme = user.theme; // ex: 'dark', 'light', ou null
    if (userTheme && userTheme !== theme) {
      setTheme(userTheme);
    }
  }, [user, authLoading, theme]);

  // Fonction pour changer manuellement le thème
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    // Optionnel : sauvegarder en backend plus tard
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};