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
import { useRoleStore } from "./roleStore";

const useQueueStore = create((set, get) => ({
  queue: [],
  localQueue: [], // For local files only (not synced to Firebase)
  roomId: null,
  unsubscribe: null,

  /** 🔹 Initialize Firestore listener for the queue */
  initQueueListener: async (roomId) => {
    if (!roomId) return;

    // Stop previous listener if it exists
    const existingUnsub = get().unsubscribe;
    if (existingUnsub) existingUnsub();

    const queueRef = doc(db, "queues", roomId);

    // Create queue doc if missing
    const docSnap = await getDoc(queueRef);
    if (!docSnap.exists()) {
      await setDoc(queueRef, { songs: [] });
    }

    // Listen for real-time updates
    const unsubscribe = onSnapshot(queueRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        set({ queue: data.songs || [] });
      }
    });

    set({ roomId, unsubscribe });
  },

  /** 🔹 Add a song to queue — detects Host or Guest automatically */
  addToQueue: async (song) => {
    // Handle local files separately (not synced to Firebase)
    if (song.source === 'local') {
      const localSong = {
        ...song,
        addedBy: 'local',
        timestamp: Date.now(),
      };
      delete localSong.file; // Remove File object
      
      set((state) => ({
        localQueue: [...state.localQueue, localSong],
        queue: [...state.queue, localSong] // Add to combined queue for display
      }));
      return;
    }

    const { roomId } = get();
    if (!roomId) {
      console.warn("No roomId set in queueStore.");
      return;
    }

    // ✅ Get role & userId from roleStore
    const { userRole, userId } = useRoleStore.getState();

    const queueRef = doc(db, "queues", roomId);

    const songObj = {
      ...song,
      addedBy: userRole || "guest", // 'host' or 'guest'
      addedById: userId || "unknown",
      timestamp: Date.now(),
    };

    try {
      await updateDoc(queueRef, {
        songs: arrayUnion(songObj),
      });
    } catch (err) {
      console.error("Error adding song:", err);
    }
  },

  /** 🔹 Remove a song from the queue */
  removeItem: async (index) => {
    const { queue, roomId, localQueue } = get();
    
    // Check if it's a local file
    if (queue[index]?.source === 'local') {
      const updatedQueue = queue.filter((_, i) => i !== index);
      const updatedLocalQueue = localQueue.filter((_, i) => i !== index);
      set({ queue: updatedQueue, localQueue: updatedLocalQueue });
      return;
    }
    
    if (!roomId) return;

    const queueRef = doc(db, "queues", roomId);
    const updatedQueue = [...queue];
    updatedQueue.splice(index, 1);

    await updateDoc(queueRef, { songs: updatedQueue });
    set({ queue: updatedQueue });
  },

  /** 🔹 Move songs up/down and sync to Firestore */
  moveItem: async (fromIndex, toIndex) => {
    const { queue, roomId } = get();
    if (toIndex < 0 || toIndex >= queue.length) return;

    const updatedQueue = [...queue];
    const [moved] = updatedQueue.splice(fromIndex, 1);
    updatedQueue.splice(toIndex, 0, moved);

    const queueRef = doc(db, "queues", roomId);
    await updateDoc(queueRef, { songs: updatedQueue });
    set({ queue: updatedQueue });
  },

  /** 🔹 Stop listening when user leaves the event */
  stopListener: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, queue: [], localQueue: [] });
  },

  clearQueue: () => {
    set({ queue: [], localQueue: [] });
  },
}));

export default useQueueStore;
