import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

export const Colors = {
  dark: {
    bg: "#0A0A0A",
    card: "#141414",
    border: "#2a2a2a",
    text: "#FFFFFF",
    subtext: "#555555",
    element: "#1f1f1f",
    primary: "#f97316",
    tagBg: "#1f1f1f",
    tagText: "#f97316",
    code: "#0f0f0f",
  },
  light: {
    bg: "#F2F2F2",
    card: "#FFFFFF",
    border: "#E0E0E0",
    text: "#000000",
    subtext: "#888888",
    element: "#EEEEEE",
    primary: "#f97316",
    tagBg: "#FFE8D6",
    tagText: "#f97316",
    code: "#F8F8F8",
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof Colors.dark;
  setTheme: (t: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  colors: Colors.dark,
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((val) => {
      if (val === "light" || val === "dark") setThemeState(val);
    });
  }, []);

  async function setTheme(val: Theme) {
    setThemeState(val);
    await AsyncStorage.setItem("theme", val);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: Colors[theme as keyof typeof Colors],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
