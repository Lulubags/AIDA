import { useState } from "react";
import { Settings, Palette, Upload, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { CurriculumUpload } from "@/components/curriculum-upload";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Link } from "wouter";
import type { Grade } from "@/lib/types";

interface AppHeaderProps {
  currentGrade: Grade;
}

export function AppHeader({ currentGrade }: AppHeaderProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Aida AI Tutor</h1>
                <p className="text-xs text-neutral">South African Curriculum Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-light-gray dark:bg-gray-800 rounded-lg px-3 py-2">
                <span className="text-white text-sm font-bold">A</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade {currentGrade}</span>
              </div>
              <Link href="/subscription">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-neutral hover:text-primary transition-colors rounded-lg hover:bg-light-gray dark:hover:bg-gray-800"
                onClick={() => setShowUpload(true)}
                title="Upload School Curriculum"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <DarkModeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-neutral hover:text-primary transition-colors rounded-lg hover:bg-light-gray dark:hover:bg-gray-800"
                onClick={() => setShowCustomizer(true)}
                title="Customize Theme"
              >
                <Palette className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-neutral hover:text-primary transition-colors rounded-lg hover:bg-light-gray dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <ThemeCustomizer 
        isOpen={showCustomizer} 
        onClose={() => setShowCustomizer(false)} 
      />
      
      <CurriculumUpload 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)} 
      />
    </>
  );
}
