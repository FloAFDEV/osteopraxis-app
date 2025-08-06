
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize with a simple default value
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Handle initial theme loading after component mounts
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined") return;
    
    try {
      // Check for saved theme preference or use system preference
      const savedTheme = localStorage.getItem("vite-ui-theme") as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      } else {
        // Use system preference
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemTheme);
      }
    } catch (error) {
      console.warn("Could not access localStorage for theme preference", error);
      // Fallback to system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    }
    
    setMounted(true);
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem("vite-ui-theme", theme);
    } catch (error) {
      console.warn("Could not save theme preference to localStorage", error);
    }
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
