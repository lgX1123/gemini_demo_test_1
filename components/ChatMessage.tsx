import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, ChatMessage as ChatMessageType } from '../types';
import { Bot, User, MapPin } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
          }`}>
            {message.isLoading ? (
               <div className="flex space-x-2 items-center h-5">
                 <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown
                    components={{
                        a: ({node, ...props}) => <a {...props} className={`underline ${isUser ? 'text-white' : 'text-blue-600'} hover:text-opacity-80`} target="_blank" rel="noopener noreferrer" />,
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 mb-2" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Locations Preview Chips */}
          {!isUser && message.locations && message.locations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.locations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs shadow-sm hover:bg-gray-50 cursor-default transition-colors">
                  <MapPin size={12} className="text-red-500" />
                  <span className="truncate max-w-[150px]">{loc.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
