import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  reactions: {}, // { songId: { '👍': [userId1, userId2], '❤️': [userId3] } }
  
  addMessage: (message) => set(state => ({
    messages: [...state.messages, { ...message, timestamp: Date.now() }]
  })),
  
  addReaction: (songId, reaction, userId) => set(state => {
    const songReactions = state.reactions[songId] || {};
    const reactionUsers = songReactions[reaction] || [];
    
    // Toggle reaction
    const newReactionUsers = reactionUsers.includes(userId)
      ? reactionUsers.filter(id => id !== userId)
      : [...reactionUsers, userId];
    
    return {
      reactions: {
        ...state.reactions,
        [songId]: {
          ...songReactions,
          [reaction]: newReactionUsers
        }
      }
    };
  }),
  
  clearChat: () => set({ messages: [] }),
  
  getReactionCount: (songId, reaction) => {
    const state = useChatStore.getState();
    return (state.reactions[songId]?.[reaction] || []).length;
  }
}));

export default useChatStore;