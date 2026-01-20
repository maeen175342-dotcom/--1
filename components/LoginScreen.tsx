
import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== '7770') {
      setError('رمز الدخول غير صحيح.');
      return;
    }
    
    if (!name.trim()) {
      setError('يرجى إدخال اسم العرض الخاص بك.');
      return;
    }
    
    onLogin(name.trim());
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Lock size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">دردشة خاصة</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">أدخل الرمز للاستمرار بشكل آمن</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 mr-1">رمز الدخول</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg tracking-widest"
                placeholder="****"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 mr-1">اسمك المستعار</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pr-11 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-right"
                placeholder="مثال: أحمد"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs md:text-sm py-2 px-4 rounded-lg font-medium text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.97] mt-2"
          >
            دخول الدردشة
          </button>
        </form>
        
        <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest">تشفير كامل للبيانات</p>
      </div>
    </div>
  );
};

export default LoginScreen;
