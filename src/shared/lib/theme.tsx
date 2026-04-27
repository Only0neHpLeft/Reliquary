import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light" | "cinnabar" | "jade" | "obsidian" | "amber" | "lotus";

const ALL_THEMES: readonly Theme[] = ["dark", "light", "cinnabar", "jade", "obsidian", "amber", "lotus"];
const DARK_VARIANTS: ReadonlySet<string> = new Set(["cinnabar", "jade", "obsidian", "amber", "lotus"]);

interface ThemeContextValue {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function isValidTheme(value: string): value is Theme {
  return ALL_THEMES.includes(value as Theme);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("reliquary-theme");
  if (stored && isValidTheme(stored)) return stored;
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    for (const t of ALL_THEMES) root.classList.remove(t);
    root.classList.add(theme);
    if (DARK_VARIANTS.has(theme)) root.classList.add("dark");
    localStorage.setItem("reliquary-theme", theme);
  }, [theme]);

  const setThemeValue = useCallback((t: Theme) => setTheme(t), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext value={{ theme, setTheme: setThemeValue, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
