import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Save, RotateCcw } from "lucide-react";

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [botAvatar, setBotAvatar] = useState("robot");
  const [fontSize, setFontSize] = useState([16]);
  const [borderRadius, setBorderRadius] = useState([8]);
  const [chatStyle, setChatStyle] = useState("bubbles");

  const avatarOptions = [
    { value: "robot", label: "🤖 Robot", icon: "fa-robot" },
    { value: "teacher", label: "👩‍🏫 Teacher", icon: "fa-chalkboard-teacher" },
    { value: "graduation", label: "🎓 Graduate", icon: "fa-graduation-cap" },
    { value: "book", label: "📚 Book", icon: "fa-book" },
    { value: "owl", label: "🦉 Owl", icon: "fa-kiwi-bird" },
  ];

  const colorPresets = [
    { name: "Ocean Blue", primary: "#0ea5e9", secondary: "#06b6d4", accent: "#8b5cf6" },
    { name: "Forest Green", primary: "#059669", secondary: "#10b981", accent: "#f59e0b" },
    { name: "Sunset Orange", primary: "#ea580c", secondary: "#dc2626", accent: "#ca8a04" },
    { name: "Purple Magic", primary: "#7c3aed", secondary: "#a855f7", accent: "#ec4899" },
    { name: "South African", primary: "#16a34a", secondary: "#eab308", accent: "#dc2626" },
  ];

  const applyTheme = () => {
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

    root.style.setProperty('--primary', `hsl(${hexToHsl(primaryColor)})`);
    root.style.setProperty('--secondary', `hsl(${hexToHsl(secondaryColor)})`);
    root.style.setProperty('--accent', `hsl(${hexToHsl(accentColor)})`);
    root.style.setProperty('--radius', `${borderRadius[0]}px`);
    
    // Save to localStorage
    localStorage.setItem('tutor-bot-theme', JSON.stringify({
      primaryColor,
      secondaryColor,
      accentColor,
      botAvatar,
      fontSize: fontSize[0],
      borderRadius: borderRadius[0],
      chatStyle,
    }));

    // Apply font size
    root.style.fontSize = `${fontSize[0]}px`;
  };

  const resetTheme = () => {
    setPrimaryColor("#3B82F6");
    setSecondaryColor("#10B981");
    setAccentColor("#F59E0B");
    setBotAvatar("robot");
    setFontSize([16]);
    setBorderRadius([8]);
    setChatStyle("bubbles");
    
    localStorage.removeItem('tutor-bot-theme');
    
    const root = document.documentElement;
    root.style.setProperty('--primary', 'hsl(207, 90%, 54%)');
    root.style.setProperty('--secondary', 'hsl(160, 84%, 39%)');
    root.style.setProperty('--accent', 'hsl(45, 93%, 47%)');
    root.style.setProperty('--radius', '8px');
    root.style.fontSize = '16px';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Customize Your Tutor Bot</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Color Themes</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-auto p-3 flex items-center justify-between"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                    setAccentColor(preset.accent);
                  }}
                >
                  <span className="font-medium">{preset.name}</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-gray-600">{primaryColor}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-gray-600">{secondaryColor}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-gray-600">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Bot Avatar */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Bot Avatar Style</Label>
            <Select value={botAvatar} onValueChange={setBotAvatar}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {avatarOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${option.icon} text-sm`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Font Size: {fontSize[0]}px
            </Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={12}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Roundness: {borderRadius[0]}px
            </Label>
            <Slider
              value={borderRadius}
              onValueChange={setBorderRadius}
              min={0}
              max={20}
              step={2}
              className="w-full"
            />
          </div>

          {/* Chat Style */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Chat Style</Label>
            <Select value={chatStyle} onValueChange={setChatStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bubbles">💬 Chat Bubbles</SelectItem>
                <SelectItem value="minimal">📱 Minimal</SelectItem>
                <SelectItem value="classic">📄 Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetTheme} className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Default</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => { applyTheme(); onClose(); }} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Apply Theme</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}