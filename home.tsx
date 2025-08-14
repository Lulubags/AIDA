import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { useChat } from "@/hooks/use-chat";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { Grade, Subject } from "@/lib/types";

export default function Home() {
  const [currentGrade, setCurrentGrade] = useState<Grade>(5);
  const [currentSubject, setCurrentSubject] = useState<Subject>("english");
  const { isLoaded } = useTheme();

  const {
    session,
    messages,
    isTyping,
    sendMessage,
    executeQuickAction,
    updateSession,
    isLoading,
    error,
  } = useChat({
    grade: currentGrade,
    subject: currentSubject,
  });

  const handleGradeChange = (grade: Grade) => {
    setCurrentGrade(grade);
    if (session) {
      updateSession({ currentGrade: grade });
    }
  };

  const handleSubjectChange = (subject: Subject) => {
    setCurrentSubject(subject);
    if (session) {
      updateSession({ currentSubject: subject });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Failed to load the tutor bot"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="font-inter bg-light-gray min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-graduation-cap text-white text-xl" />
          </div>
          <p className="text-gray-600">Loading theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-light-gray dark:bg-gray-900 min-h-screen transition-colors">
      <AppHeader currentGrade={currentGrade} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-graduation-cap text-white text-xl" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Setting up your learning session...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Sidebar
              currentGrade={currentGrade}
              currentSubject={currentSubject}
              session={session}
              onGradeChange={handleGradeChange}
              onSubjectChange={handleSubjectChange}
            />
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              currentGrade={currentGrade}
              currentSubject={currentSubject}
              session={session}
              onSendMessage={sendMessage}
              onQuickAction={executeQuickAction}
            />
          </div>
        )}
      </div>

      {/* Quick Access Floating Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="icon"
          className="bg-primary hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
