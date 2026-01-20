
import React from 'react';
import { Message } from '../types';
import { FileIcon, Download } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString('ar-EG', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isImage = message.fileType?.startsWith('image/');

  return (
    <div className={`flex flex-col ${isOwn ? 'items-start' : 'items-end'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-1 shadow-sm ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-tl-none' 
          : 'bg-white text-slate-800 border border-slate-100 rounded-tr-none'
      }`}>
        {!isOwn && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">
            {message.sender}
          </p>
        )}
        
        {/* عرض الصور */}
        {message.fileUrl && isImage && (
          <div className="p-1">
            <img 
              src={message.fileUrl} 
              alt="مرفق" 
              className="rounded-xl max-h-64 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          </div>
        )}

        {/* عرض الملفات الأخرى */}
        {message.fileUrl && !isImage && (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center space-x-2 space-x-reverse p-3 rounded-xl m-1 ${
              isOwn ? 'bg-blue-700' : 'bg-slate-100'
            }`}
          >
            <div className={`p-2 rounded-lg ${isOwn ? 'bg-blue-500' : 'bg-white shadow-sm'}`}>
              <FileIcon size={18} className={isOwn ? 'text-white' : 'text-blue-600'} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">ملف مرفق</p>
              <p className="text-[10px] opacity-70">انقر للتحميل</p>
            </div>
            <Download size={16} className="opacity-50" />
          </a>
        )}

        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-3 py-2">
            {message.text}
          </p>
        )}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">
        {time}
      </span>
    </div>
  );
};

export default MessageBubble;
