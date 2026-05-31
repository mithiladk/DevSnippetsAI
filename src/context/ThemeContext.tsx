import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

export const darkColors = {
  bg:      '#0A0A0A',
  card:    '#141414',
  border:  '#2a2a2a',
  text:    '#FFFFFF',
  subtext: '#555555',
  element: '#1f1f1f',
  primary: '#f97316',
};

export const lightColors = {
  bg:      '#F0F0F0',
  card:    '#FFFFFF',
  border:  '#E0E0E0',
  text:    '#000000',
  subtext: '#888888',
  element: '#EEEEEE',
  primary: '#f97316',
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof darkColors;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme:    'dark',
  colors:   darkColors,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((val) => {
      if (val === 'light' || val === 'dark') setThemeState(val);
    });
  }, []);

  async function setTheme(val: Theme) {
    setThemeState(val);
    await AsyncStorage.setItem('theme', val);
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      colors: theme === 'dark' ? darkColors : lightColors,
      setTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}