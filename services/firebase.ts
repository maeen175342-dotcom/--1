
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, serverTimestamp, query, limitToLast, orderByKey } from 'firebase/database';
import { Message } from '../types';

/**
 * FIREBASE CONFIGURATION SECTION
 * Replace the values below with your own Firebase project configuration.
 * You can find this in your Firebase Console: Project Settings > General > Your apps.
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const MESSAGES_PATH = 'private-chat-messages';

export const sendMessage = async (sender: string, text: string) => {
  if (!text.trim()) return;
  
  const messagesRef = ref(db, MESSAGES_PATH);
  await push(messagesRef, {
    sender,
    text,
    timestamp: serverTimestamp()
  });
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const messagesRef = query(ref(db, MESSAGES_PATH), limitToLast(50));
  
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messageList: Message[] = [];
    
    if (data) {
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        messageList.push({
          id: key,
          ...value
        });
      });
    }
    
    // Ensure chronological order
    callback(messageList.sort((a, b) => a.timestamp - b.timestamp));
  });
};
