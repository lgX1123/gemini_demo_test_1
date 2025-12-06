import React, { useState, useRef, useEffect } from 'react';
import { Send, Map, Menu, X } from 'lucide-react';
import { ChatMessage as ChatMessageType, Role } from '../types';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isOpen, 
  setIsOpen 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <>
        {/* Toggle Button (Mobile/Tablet) when closed */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="absolute top-4 left-4 z-[30] bg-white p-3 rounded-full shadow-lg md:hidden text-gray-700 hover:text-blue-600 transition-colors"
            >
                <Menu size={24} />
            </button>
        )}

        {/* Sidebar Panel */}
        <div 
            className={`
                fixed inset-y-0 left-0 z-[40] w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
            `}
        >
            {/* Header */}
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg text-white">
                        <Map size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">GeoGemini</span>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50/50 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                            <Map size={32} />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">Welcome to GeoGemini</h3>
                        <p className="text-sm max-w-[240px]">
                            Ask about restaurants, landmarks, or current events. I'll show you where they are on the map.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {['Italian restaurants nearby', 'Parks in New York', 'Cafes with wifi'].map(suggestion => (
                                <button 
                                    key={suggestion}
                                    onClick={() => onSendMessage(suggestion)}
                                    className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
                {/* Loading Indicator for streaming feel (though strictly it's one-shot here) */}
                {isLoading && (
                    <ChatMessage 
                        message={{
                            id: 'loading',
                            role: Role.MODEL,
                            text: '',
                            timestamp: Date.now(),
                            isLoading: true
                        }} 
                    />
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about places..."
                        className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={`absolute right-2 p-2 rounded-full transition-all ${
                            input.trim() && !isLoading 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="text-[10px] text-center text-gray-400 mt-2">
                    Powered by Gemini 2.5 Flash with Google Maps Grounding
                </div>
            </div>
        </div>
    </>
  );
};

export default ChatInterface;
