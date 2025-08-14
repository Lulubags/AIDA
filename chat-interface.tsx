import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Paperclip, Send } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { MediaUpload } from "@/components/media-upload";
import type { ChatMessage, Grade, Subject, Session } from "@/lib/types";
import { getQuickActionsForSubject, SUBJECTS } from "@/lib/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  currentGrade: Grade;
  currentSubject: Subject;
  session?: Session;
  onSendMessage: (message: string, mediaData?: { type: string; url: string; thumbnail?: string }) => void;
  onQuickAction: (type: 'example' | 'simpler' | 'test') => void;
}

export function ChatInterface({
  messages,
  isTyping,
  currentGrade,
  currentSubject,
  session,
  onSendMessage,
  onQuickAction,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [pendingMedia, setPendingMedia] = useState<{ type: string; url: string; thumbnail?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, getBotAvatarIcon } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!message.trim() && !pendingMedia) return;
    onSendMessage(message, pendingMedia || undefined);
    setMessage("");
    setPendingMedia(null);
  };

  const handleMediaUpload = (mediaData: { type: string; url: string; thumbnail?: string }) => {
    setPendingMedia(mediaData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (type: 'example' | 'simpler' | 'test') => {
    onQuickAction(type);
  };

  const currentSubjectName = SUBJECTS.find(s => s.id === currentSubject)?.name || currentSubject;
  const botAvatarIcon = getBotAvatarIcon();

  return (
    <div className="lg:col-span-3">
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary rounded-t-xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-xl font-semibold">Grade {currentGrade} {currentSubjectName} Tutor</h2>
              <p className="text-sm opacity-90">Ask me anything about your {currentSubjectName} lessons!</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-sm">Online</span>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className={`bg-light-gray dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-xs sm:max-w-md ${
                theme.chatStyle === 'minimal' ? 'border border-gray-200 dark:border-gray-700' :
                theme.chatStyle === 'classic' ? 'border-l-4 border-primary' : ''
              }`}>
                <p className="text-gray-800 dark:text-gray-200">
                  {currentSubject === 'afrikaans' ? (
                    `Hello! 😊 I'm Aida, your Grade ${currentGrade} Afrikaans tutor. I'll help you learn Afrikaans using English explanations first, then practice with Afrikaans examples. I'm here to guide you step by step - no pressure, just friendly learning! What would you like to work on today?`
                  ) : (
                    `Hello! I'm Aida, your Grade ${currentGrade} ${currentSubjectName} tutor. I'm here to help you discover and understand concepts step by step. I won't just give you answers - I'll guide you to find them yourself! What would you like to explore today?`
                  )}
                </p>
                <span className="text-xs text-neutral mt-2 block">Just now</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
              )}
              
              <div
                className={`rounded-2xl p-4 max-w-xs sm:max-w-md ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : `bg-light-gray dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm ${
                        theme.chatStyle === 'minimal' ? 'border border-gray-200 dark:border-gray-700' :
                        theme.chatStyle === 'classic' ? 'border-l-4 border-primary' : ''
                      }`
                }`}
              >
                {/* Display media content */}
                {(msg as any).mediaUrl && (
                  <div className="mb-3">
                    {(msg as any).mediaType === 'image' ? (
                      <img 
                        src={(msg as any).mediaUrl} 
                        alt="Uploaded content"
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    ) : (msg as any).mediaType === 'video' ? (
                      <video 
                        controls 
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                        style={{ maxHeight: '300px' }}
                        poster={(msg as any).mediaThumbnail}
                      >
                        <source src={(msg as any).mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                  </div>
                )}
                
                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                
                <span
                  className={`text-xs mt-2 block ${
                    msg.role === "user" ? "text-blue-200" : "text-neutral"
                  }`}
                >
                  {msg.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-white text-sm" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <i className={`fas ${botAvatarIcon} text-white text-sm`} />
              </div>
              <div className={`bg-light-gray dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 ${
                theme.chatStyle === 'minimal' ? 'border border-gray-200 dark:border-gray-700' :
                theme.chatStyle === 'classic' ? 'border-l-4 border-primary' : ''
              }`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-6 border-t border-gray-200">
          {/* Show pending media preview */}
          {pendingMedia && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {pendingMedia.type === 'image' ? (
                    <img 
                      src={pendingMedia.url} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <video 
                      className="w-12 h-12 object-cover rounded border"
                      poster={pendingMedia.thumbnail}
                    >
                      <source src={pendingMedia.url} />
                    </video>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pendingMedia.type === 'image' ? 'Image ready to send' : 'Video ready to send'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingMedia(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <i className="fas fa-times" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <div className="flex-1">
              <div className="relative flex">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask your question here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <MediaUpload 
                    onMediaUpload={handleMediaUpload}
                    disabled={isTyping}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !pendingMedia) || isTyping}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition-colors flex items-center space-x-2 font-medium"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {getQuickActionsForSubject(currentSubject).map((action: any) => (
              <Button
                key={action.type}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.type)}
                disabled={isTyping || messages.length === 0}
                className="bg-light-gray hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <i className={`fas fa-${action.icon} mr-1 ${
                  action.type === 'example' ? 'text-accent' : 
                  action.type === 'simpler' ? 'text-primary' : 
                  'text-secondary'
                }`} />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
