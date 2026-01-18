
import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, MessageSquare } from 'lucide-react';
import { Message } from '../types';
import { sendMessage, subscribeToMessages } from '../services/firebase';
import MessageBubble from './MessageBubble';

interface ChatScreenProps {
  userName: string;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((fetchedMessages) => {
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(userName, inputText.trim());
      setInputText('');
    } catch (error) {
      console.error("Failed to send:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">دردشة ثنائية خاصة</h2>
            <p className="text-[11px] text-emerald-500 font-medium flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1.5 animate-pulse"></span>
              متصل الآن
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut size={20} className="transform rotate-180" />
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-2 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 grayscale p-8">
            <div className="w-16 h-16 bg-slate-200 rounded-full mb-4 flex items-center justify-center">
               <MessageSquare size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isOwn={msg.sender === userName} 
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 pb-safe">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex space-x-3 space-x-reverse">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              !inputText.trim() || isSending
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-100 active:scale-95'
            }`}
          >
            <Send size={20} className={`transform rotate-180 ${isSending ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
