import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-9 h-9 p-0 rounded-full border border-border transition-colors 
                     hover:bg-muted/60 dark:hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Changer le thème"
        >
          {/* Soleil (visible en clair) */}
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-300 text-amber-500 dark:-rotate-90 dark:scale-0"
          />

          {/* Lune (visible en dark) */}
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-300 text-blue-400 dark:rotate-0 dark:scale-100"
          />

          <span className="sr-only">Basculer le thème</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Clair</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Sombre</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
