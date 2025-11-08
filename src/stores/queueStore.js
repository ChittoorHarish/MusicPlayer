import { create } from "zustand";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

const useQueueStore = create((set, get) => ({
  queue: [],
  roomId: null,
  unsubscribe: null,

  /** 🎧 Initialize real-time listener for host or guest */
  initQueueListener: async (roomId) => {
    if (!roomId) return;

    // Stop previous listener (if exists)
    const existingUnsub = get().unsubscribe;
    if (existingUnsub) existingUnsub();

    const queueRef = doc(db, "queues", roomId);

    // Ensure queue document exists
    try {
      const docSnap = await getDoc(queueRef);
      if (!docSnap.exists()) {
        await setDoc(queueRef, { songs: [] });
      }
    } catch (err) {
      console.error("Error initializing queue document:", err);
      return;
    }

    // Real-time sync listener
    const unsubscribe = onSnapshot(queueRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        set({ queue: data.songs || [] });
      } else {
        set({ queue: [] });
      }
    });

    set({ roomId, unsubscribe });
  },

  /** 🎵 Add a song to queue (reflects to both host & guests) */
  addToQueue: async (song, addedBy = "guest") => {
    const { roomId } = get();
    if (!roomId) {
      console.warn("⚠️ No roomId set for queue store.");
      return;
    }

    const queueRef = doc(db, "queues", roomId);
    const songObj = {
      ...song,
      addedBy,
      timestamp: Date.now(),
    };

    try {
      await updateDoc(queueRef, {
        songs: arrayUnion(songObj),
      });
    } catch (err) {
      console.error("Error adding song:", err);

      // Handle missing doc (if deleted somehow)
      if (err.code === "not-found") {
        await setDoc(queueRef, { songs: [songObj] });
      }
    }
  },

  /** ❌ Remove song and sync with Firestore */
  removeItem: async (index) => {
    const { queue, roomId } = get();
    if (!roomId) return;

    const queueRef = doc(db, "queues", roomId);
    const updatedQueue = [...queue];
    updatedQueue.splice(index, 1);

    try {
      await updateDoc(queueRef, { songs: updatedQueue });
      set({ queue: updatedQueue });
    } catch (err) {
      console.error("Error removing song:", err);
    }
  },

  /** 🔁 Move song up/down in queue */
  moveItem: async (fromIndex, toIndex) => {
    const { queue, roomId } = get();
    if (!roomId) return;
    if (toIndex < 0 || toIndex >= queue.length) return;

    const updatedQueue = [...queue];
    const [moved] = updatedQueue.splice(fromIndex, 1);
    updatedQueue.splice(toIndex, 0, moved);

    const queueRef = doc(db, "queues", roomId);
    try {
      await updateDoc(queueRef, { songs: updatedQueue });
      set({ queue: updatedQueue });
    } catch (err) {
      console.error("Error moving song:", err);
    }
  },

  /** 🛑 Stop real-time listener */
  stopListener: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, queue: [] });
  },

  /** 🧹 Clear queue (local + Firestore) */
  clearQueue: async () => {
    const { roomId } = get();
    set({ queue: [] });

    if (roomId) {
      try {
        const queueRef = doc(db, "queues", roomId);
        await updateDoc(queueRef, { songs: [] });
      } catch (err) {
        console.warn("Error clearing queue in Firestore:", err);
      }
    }
  },
}));

export default useQueueStore;
