import Gun from 'gun';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { signMessage, verifyMessage, SignatureFields } from 'drocsid-message'

// Use environment variable for Gun peer if available
const GUN_PEER = 'https://gun-manhattan.herokuapp.com/gun';
const MAX_MESSAGES = 50; // Maximum number of messages to keep
const CHANNEL_ID = 'drocsid-chat';

export interface Message extends SignatureFields {
  id: string;
  content: string;
}

/**
 * Sort messages by createdAt timestamp
 */
function sortMessagesByTimestamp(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Limit the number of messages to keep
 */
function limitMessages(messages: Message[]): Message[] {
  if (messages.length > MAX_MESSAGES) {
    return messages.slice(messages.length - MAX_MESSAGES);
  }
  return messages;
}

export const createChatService = () => {
  const gun = Gun({
    peers: [GUN_PEER]
  });
  const messages$ = new BehaviorSubject<Message[]>([]);
  const messageReceived$ = new Subject<Message>();

  gun.get(CHANNEL_ID).map().on((data, id) => {
    if (!data) return;
    
    // Extract useful fields, remove Gun metadata "_"
    const { _, ...messageData } = data;
    
    // Ensure all required fields exist
    if (messageData.id && messageData.content) {
      messageReceived$.next(messageData as Message);
    }
  });

  messageReceived$.pipe(
    withLatestFrom(messages$),
    filter(([message, messages]) => {
      // Filter out duplicates
      if (messages.some((m) => m.id === message.id)) {
        return false;
      }
      // Verify message signature
      const { valid } = verifyMessage(message);
      return valid;
    }),
    tap(([message, messages]) => {
      // Add new message, sort and limit
      const updatedMessages = [...messages, message];
      const sortedMessages = sortMessagesByTimestamp(updatedMessages);
      const limitedMessages = limitMessages(sortedMessages);
      
      messages$.next(limitedMessages);
    })
  ).subscribe();

  const sendMessage = (
    content: string, 
    walletAddress: string, 
    messageKeypairPrivateKey: string, 
    authSignature: string, 
    issuedAt: string, 
    expiresAt: string
  ) => {
    const message = signMessage({
      id: crypto.randomUUID(),
      content: content.trim(),
    }, walletAddress, new Date().toISOString(), messageKeypairPrivateKey, authSignature, issuedAt, expiresAt);
    gun.get(CHANNEL_ID).set(message);
  }
  
  return {
    messages$,
    sendMessage,
    unsubscribe: () => {
      gun.get(CHANNEL_ID).off();
    }
  }
}