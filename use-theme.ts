import { useEffect, useState } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  botAvatar: string;
  fontSize: number;
  borderRadius: number;
  chatStyle: string;
  darkMode: boolean;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  botAvatar: 'robot',
  fontSize: 16,
  borderRadius: 8,
  chatStyle: 'bubbles',
  darkMode: false,
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tutor-bot-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setTheme({ ...defaultTheme, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved theme, using default');
      }
    }
    setIsLoaded(true);
  }, []);

  // Apply theme to CSS variables when theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
    };

    // Apply colors
    root.style.setProperty('--primary', `hsl(${hexToHsl(theme.primaryColor)})`);
    root.style.setProperty('--secondary', `hsl(${hexToHsl(theme.secondaryColor)})`);
    root.style.setProperty('--accent', `hsl(${hexToHsl(theme.accentColor)})`);
    root.style.setProperty('--radius', `${theme.borderRadius}px`);
    
    // Apply font size
    root.style.fontSize = `${theme.fontSize}px`;

    // Apply dark mode
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isLoaded]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    localStorage.setItem('tutor-bot-theme', JSON.stringify(newTheme));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('tutor-bot-theme');
  };

  const getBotAvatarIcon = () => {
    const avatarMap: Record<string, string> = {
      robot: 'fa-robot',
      teacher: 'fa-chalkboard-teacher',
      graduation: 'fa-graduation-cap',
      book: 'fa-book',
      owl: 'fa-kiwi-bird',
    };
    return avatarMap[theme.botAvatar] || 'fa-robot';
  };

  return {
    theme,
    updateTheme,
    resetTheme,
    getBotAvatarIcon,
    isLoaded,
  };
}