import { create } from 'zustand';
import { doc, updateDoc, onSnapshot, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const useReactionsStore = create((set) => ({
  // Reaction counts
  reactions: {
    '👍': 0,
    '🔥': 0,
    '😂': 0,
    '💃': 0,
    '👎': 0,
  },

  // Add a reaction
  addReaction: async (eventId, reaction) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        [`reactions.${reaction}`]: increment(1)
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  },

  // Initialize reactions for a new event
  initializeReactions: async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await setDoc(eventRef, {
        reactions: {
          '👍': 0,
          '🔥': 0,
          '😂': 0,
          '💃': 0,
          '👎': 0,
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error initializing reactions:', error);
    }
  },

  // Set up real-time listener for reactions
  subscribeToReactions: (eventId, callback) => {
    if (!eventId) return () => {};
    
    const unsubscribe = onSnapshot(doc(db, 'events', eventId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.reactions) {
          set({ reactions: data.reactions });
          if (callback) callback(data.reactions);
        }
      }
    });

    return unsubscribe;
  }
}));

export default useReactionsStore;