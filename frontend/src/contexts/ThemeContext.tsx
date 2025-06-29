import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isSystem: boolean;
  setIsSystem: (isSystem: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isSystem, setIsSystemState] = useState(true);

  // Get system preference
  const getSystemTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedIsSystem = localStorage.getItem('isSystem') === 'true';

    setIsSystemState(savedIsSystem);

    if (savedIsSystem) {
      setThemeState(getSystemTheme());
    } else if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState(getSystemTheme());
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setThemeState(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystem]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsSystemState(false);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('isSystem', 'false');
  };

  const setIsSystem = (newIsSystem: boolean) => {
    setIsSystemState(newIsSystem);
    localStorage.setItem('isSystem', newIsSystem.toString());

    if (newIsSystem) {
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      localStorage.removeItem('theme');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isSystem,
      setIsSystem
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
