// AudioEffectsBar.jsx - UI for mixing audio effect presets
import React from 'react';
import useAudioEffectsStore from '../stores/audioEffectsStore';
import { applyAudioEffects } from '../services/audioEffectsEngine';
import usePlayerStore from '../stores/playerStore';
import toast from 'react-hot-toast';

const AudioEffectsBar = () => {
  const { 
    effectPresets, 
    activeEffects, 
    toggleEffect, 
    isEffectActive, 
    getCombinedEffects 
  } = useAudioEffectsStore();
  const playerInstance = usePlayerStore(state => state.playerInstance);
  const currentSong = usePlayerStore(state => state.currentSong);

  const handleEffectToggle = (presetId) => {
    // Only works with local audio files
    if (currentSong?.source !== 'local') {
      toast.error('Audio effects only work with uploaded local files!', {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }
    
    const wasActive = isEffectActive(presetId);
    toggleEffect(presetId);
    
    // Get the combined effects after toggle
    const combinedEffects = getCombinedEffects();
    
    // Apply combined effects
    const { speed } = applyAudioEffects(combinedEffects, combinedEffects.id);
    
    // Update playback speed if player instance exists
    if (playerInstance && playerInstance.setPlaybackRate) {
      playerInstance.setPlaybackRate(speed);
    }
    
    // Show appropriate toast
    const preset = effectPresets.find(p => p.id === presetId);
    if (wasActive) {
      toast(`${preset.icon} ${preset.name} removed`, {
        duration: 1500,
        icon: '➖'
      });
    } else {
      toast.success(`${preset.icon} ${preset.name} added!`, {
        duration: 1500,
      });
    }
    
    // Show active effects count
    const activeCount = activeEffects.length + (wasActive ? 0 : 1);
    if (presetId !== 'original' && activeCount > 1) {
      setTimeout(() => {
        toast(`🎛️ ${activeCount} effects active`, {
          duration: 1000,
          icon: '🎚️'
        });
      }, 200);
    }
  };

  return (
    <div className="w-full py-3 px-4 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {effectPresets.map((preset) => {
            const isActive = isEffectActive(preset.id);
            return (
              <button
                key={preset.id}
                onClick={() => handleEffectToggle(preset.id)}
                className={`
                  relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105 ring-2 ring-purple-400/50'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105'
                  }
                `}
              >
                <span className="mr-1">{preset.icon}</span>
                <span>{preset.name}</span>
                {isActive && preset.id !== 'original' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Active effects indicator */}
        {activeEffects.length > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-purple-300 font-medium">
              🎛️ {activeEffects.length} effect{activeEffects.length > 1 ? 's' : ''} active • Click to toggle
            </p>
          </div>
        )}
        
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
