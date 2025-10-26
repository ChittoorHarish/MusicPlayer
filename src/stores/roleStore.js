import { create } from 'zustand';

export const useRoleStore = create((set, get) => ({
  userId: null,
  userRole: null, // 'host', 'subhost', 'guest'
  lastSongRequest: null,

  setRole: (role, id) => {
    console.log('Setting role:', role, 'for user:', id);
    set(state => ({
      userRole: role,
      userId: id
    }));
  },
  
  resetRole: () => set({
    userRole: null,
    userId: null,
    lastSongRequest: null
  }),

  setLastSongRequest: (timestamp) => set({ 
    lastSongRequest: timestamp 
  }),

  can: (action) => {
    const { userRole } = get();
    
    const permissions = {
      canDeleteItems: userRole === 'host',
      canReorderQueue: ['host', 'subhost'].includes(userRole),
      canVoteSkip: userRole === 'guest',
      canRequestSong: true, // Everyone can request songs
      canPromoteToSubHost: userRole === 'host',
      canRemoveGuest: userRole === 'host',
      canUpdateSettings: userRole === 'host',
      canSkip: ['host', 'subhost'].includes(userRole),
      canPause: ['host', 'subhost'].includes(userRole),
      canChat: true,
      canReact: true
    };
    
    return permissions[action] || false;
  },

  canRequestSong: () => {
    const { lastSongRequest, userRole } = get();
    if (userRole === 'host' || userRole === 'subhost') return true;
    
    if (!lastSongRequest) return true;
    
    const cooldownPeriod = 25 * 60 * 1000; // 25 minutes in milliseconds
    const timeSinceLastRequest = Date.now() - lastSongRequest;
    
    return timeSinceLastRequest >= cooldownPeriod;
  }
}));