
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, serverTimestamp, query, limitToLast } from 'firebase/database';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCFECwqDtbKTchDbkXDLmZloYRCp2bJ2_Y",
  authDomain: "duo-chat-34cca.firebaseapp.com",
  databaseURL: "https://duo-chat-34cca-default-rtdb.firebaseio.com",
  projectId: "duo-chat-34cca",
  storageBucket: "duo-chat-34cca.firebasestorage.app",
  messagingSenderId: "401601808559",
  appId: "1:401601808559:web:53139a447216ac64f02c5a",
  measurementId: "G-Z3JL16N4J3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const MESSAGES_PATH = 'private-chat-messages';

export const sendMessage = async (sender: string, text: string, fileUrl?: string, fileType?: string) => {
  const messagesRef = ref(db, MESSAGES_PATH);
  await push(messagesRef, {
    sender,
    text: text || '',
    fileUrl: fileUrl || null,
    fileType: fileType || null,
    timestamp: serverTimestamp()
  });
};

export const uploadFile = async (file: File): Promise<{ url: string, type: string }> => {
  const fileId = `${Date.now()}-${file.name}`;
  const storageRef = sRef(storage, `uploads/${fileId}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url, type: file.type };
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const messagesRef = query(ref(db, MESSAGES_PATH), limitToLast(100));
  
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
    
    callback(messageList.sort((a, b) => a.timestamp - b.timestamp));
  });
};
