
import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, MessageSquare, Image as ImageIcon, Paperclip, Loader2, Mic, Square, X } from 'lucide-react';
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

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 1000) { // Only send if it's not a tiny accidental click
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
      alert("يرجى تفعيل صلاحية الميكروفون لتسجيل الصوت.");
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
      mediaRecorderRef.current.onstop = null; // Prevent the upload on stop
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
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <MessageSquare size={20} />
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-800">دردشة ثنائية خاصة</h2>
            <p className="text-[11px] text-emerald-500 font-medium flex items-center justify-end">
              متصل الآن
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
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
        {isUploading && (
          <div className="flex justify-center p-4">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center space-x-2 space-x-reverse text-blue-600 text-xs font-medium">
              <Loader2 size={14} className="animate-spin" />
              <span>جاري المعالجة...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 pb-safe">
        <div className="max-w-4xl mx-auto">
          {isRecording ? (
            <div className="flex items-center justify-between bg-red-50 text-red-600 px-4 py-2 rounded-2xl animate-pulse border border-red-100">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <span className="font-mono font-bold text-lg">{formatTime(recordingTime)}</span>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button 
                  onClick={cancelRecording}
                  className="p-2 bg-white text-slate-400 rounded-full hover:text-red-600 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={stopRecording}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                >
                  <Square size={20} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center space-x-2 space-x-reverse">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                title="إرفاق ملف"
              >
                <Paperclip size={22} />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*, audio/*, .pdf, .doc, .docx, .zip"
              />

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  disabled={isSending}
                  className="p-3 rounded-2xl flex items-center justify-center transition-all bg-blue-600 text-white shadow-lg shadow-blue-100 active:scale-95"
                >
                  <Send size={20} className={`transform rotate-180 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isUploading}
                  className="p-3 rounded-2xl flex items-center justify-center transition-all bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                  title="تسجيل صوتي"
                >
                  <Mic size={22} />
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
