import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const useChatStore = create((set, get) => ({
  messages: [],
  
  /**
   * Initialize real-time listener for chat messages
   */
  initChatListener: (eventId) => {
    const messagesRef = collection(db, 'events', eventId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      set({ messages });
    });
  },
  
  /**
   * Send a new message to Firebase
   */
  sendMessage: async (eventId, messageData) => {
    try {
      const messagesRef = collection(db, 'events', eventId, 'messages');
      await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  /**
   * Clear local messages (e.g., when leaving event)
   */
  clearChat: () => set({ messages: [] }),
}));

export default useChatStore;