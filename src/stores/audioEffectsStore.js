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

const useAudioEffectsStore = create((set) => ({
  effectPresets,
  activePreset: 'original',
  
  setActivePreset: (presetId) => set({ activePreset: presetId }),
  
  getPresetById: (presetId) => {
    return effectPresets.find(preset => preset.id === presetId) || effectPresets[0];
  },
  
  getActivePresetEffects: () => {
    const state = useAudioEffectsStore.getState();
    return state.getPresetById(state.activePreset);
  }
}));

export default useAudioEffectsStore;
