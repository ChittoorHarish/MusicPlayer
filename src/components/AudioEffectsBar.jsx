// AudioEffectsBar.jsx - UI for switching audio effect presets
import React from 'react';
import useAudioEffectsStore from '../stores/audioEffectsStore';
import { applyAudioEffects } from '../services/audioEffectsEngine';
import usePlayerStore from '../stores/playerStore';
import toast from 'react-hot-toast';

const AudioEffectsBar = () => {
  const { effectPresets, activePreset, setActivePreset, getPresetById } = useAudioEffectsStore();
  const playerInstance = usePlayerStore(state => state.playerInstance);
  const currentSong = usePlayerStore(state => state.currentSong);

  const handlePresetChange = (presetId) => {
    const preset = getPresetById(presetId);
    
    // Only works with local audio files
    if (currentSong?.source !== 'local') {
      toast.error('Audio effects only work with uploaded local files!', {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }
    
    setActivePreset(presetId);
    
    // Apply effects
    const { speed } = applyAudioEffects(preset, presetId);
    
    // Update playback speed if player instance exists
    if (playerInstance && playerInstance.setPlaybackRate) {
      playerInstance.setPlaybackRate(speed);
    }
    
    toast.success(`${preset.icon} ${preset.name} effect applied!`, {
      duration: 2000,
    });
  };

  return (
    <div className="w-full py-3 px-4 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {effectPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`
                relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                ${activePreset === preset.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="mr-1">{preset.icon}</span>
              <span>{preset.name}</span>
              {activePreset === preset.id && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        
        {currentSong?.source !== 'local' && (
          <div className="mt-2 text-center">
            <p className="text-xs text-orange-400">
              💡 Upload local MP3 files to use audio effects
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioEffectsBar;
