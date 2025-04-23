
import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MessageInput: React.FC = () => {
  const [content, setContent] = useState('');
  const { sendMessage } = useChat();
  const { walletAddress } = useAuth();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (!walletAddress) {
      toast.error("Please connect your wallet to send messages");
      return;
    }
    
    sendMessage(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className="px-4 py-3 bg-terminal-background border-t border-gray-800">
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-800 text-white rounded px-3 py-2 pr-12 font-mono focus:outline-none focus:ring-1 focus:ring-white/30"
            disabled={!walletAddress}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button 
              type="submit" 
              size="icon"
              disabled={!walletAddress || !content.trim()}
              className="h-7 w-7 bg-white/20 hover:bg-white/30 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
