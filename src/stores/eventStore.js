import { create } from 'zustand';

const useEventStore = create((set) => ({
  eventData: null,
  participants: [],
  settings: {
    voteSkipThreshold: 50,
    guestRequestsEnabled: true,
    maxQueuePerUser: 3,
    requestCooldownMinutes: 5,
  },

  setEventData: (data) => {
    console.log('Setting event data in store:', data);
    set(state => ({ eventData: data }));
  },
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),

  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId)
  })),

  updateParticipantRole: (userId, newRole) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === userId ? { ...p, role: newRole } : p
    )
  }))
}));

export default useEventStore;