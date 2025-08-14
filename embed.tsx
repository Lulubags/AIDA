import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChatInterface } from '@/components/chat-interface';

export default function EmbedPage() {
  const [, setLocation] = useLocation();
  const [embedConfig, setEmbedConfig] = useState({
    grade: 7,
    subject: 'mathematics',
    theme: 'light',
    embedded: true
  });

  useEffect(() => {
    // Parse URL parameters for embed configuration
    const urlParams = new URLSearchParams(window.location.search);
    const grade = parseInt(urlParams.get('grade') || '7');
    const subject = urlParams.get('subject') || 'mathematics';
    const theme = urlParams.get('theme') || 'light';
    
    setEmbedConfig({ grade, subject, theme, embedded: true });

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Remove default margins for iframe embedding
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Send message to parent window about widget load
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'aida_widget_loaded',
        widgetId: 'embedded',
        config: embedConfig
      }, '*');
    }

    // Handle resize observer for responsive height
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'aida_resize',
            widgetId: 'embedded',
            height: Math.max(height + 20, 400) // Add some padding and minimum height
          }, '*');
        }
      }
    });

    const contentElement = document.getElementById('embed-content');
    if (contentElement) {
      resizeObserver.observe(contentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle subscription requirement
  const handleSubscriptionNeeded = () => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'aida_subscription_needed',
        widgetId: 'embedded'
      }, '*');
    }
  };

  // Simulate subscription check after some usage
  useEffect(() => {
    const timer = setTimeout(() => {
      // For demo - in real app, check actual subscription status
      const hasSubscription = localStorage.getItem('aida_subscription_active');
      if (!hasSubscription) {
        handleSubscriptionNeeded();
      }
    }, 60000); // Show subscription prompt after 1 minute

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="embed-content" className="min-h-screen bg-background">
      {/* Embedded version uses the home page content */}
      <div className="container mx-auto p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Aida AI Tutor</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Grade {embedConfig.grade} • {embedConfig.subject}
          </p>
        </div>
        {/* This would include your main chat functionality */}
      </div>
      
      {/* Subtle Aida branding for embedded version */}
      <div className="fixed bottom-2 right-2 z-50">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <span>Powered by Aida AI</span>
        </div>
      </div>
    </div>
  );
}