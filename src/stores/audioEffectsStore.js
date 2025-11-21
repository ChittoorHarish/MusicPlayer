// audioEffectsStore.js - Zustand store for audio effects presets
import { create } from 'zustand';

const effectPresets = [
  {
    id: 'original',
    name: 'Original',
    icon: '🎹',
    bass: 0,
    mid: 0,
    treble: 0,
    reverb: 0,
    echo: 0,
    pitch: 0,
    speed: 1.0,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    icon: '🎹',
    bass: 5,
    mid: -2,
    treble: -8,
    reverb: 0.15,
    echo: 0,
    pitch: 0,
    speed: 0.92,
    bitcrush: 0.3,
    distortion: 0.15
  },
  {
    id: 'upbeat',
    name: 'Upbeat',
    icon: '🔥',
    bass: 3,
    mid: 2,
    treble: 4,
    reverb: 0,
    echo: 0,
    pitch: 0,
    speed: 1.15,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'edm',
    name: 'EDM',
    icon: '⚡',
    bass: 10,
    mid: -2,
    treble: 6,
    reverb: 0.15,
    echo: 0.2,
    pitch: 0,
    speed: 1.08,
    bitcrush: 0,
    distortion: 0.3
  },
  {
    id: 'acoustic',
    name: 'Acoustic',
    icon: '🎻',
    bass: -2,
    mid: 4,
    treble: -3,
    reverb: 0.4,
    echo: 0.1,
    pitch: 0,
    speed: 1.0,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'slowed',
    name: 'Slowed',
    icon: '🌙',
    bass: 6,
    mid: 0,
    treble: -4,
    reverb: 0.7,
    echo: 0.3,
    pitch: -2,
    speed: 0.80,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'nightcore',
    name: 'Nightcore',
    icon: '🎤',
    bass: -4,
    mid: 2,
    treble: 6,
    reverb: 0.1,
    echo: 0,
    pitch: 4,
    speed: 1.30,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'bass_boost',
    name: 'Bass Boost',
    icon: '🎸',
    bass: 12,
    mid: -1,
    treble: -2,
    reverb: 0,
    echo: 0,
    pitch: 0,
    speed: 1.0,
    bitcrush: 0,
    distortion: 0.25
  },
  {
    id: '8d',
    name: '8D Audio',
    icon: '🎧',
    bass: 2,
    mid: 1,
    treble: 1,
    reverb: 0.35,
    echo: 0.15,
    pitch: 0,
    speed: 1.0,
    bitcrush: 0,
    distortion: 0
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📻',
    bass: -3,
    mid: 3,
    treble: -6,
    reverb: 0.2,
    echo: 0.1,
    pitch: 0,
    speed: 0.96,
    bitcrush: 0.4,
    distortion: 0.1
  }
];

const useAudioEffectsStore = create((set, get) => ({
  effectPresets,
  activePreset: 'original', // Keep for backward compatibility
  activeEffects: [], // Array of active effect IDs that can be mixed
  
  setActivePreset: (presetId) => set({ activePreset: presetId }),
  
  // Toggle an effect on/off
  toggleEffect: (effectId) => {
    const currentEffects = get().activeEffects;
    
    // If "original" is clicked, clear all effects
    if (effectId === 'original') {
      set({ activeEffects: [], activePreset: 'original' });
      return;
    }
    
    // Toggle the effect
    if (currentEffects.includes(effectId)) {
      // Remove effect if already active
      set({ 
        activeEffects: currentEffects.filter(id => id !== effectId),
        activePreset: currentEffects.filter(id => id !== effectId).length > 0 ? 'mixed' : 'original'
      });
    } else {
      // Add effect
      set({ 
        activeEffects: [...currentEffects, effectId],
        activePreset: 'mixed'
      });
    }
  },
  
  // Check if an effect is currently active
  isEffectActive: (effectId) => {
    const state = get();
    if (effectId === 'original') {
      return state.activeEffects.length === 0;
    }
    return state.activeEffects.includes(effectId);
  },
  
  getPresetById: (presetId) => {
    return effectPresets.find(preset => preset.id === presetId) || effectPresets[0];
  },
  
  // Get combined effects from all active presets
  getCombinedEffects: () => {
    const state = get();
    
    // If no effects active, return original
    if (state.activeEffects.length === 0) {
      return effectPresets[0]; // Original
    }
    
    // Combine all active effects
    const combined = {
      id: 'mixed',
      name: 'Mixed',
      icon: '🎛️',
      bass: 0,
      mid: 0,
      treble: 0,
      reverb: 0,
      echo: 0,
      pitch: 0,
      speed: 1.0,
      bitcrush: 0,
      distortion: 0
    };
    
    // Add effects from each active preset
    state.activeEffects.forEach(effectId => {
      const preset = effectPresets.find(p => p.id === effectId);
      if (preset) {
        combined.bass += preset.bass;
        combined.mid += preset.mid;
        combined.treble += preset.treble;
        combined.reverb = Math.min(1, combined.reverb + preset.reverb); // Cap at 1
        combined.echo = Math.min(1, combined.echo + preset.echo);
        combined.pitch += preset.pitch;
        combined.speed *= preset.speed; // Multiply speeds
        combined.bitcrush = Math.min(1, combined.bitcrush + preset.bitcrush);
        combined.distortion = Math.min(1, combined.distortion + preset.distortion);
      }
    });
    
    // Clamp values to reasonable ranges
    combined.bass = Math.max(-15, Math.min(15, combined.bass));
    combined.mid = Math.max(-15, Math.min(15, combined.mid));
    combined.treble = Math.max(-15, Math.min(15, combined.treble));
    combined.speed = Math.max(0.5, Math.min(2.0, combined.speed));
    
    return combined;
  },
  
  getActivePresetEffects: () => {
    const state = get();
    return state.getPresetById(state.activePreset);
  }
}));

export default useAudioEffectsStore;
