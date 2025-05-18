import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "pastesharecopy-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    console.log(`ThemeProvider: Theme set to "${theme}"`);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let newResolvedTheme: "dark" | "light" = "dark";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      newResolvedTheme = systemTheme;
      root.classList.add(systemTheme);
      console.log(`ThemeProvider: System theme detected as "${systemTheme}"`);
    } else {
      newResolvedTheme = theme as "dark" | "light";
      root.classList.add(theme);
    }

    setResolvedTheme(newResolvedTheme);
    console.log(`ThemeProvider: Resolved theme is "${newResolvedTheme}"`);

    document.documentElement.setAttribute("data-theme", newResolvedTheme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      const systemTheme = mediaQuery.matches ? "dark" : "light";

      console.log(`ThemeProvider: System theme changed to "${systemTheme}"`);
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
      document.documentElement.setAttribute("data-theme", systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      console.log(`ThemeProvider: Setting theme to "${theme}"`);
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
