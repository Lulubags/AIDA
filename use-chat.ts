import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ChatMessage, Session, Grade, Subject } from '@/lib/types';

interface UseChatOptions {
  sessionId?: string;
  grade: Grade;
  subject: Subject;
}

export function useChat({ sessionId, grade, subject }: UseChatOptions) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const lastTopicRef = useRef<string>('');

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async ({ grade, subject }: { grade: Grade; subject: Subject }) => {
      const response = await apiRequest('POST', '/api/sessions', { grade, subject });
      return response.json();
    },
    onSuccess: (session: Session) => {
      setCurrentSessionId(session.sessionId);
      queryClient.setQueryData(['session', session.sessionId], session);
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
      const response = await apiRequest('PATCH', `/api/sessions/${sessionId}`, updates);
      return response.json();
    },
    onSuccess: (session: Session) => {
      queryClient.setQueryData(['session', session.sessionId], session);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId, grade, subject, mediaType, mediaUrl, mediaThumbnail }: { 
      message: string; 
      sessionId: string; 
      grade: Grade; 
      subject: Subject;
      mediaType?: string | null;
      mediaUrl?: string | null;
      mediaThumbnail?: string | null;
    }) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        sessionId,
        grade,
        subject,
        mediaType,
        mediaUrl,
        mediaThumbnail,
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', currentSessionId] });
      queryClient.invalidateQueries({ queryKey: ['session', currentSessionId] });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  // Quick action mutation
  const quickActionMutation = useMutation({
    mutationFn: async ({ 
      type, 
      sessionId, 
      lastTopic, 
      grade, 
      subject 
    }: { 
      type: 'example' | 'simpler' | 'test'; 
      sessionId: string; 
      lastTopic: string; 
      grade: Grade; 
      subject: Subject; 
    }) => {
      const response = await apiRequest('POST', '/api/quick-action', {
        type,
        sessionId,
        lastTopic,
        grade,
        subject,
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', currentSessionId] });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  // Fetch session data
  const { data: session } = useQuery({
    queryKey: ['session', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!currentSessionId,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      const response = await fetch(`/api/sessions/${currentSessionId}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));
    },
    enabled: !!currentSessionId,
  });

  // Initialize session on first load
  useEffect(() => {
    if (!currentSessionId && !createSessionMutation.isPending) {
      createSessionMutation.mutate({ grade, subject });
    }
  }, [currentSessionId, grade, subject, createSessionMutation]);

  const sendMessage = useCallback((message: string, mediaData?: { type: string; url: string; thumbnail?: string }) => {
    if (!currentSessionId || (!message.trim() && !mediaData)) return;
    
    lastTopicRef.current = message.trim() || 'media content';
    
    sendMessageMutation.mutate({
      message: message.trim() || '',
      sessionId: currentSessionId,
      grade,
      subject,
      mediaType: mediaData?.type || null,
      mediaUrl: mediaData?.url || null,
      mediaThumbnail: mediaData?.thumbnail || null,
    });
  }, [currentSessionId, grade, subject, sendMessageMutation]);

  const executeQuickAction = useCallback((type: 'example' | 'simpler' | 'test') => {
    if (!currentSessionId || !lastTopicRef.current) return;
    
    quickActionMutation.mutate({
      type,
      sessionId: currentSessionId,
      lastTopic: lastTopicRef.current,
      grade,
      subject,
    });
  }, [currentSessionId, grade, subject, quickActionMutation]);

  const updateSession = useCallback((updates: { currentGrade?: Grade; currentSubject?: Subject }) => {
    if (!currentSessionId) return;
    
    updateSessionMutation.mutate({
      sessionId: currentSessionId,
      updates,
    });
  }, [currentSessionId, updateSessionMutation]);

  return {
    session,
    messages,
    isTyping: isTyping || sendMessageMutation.isPending || quickActionMutation.isPending,
    sendMessage,
    executeQuickAction,
    updateSession,
    isLoading: createSessionMutation.isPending || !currentSessionId,
    error: sendMessageMutation.error || quickActionMutation.error || createSessionMutation.error,
  };
}
