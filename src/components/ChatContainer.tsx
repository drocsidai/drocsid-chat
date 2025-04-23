
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatContainer: React.FC = () => {
  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden shadow-lg border border-gray-800">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
