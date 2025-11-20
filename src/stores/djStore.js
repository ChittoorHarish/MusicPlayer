import { create } from 'zustand';

const useDJStore = create((set, get) => ({
  // DJ Mode state
  isDJModeEnabled: false,
  isPanelOpen: false,
  
  // EQ settings (in decibels)
  eq: {
    bass: 0,      // -12 to +12 dB
    mid: 0,       // -12 to +12 dB
    treble: 0,    // -12 to +12 dB
  },
  
  // Filter settings
  filter: {
    type: 'none',        // 'none', 'lowpass', 'highpass', 'bandpass'
    frequency: 1000,     // Hz
    q: 1,                // Quality factor
  },
  
  // Audio context reference
  audioContext: null,
  audioNodes: null,
  
  // Actions
  toggleDJMode: () => set((state) => ({ 
    isDJModeEnabled: !state.isDJModeEnabled,
    isPanelOpen: !state.isDJModeEnabled ? true : state.isPanelOpen
  })),
  
  setDJModeEnabled: (enabled) => set({ isDJModeEnabled: enabled }),
  
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  
  setEQ: (band, value) => set((state) => ({
    eq: { ...state.eq, [band]: value }
  })),
  
  setFilter: (settings) => set((state) => ({
    filter: { ...state.filter, ...settings }
  })),
  
  resetEQ: () => set({
    eq: { bass: 0, mid: 0, treble: 0 }
  }),
  
  resetFilter: () => set({
    filter: { type: 'none', frequency: 1000, q: 1 }
  }),
  
  resetAll: () => set({
    eq: { bass: 0, mid: 0, treble: 0 },
    filter: { type: 'none', frequency: 1000, q: 1 }
  }),
  
  setAudioContext: (context) => set({ audioContext: context }),
  
  setAudioNodes: (nodes) => set({ audioNodes: nodes }),
  
  cleanup: () => {
    const { audioContext, audioNodes } = get();
    
    // Disconnect audio nodes
    if (audioNodes) {
      try {
        Object.values(audioNodes).forEach(node => {
          if (node && typeof node.disconnect === 'function') {
            node.disconnect();
          }
        });
      } catch (err) {
        console.warn('Error disconnecting audio nodes:', err);
      }
    }
    
    // Close audio context
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
      } catch (err) {
        console.warn('Error closing audio context:', err);
      }
    }
    
    set({ 
      audioContext: null, 
      audioNodes: null,
      isDJModeEnabled: false,
      isPanelOpen: false
    });
  }
}));

export default useDJStore;
