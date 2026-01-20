
import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, MessageSquare, Image as ImageIcon, Paperclip, Loader2, Mic, Square, X, Circle } from 'lucide-react';
import { Message } from '../types';
import { sendMessage, subscribeToMessages, uploadFile } from '../services/firebase';
import MessageBubble from './MessageBubble';

interface ChatScreenProps {
  userName: string;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(userName, inputText.trim());
      setInputText('');
    } catch (error) {
      console.error("خطأ في الإرسال:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url, type } = await uploadFile(file);
      await sendMessage(userName, '', url, type);
    } catch (error) {
      console.error("خطأ في رفع الملف:", error);
      alert("فشل في رفع الملف، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 1000) {
          const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
          setIsUploading(true);
          try {
            const { url, type } = await uploadFile(file);
            await sendMessage(userName, '', url, type);
          } catch (err) {
            console.error("Error uploading voice note:", err);
          } finally {
            setIsUploading(false);
          }
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("يرجى تفعيل صلاحية الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      audioChunksRef.current = [];
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Header - Fixed Top */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:py-4 flex items-center justify-center sticky top-0 z-20">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <MessageSquare size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-right">
              <h2 className="text-sm md:text-base font-bold text-slate-800 leading-none mb-1">المحادثة الثنائية</h2>
              <div className="flex items-center justify-end">
                <span className="text-[10px] md:text-xs text-emerald-500 font-bold ml-1.5">نشط الآن</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
            title="تسجيل الخروج"
          >
            <LogOut size={20} className="transform rotate-180 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Messages Area - Full width on mobile, centered on desktop */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar space-y-4 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 p-8">
              <div className="w-20 h-20 bg-slate-200 rounded-full mb-6 flex items-center justify-center animate-bounce">
                 <MessageSquare size={32} className="text-slate-400" />
              </div>
              <p className="text-sm md:text-base text-slate-600 font-medium">أهلاً بك! ابدأ بإرسال أول رسالة في المحادثة.</p>
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
          {isUploading && (
            <div className="flex justify-center p-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 space-x-reverse text-xs font-bold animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>جاري معالجة الملف...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="bg-white border-t border-slate-200 p-3 md:p-4 pb-safe">
        <div className="max-w-4xl mx-auto">
          {isRecording ? (
            <div className="flex items-center justify-between bg-red-50 text-red-600 px-4 py-3 rounded-2xl animate-pulse border border-red-100 shadow-sm">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative">
                  <Circle size={12} className="fill-red-600 text-red-600" />
                  <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="font-mono font-bold text-xl">{formatTime(recordingTime)}</span>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button 
                  onClick={cancelRecording}
                  className="p-2.5 bg-white text-slate-400 rounded-full hover:text-red-600 transition-colors shadow-sm active:scale-90"
                >
                  <X size={22} />
                </button>
                <button 
                  onClick={stopRecording}
                  className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-90"
                >
                  <Square size={22} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90"
                title="إرفاق ملف"
              >
                <Paperclip size={24} />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*, audio/*, .pdf, .doc, .docx, .zip"
              />

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-right shadow-inner"
                />
              </div>

              {inputText.trim() ? (
                <button
                  type="submit"
                  disabled={isSending}
                  className="p-3.5 rounded-2xl flex items-center justify-center transition-all bg-blue-600 text-white shadow-xl shadow-blue-200 active:scale-90"
                >
                  <Send size={24} className={`transform rotate-180 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isUploading}
                  className="p-3.5 rounded-2xl flex items-center justify-center transition-all bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                  title="تسجيل صوتي"
                >
                  <Mic size={24} />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
