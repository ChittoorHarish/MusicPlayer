// src/stores/reactionStore.js
import { create } from "zustand";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";

const defaultReactionState = {
  "👍": { count: 0, users: [] },
  "❤️": { count: 0, users: [] },
  "🔥": { count: 0, users: [] },
  "😂": { count: 0, users: [] },
  "🎵": { count: 0, users: [] },
  "🎉": { count: 0, users: [] },
};

const useReactionStore = create((set, get) => ({
  currentSongReactions: { ...defaultReactionState },

  /**
   * Ensures we ALWAYS have a fully shaped reaction state
   */
  _normalizeReactions: (incoming) => {
    const clean = { ...defaultReactionState };

    Object.keys(clean).forEach((emoji) => {
      if (incoming?.[emoji]) {
        clean[emoji] = {
          count: incoming[emoji].count || 0,
          users: incoming[emoji].users || [],
        };
      }
    });

    return clean;
  },

  /**
   * Clears reactions when a new song starts
   */
  clearCurrentReactions: () => {
    set({ currentSongReactions: { ...defaultReactionState } });
  },

  /**
   * Listens for live updates from Firebase for a specific song
   */
  initReactionsListener: (eventId, songId) => {
    const ref = doc(db, "events", eventId, "reactions", songId);

    return onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        // Safety + normalization
        const normalized = get()._normalizeReactions(data);
        set({ currentSongReactions: normalized });
      } else {
        // No reactions yet → set safe defaults
        set({ currentSongReactions: { ...defaultReactionState } });
      }
    });
  },

  /**
   * User clicks a reaction button → updates Firebase & UI
   */
  addReaction: async (eventId, songId, emoji, userId) => {
    const ref = doc(db, "events", eventId, "reactions", songId);
    const snap = await getDoc(ref);

    let current = snap.exists() ? snap.data() : { ...defaultReactionState };

    // Normalize to remove any undefined issues
    current = get()._normalizeReactions(current);

    const users = current[emoji].users || [];
    const hasReacted = users.includes(userId);

    if (!hasReacted) {
      current[emoji] = {
        count: current[emoji].count + 1,
        users: [...users, userId],
      };
    }

    // Save safe data back to Firebase
    await setDoc(ref, current, { merge: true });

    // Update Zustand instantly for crisp UI
    set({
      currentSongReactions: get()._normalizeReactions(current),
    });
  },
}));

export default useReactionStore;
