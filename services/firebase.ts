import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message } from '../types';

// Firebase configuration
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

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const MESSAGES_COLLECTION = 'messages';

export const sendMessage = async (sender: string, text: string, fileUrl?: string, fileType?: string) => {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    await addDoc(messagesRef, {
      sender,
      text: text || '',
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error in sendMessage (Firestore):", error);
    throw error;
  }
};

export const uploadFile = async (file: File): Promise<{ url: string, type: string }> => {
  try {
    const fileId = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = sRef(storage, `uploads/${fileId}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, type: file.type };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));
    
    return onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamp to milliseconds for compatibility with existing UI
        const timestamp = data.timestamp instanceof Timestamp 
          ? data.timestamp.toMillis() 
          : (data.timestamp || Date.now());

        messageList.push({
          id: doc.id,
          sender: data.sender,
          text: data.text,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          timestamp: timestamp
        });
      });
      
      callback(messageList);
    }, (error) => {
      console.error("Firestore subscription error:", error);
    });
  } catch (err) {
    console.error("Critical error in subscribeToMessages (Firestore):", err);
    return () => {};
  }
};