import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useQueueStore = create((set, get) => ({
  queue: [],
  voteSkips: {}, // { songId: [userId1, userId2, ...] }
  lastRequestTime: {}, // { userId: timestamp }

  addToQueue: (video) => {
    const state = get();
    const now = Date.now();
    const cooldownPeriod = 25 * 60 * 1000; // 25 minutes

    // 1️⃣ Prevent duplicates by ID
    if (state.queue.some((s) => s.id === video.id)) {
      toast.error('This song is already in the queue');
      return false;
    }

    // 2️⃣ Prevent duplicates by normalized title + artist (to avoid reuploads)
    const normalize = (title) =>
      title
        .toLowerCase()
        .replace(/[\(\)\[\]\-–_:|]/g, '')
        .replace(/\b(hd|lyrics|letra|traducida|audio|video|cover)\b/g, '')
        .trim();

    const signature = `${normalize(video.title)}|${video.artist?.toLowerCase() || ''}`;
    if (state.queue.some((s) => {
      const sSignature = `${normalize(s.title)}|${s.artist?.toLowerCase() || ''}`;
      return sSignature === signature;
    })) {
      toast.error('A similar song is already in the queue');
      return false;
    }

    // 3️⃣ Check guest cooldown
    if (video.userRole === 'guest') {
      const lastRequest = state.lastRequestTime[video.addedBy] || 0;
      if (now - lastRequest < cooldownPeriod) {
        const remainingMinutes = Math.ceil((cooldownPeriod - (now - lastRequest)) / 60000);
        toast.error(`Please wait ${remainingMinutes} minutes before requesting another song`);
        return false;
      }
    }

    // 4️⃣ Add song
    set((state) => ({
      queue: [...state.queue, video],
      lastRequestTime: { ...state.lastRequestTime, [video.addedBy]: now },
    }));

    toast.success('Song added to queue');
    return true;
  },

  removeSong: (songId, userRole, userId) => {
    const song = get().queue.find((s) => s.id === songId);
    if (!song) return false;

    if (userRole === 'host' || (userRole === 'subhost' && song.addedBy === userId)) {
      set((state) => ({
        queue: state.queue.filter((s) => s.id !== songId),
        voteSkips: { ...state.voteSkips, [songId]: [] },
      }));
      toast.success('Song removed from queue');
      return true;
    }

    toast.error("You don't have permission to remove this song");
    return false;
  },

  moveItem: (fromIndex, toIndex) => {
    if (toIndex < 0) return;
    set((state) => {
      const newQueue = [...state.queue];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return { queue: newQueue };
    });
  },

  removeItem: (index) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },

  reorderQueue: (fromIndex, toIndex, userRole) => {
    if (userRole !== 'host' && userRole !== 'subhost') {
      toast.error('Only hosts and sub-hosts can reorder the queue');
      return false;
    }

    set((state) => {
      const newQueue = [...state.queue];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return { queue: newQueue };
    });

    return true;
  },

  voteToSkip: (songId, userId, totalGuests, skipThreshold) => {
    set((state) => {
      const currentVotes = state.voteSkips[songId] || [];
      if (currentVotes.includes(userId)) return state;

      const newVotes = [...currentVotes, userId];
      const votePercentage = (newVotes.length / totalGuests) * 100;

      if (votePercentage >= skipThreshold) {
        return {
          queue: state.queue.filter((s) => s.id !== songId),
          voteSkips: { ...state.voteSkips, [songId]: [] },
        };
      }

      return { voteSkips: { ...state.voteSkips, [songId]: newVotes } };
    });
  },

  clearQueue: () => set({ queue: [], voteSkips: {} }),

  getVoteCount: (songId) => {
    const votes = get().voteSkips[songId] || [];
    return votes.length;
  },
}));

export default useQueueStore;
