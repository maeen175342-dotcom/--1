
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString('ar-EG', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex flex-col ${isOwn ? 'items-start' : 'items-end'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-tl-none' 
          : 'bg-white text-slate-800 border border-slate-100 rounded-tr-none'
      }`}>
        {!isOwn && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {message.sender}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">
        {time}
      </span>
    </div>
  );
};

export default MessageBubble;
