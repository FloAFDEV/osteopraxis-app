
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Empêche les soucis de SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-9 h-9 p-0 rounded-full border border-border transition-colors 
                 hover:bg-accent dark:hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label="Changer le thème"
    >
      {/* Lune : visible en clair */}
      <Moon
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 text-amber-500 dark:-rotate-90 dark:scale-0"
      />

      {/* Soleil : visible en dark */}
      <Sun
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 text-violet-400 dark:text-blue-400 dark:rotate-0 dark:scale-100"
      />

      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
}
