
import React, { useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const MessageList: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar p-4 bg-terminal-background font-mono">
      {messages.map((message) => {
        
        return (
          <div key={message.id} className="mb-2">
            <div className="flex items-baseline">
              <a 
                href={`https://solscan.io/address/${message.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-terminal-success hover:underline"
              >
                {message.walletAddress.slice(0, 6)}...{message.walletAddress.slice(-4)}
              </a>
              <span className="ml-2 text-white/90">{message.content}</span>
            </div>
            <div className="text-xs text-white/50 ml-0 mt-0.5">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
