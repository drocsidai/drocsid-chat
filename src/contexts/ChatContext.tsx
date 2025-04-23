import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { createChatService, Message } from '../lib/chat-service';
import { Subscription } from 'rxjs';

// Define proper type for chat service
type ChatService = ReturnType<typeof createChatService>;

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { walletAddress, messageKeypairPrivateKey, authSignature, issuedAt, expiresAt } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use proper typing for chatServiceRef
  const chatServiceRef = useRef<ChatService | null>(null);
  // Track subscription for proper cleanup
  const subscriptionRef = useRef<Subscription | null>(null);
  
  const sendMessage = (content: string) => {
    if (!chatServiceRef.current || !walletAddress || !messageKeypairPrivateKey || 
        !authSignature || !issuedAt || !expiresAt) return;
        
    chatServiceRef.current.sendMessage(
      content, 
      walletAddress, 
      messageKeypairPrivateKey, 
      authSignature, 
      issuedAt, 
      expiresAt
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    chatServiceRef.current = createChatService();
    
    // Store subscription for proper cleanup
    const subscription = chatServiceRef.current.messages$.subscribe(setMessages);
    subscriptionRef.current = subscription;

    return () => {
      // Properly unsubscribe to prevent memory leaks
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (chatServiceRef.current) {
        chatServiceRef.current.unsubscribe();
      }
    };
  }, []);
  
  const value = {
    messages,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
