
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

const ChatHeader: React.FC = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useAuth();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-terminal-background border-b border-gray-800">
      <div className="flex items-center">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-white font-mono font-bold">Drocsid Chat</h1>
      </div>
      
      <div>
        {walletAddress ? (
          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="font-mono text-sm border-terminal-accent/50 text-black hover:bg-terminal-accent/20"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </Button>
        ) : (
          <Button 
            onClick={connectWallet}
            className="font-mono text-sm bg-white/20 hover:bg-white/30 text-white"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {'Connect Wallet'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
