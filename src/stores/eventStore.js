import { create } from 'zustand';
import isEqual from 'lodash/isEqual'; // lightweight deep compare utility

const useEventStore = create((set, get) => ({
  eventData: null,
  participants: [],
  settings: {
    voteSkipThreshold: 50,
    guestRequestsEnabled: true,
    maxQueuePerUser: 3,
    requestCooldownMinutes: 5,
  },

  // Last activity timestamp for each participant
  participantActivity: {},

  setEventData: (data) => {
    const currentData = get().eventData;

    // ✅ Avoid unnecessary updates to prevent infinite logs/re-renders
    if (!isEqual(currentData, data)) {
      console.log('Setting event data in store:', data);
      set({ eventData: data });
    }
  },

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== userId),
    })),

  updateParticipantRole: (userId, newRole) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === userId ? { ...p, role: newRole } : p
      ),
    })),
}));

export default useEventStore;
