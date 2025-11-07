import { create } from 'zustand';

const useReactionStore = create((set, get) => ({
  eventData: null,

  setEventData: (data) => set({ eventData: data }),

  // Initialize reactions if missing
  initializeReactions: () => {
    const eventData = get().eventData;
    if (eventData && !eventData.reactions) {
      const reactionTypes = ['👍', '❤️', '🔥', '😂', '🎵', '🎉'];
      const reactions = {};
      reactionTypes.forEach(r => reactions[r] = 0);
      set({ eventData: { ...eventData, reactions } });
    }
  },

  // Increment a reaction
  addReaction: (emoji) => {
    const eventData = get().eventData;
    if (!eventData?.reactions) return;
    const updatedReactions = {
      ...eventData.reactions,
      [emoji]: (eventData.reactions[emoji] || 0) + 1
    };
    set({ eventData: { ...eventData, reactions: updatedReactions } });
  },

}));

export default useReactionStore;
