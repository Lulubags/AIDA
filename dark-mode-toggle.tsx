import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function DarkModeToggle() {
  const { theme, updateTheme } = useTheme();

  const toggleDarkMode = () => {
    updateTheme({ darkMode: !theme.darkMode });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleDarkMode}
      className="p-2 text-neutral hover:text-primary transition-colors rounded-lg hover:bg-light-gray dark:hover:bg-gray-800"
      title={theme.darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme.darkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}