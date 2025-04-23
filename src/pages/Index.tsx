import ChatContainer from '@/components/ChatContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[600px] flex flex-col">
        <ChatContainer />
      </div>
    </div>
  );
};

export default Index;
