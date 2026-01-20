
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
  const isAudio = message.fileType?.startsWith('audio/');

  return (
    <div className={`flex flex-col ${isOwn ? 'items-start' : 'items-end'} w-full`}>
      <div className={`max-w-[88%] sm:max-w-[75%] md:max-w-[60%] rounded-2xl md:rounded-3xl p-1 shadow-sm transition-all duration-300 ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-tl-none' 
          : 'bg-white text-slate-800 border border-slate-100 rounded-tr-none'
      }`}>
        {!isOwn && (
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-500 px-3 pt-2 pb-1 text-right">
            {message.sender}
          </p>
        )}
        
        {/* Images */}
        {message.fileUrl && isImage && (
          <div className="p-1">
            <img 
              src={message.fileUrl} 
              alt="مرفق" 
              className="rounded-xl md:rounded-2xl max-h-64 md:max-h-96 w-full object-cover cursor-pointer hover:brightness-95 transition-all"
              onClick={() => window.open(message.fileUrl, '_blank')}
              loading="lazy"
            />
          </div>
        )}

        {/* Audio (Voice Notes) */}
        {message.fileUrl && isAudio && (
          <div className={`p-2 min-w-[220px] md:min-w-[280px] ${isOwn ? 'text-white' : 'text-slate-800'}`}>
            <audio 
              controls 
              src={message.fileUrl} 
              className={`w-full h-10 ${isOwn ? 'filter brightness-0 invert' : 'opacity-80'}`}
            >
              متصفحك لا يدعم الصوت.
            </audio>
          </div>
        )}

        {/* Other Files */}
        {message.fileUrl && !isImage && !isAudio && (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center space-x-3 space-x-reverse p-4 rounded-xl m-1 transition-colors ${
              isOwn ? 'bg-blue-700/50 hover:bg-blue-700' : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${isOwn ? 'bg-blue-500 shadow-sm' : 'bg-white shadow-sm'}`}>
              <FileIcon size={20} className={isOwn ? 'text-white' : 'text-blue-600'} />
            </div>
            <div className="flex-1 overflow-hidden text-right">
              <p className="text-sm font-bold truncate">مستند / ملف</p>
              <p className="text-[10px] opacity-70">انقر للمعاينة والتحميل</p>
            </div>
            <Download size={18} className="opacity-40" />
          </a>
        )}

        {/* Text Message */}
        {message.text && (
          <p className="text-[15px] md:text-base leading-relaxed whitespace-pre-wrap break-words px-4 py-2.5 text-right">
            {message.text}
          </p>
        )}
      </div>
      <span className="text-[10px] md:text-xs text-slate-400 mt-1.5 px-2 font-medium">
        {time}
      </span>
    </div>
  );
};

export default MessageBubble;
