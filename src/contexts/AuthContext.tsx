import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { createMessageKeypair } from 'drocsid-message';
import { toast } from "sonner";

interface AuthContextType {
  walletAddress: string | null;
  messageKeypairAddress: string | null;
  messageKeypairPrivateKey: string | null;
  authSignature: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Inner Provider component, ensuring it's within the wallet context
function AuthProviderInner({ children }: { children: ReactNode }) {
  // Solana wallet state
  const { 
    connected, 
    disconnect, 
    publicKey,
    signMessage: walletSign
  } = useSolanaWallet();
  
  // Wallet modal
  const { setVisible } = useWalletModal();

  // State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [messageKeypairAddress, setMessageKeypairAddress] = useState<string | null>(null);
  const [messageKeypairPrivateKey, setMessageKeypairPrivateKey] = useState<string | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setWalletAddress(null);
    setMessageKeypairAddress(null);
    setMessageKeypairPrivateKey(null);
    setAuthSignature(null);
    setIssuedAt(null);
    setExpiresAt(null);
    toast.info("Wallet disconnected");
  }, [disconnect]);

  // Create signature
  const createSignature = useCallback(async () => {
    if (!walletSign || !publicKey) return;
    try {
      // Create message keypair
      const result = await createMessageKeypair(walletSign, publicKey.toBase58());
      if (!result.messageKeypairAddress || 
          !result.messageKeypairPrivateKey || 
          !result.authSignature || 
          !result.issuedAt || 
          !result.expiresAt) {
        toast.error("Signature failed");
        return;
      }
      
      // Update state
      setWalletAddress(publicKey.toBase58());
      setMessageKeypairAddress(result.messageKeypairAddress);
      setMessageKeypairPrivateKey(result.messageKeypairPrivateKey);
      setAuthSignature(result.authSignature);
      setIssuedAt(result.issuedAt);
      setExpiresAt(result.expiresAt);
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error("Signature failed");
    }
  }, [walletSign, publicKey]);

  // When wallet connection status changes
  useEffect(() => {
    if (connected && publicKey) {
      if (publicKey.toBase58() !== walletAddress) { 
        createSignature();
      }
    }
  }, [connected, publicKey, walletAddress, createSignature]);

  const value = {
    walletAddress,
    messageKeypairAddress,
    messageKeypairPrivateKey,
    authSignature,
    issuedAt,
    expiresAt,
    connectWallet,
    disconnectWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Outer Provider component, providing wallet connection environment
export function AuthProvider({ children }: { children: ReactNode }) {
  // Set up Solana network
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <AuthProviderInner>
            {children}
          </AuthProviderInner>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}