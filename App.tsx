
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
import { UserSession } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  // Persistence check (Simple session storage for current tab)
  useEffect(() => {
    const savedName = sessionStorage.getItem('chat_user_name');
    const savedAuth = sessionStorage.getItem('chat_is_authenticated');
    
    if (savedName && savedAuth === 'true') {
      setSession({ name: savedName, isAuthenticated: true });
    }
  }, []);

  const handleLogin = (name: string) => {
    sessionStorage.setItem('chat_user_name', name);
    sessionStorage.setItem('chat_is_authenticated', 'true');
    setSession({ name, isAuthenticated: true });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setSession(null);
  };

  if (!session || !session.isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <ChatScreen userName={session.name} onLogout={handleLogout} />;
};

export default App;
