import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import usePlayerStore from '../../stores/playerStore';
import { useRoleStore } from '../../stores/roleStore';
import useDJStore from '../../stores/djStore';
import SettingsModal from '../modals/SettingsModal';
import DJPanel from '../dj/DJPanel';

// Add Safari-specific styles
const SafariStyles = () => (
  <style>
    {`
      /* Range input styling for all browsers including Safari */
      input[type='range'] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
      }
      
      /* Chrome, Safari, Edge */
      input[type='range']::-webkit-slider-runnable-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        height: 4px;
      }
      
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        background: rgb(6, 182, 212);
        border: 2px solid rgb(6, 182, 212);
        border-radius: 50%;
        cursor: pointer;
        height: 14px;
        width: 14px;
        margin-top: -5px;
        box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
      }
      
      /* Firefox */
      input[type='range']::-moz-range-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        height: 4px;
      }
      
      input[type='range']::-moz-range-thumb {
        background: rgb(6, 182, 212);
        border: 2px solid rgb(6, 182, 212);
        border-radius: 50%;
        cursor: pointer;
        height: 14px;
        width: 14px;
        box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
      }
      
      /* Volume slider specific styling */
      input[type='range'].volume-slider {
        height: 4px;
      }
      
      input[type='range'].volume-slider::-webkit-slider-runnable-track {
        background: linear-gradient(
          to right,
          rgb(6, 182, 212) 0%,
          rgb(6, 182, 212) var(--volume, 0%),
          rgba(255, 255, 255, 0.2) var(--volume, 0%),
          rgba(255, 255, 255, 0.2) 100%
        );
        height: 4px;
      }
      
      input[type='range'].volume-slider::-webkit-slider-thumb {
        background: rgb(6, 182, 212);
        border-color: rgb(6, 182, 212);
        height: 14px;
        width: 14px;
        margin-top: -5px;
      }
      
      input[type='range'].volume-slider::-moz-range-track {
        background: linear-gradient(
          to right,
          rgb(6, 182, 212) 0%,
          rgb(6, 182, 212) var(--volume, 0%),
          rgba(255, 255, 255, 0.2) var(--volume, 0%),
          rgba(255, 255, 255, 0.2) 100%
        );
        height: 4px;
      }
      
      input[type='range'].volume-slider::-moz-range-thumb {
        background: rgb(6, 182, 212);
        border-color: rgb(6, 182, 212);
        height: 14px;
        width: 14px;
      }
      
      /* Progress bar specific styling */
      input[type='range'].progress-bar::-webkit-slider-runnable-track {
        background: linear-gradient(
          to right,
          rgb(6, 182, 212) 0%,
          rgb(6, 182, 212) var(--progress, 0%),
          rgba(255, 255, 255, 0.2) var(--progress, 0%),
          rgba(255, 255, 255, 0.2) 100%
        );
      }
      
      input[type='range'].progress-bar::-moz-range-track {
        background: linear-gradient(
          to right,
          rgb(6, 182, 212) 0%,
          rgb(6, 182, 212) var(--progress, 0%),
          rgba(255, 255, 255, 0.2) var(--progress, 0%),
          rgba(255, 255, 255, 0.2) 100%
        );
      }
    `}
  </style>
);

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function FloatingDock() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    isPlaying,
    currentSong,
    volume,
    currentTime,
    duration,
    playerInstance,
    setVolume,
    setCurrentTime,
    setDuration,
    playPause,
    skipSong,
    previousSong,
  } = usePlayerStore();

  const { isDJModeEnabled, togglePanel } = useDJStore();

  const userRole = useRoleStore(state => state.userRole) || '';
  const canControl = userRole === 'host' || userRole === 'subhost';

  // Update current time continuously
  useEffect(() => {
    let interval;
    if (playerInstance && isPlaying) {
      interval = setInterval(() => {
        try {
          const time = playerInstance.getCurrentTime?.() || 0;
          const dur = playerInstance.getDuration?.() || 0;
          setCurrentTime(time);
          setDuration(dur);
        } catch (e) {
          console.error('Error fetching player time:', e);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playerInstance, isPlaying, setCurrentTime, setDuration]);

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (playerInstance && playerInstance.seekTo) {
      playerInstance.seekTo(seekTime);
    }
  };

  const handlePlayPause = () => {
    if (!canControl) return;
    playPause();
  };

  const handleSkip = () => {
    if (!canControl) return;
    skipSong();
  };

  const handlePrevious = () => {
    if (!canControl) return;
    previousSong();
  };

  return (
    <>
      <SafariStyles />
      <div className="sticky bottom-0 z-50 bg-gradient-to-b from-black/80 to-black">
        <div className="flex flex-col space-y-2 px-4 py-2 backdrop-blur-lg">

          {/* Top: Track Info + Controls */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {currentSong ? (
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1 overflow-hidden">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-lg border border-white/10">
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {!canControl && currentSong && (
                    <div className="absolute -top-2 -right-2 hidden md:block">
                      {isPlaying ? (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow-lg border border-white/20">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span className="font-medium">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs px-3 py-1 rounded-full shadow-lg border border-white/20">
                          <div className="w-2 h-2 rounded-full bg-white/80" />
                          <span className="font-medium">Paused</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 md:gap-1 truncate min-w-0 flex-1">
                  <span className="text-white font-medium text-sm md:text-base truncate">{currentSong.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs md:text-sm truncate font-medium">{currentSong.artist}</span>
                    {!canControl && currentSong && (
                      <span className="hidden md:inline text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 border border-indigo-500/30 font-medium whitespace-nowrap">
                        {isPlaying ? 'Live with host' : 'Synced with host'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/60">No track playing</div>
            )}

            {/* Playback Controls */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {canControl && (
                <button onClick={handlePrevious} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full settings-button" title="Previous">
                  <BackwardIcon className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                </button>
              )}

              <button
                onClick={handlePlayPause}
                className={`p-2 md:p-3 rounded-full transition-colors ${
                  canControl ? 'bg-cyan-500/20 hover:bg-cyan-500/30' : 'bg-gray-500/20'
                }`}
                disabled={!canControl}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <PauseIcon className={`w-6 h-6 md:w-8 md:h-8 ${canControl ? 'text-cyan-500' : 'text-gray-500'}`} />
                ) : (
                  <PlayIcon className={`w-6 h-6 md:w-8 md:h-8 ${canControl ? 'text-cyan-500' : 'text-gray-500'}`} />
                )}
              </button>

              {canControl && (
                <button onClick={handleSkip} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full" title="Skip">
                  <ForwardIcon className="w-5 h-5 md:w-6 md:h-6 text-cyan-500"  />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {currentSong && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/60">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 rounded-lg accent-cyan-500 progress-bar"
                style={{
                  '--progress': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                }}
              />
              <span className="text-xs text-white/60">{formatTime(duration)}</span>
            </div>
          )}

          {/* Bottom: Volume, Crossfade, Settings, Chat */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <SpeakerWaveIcon className="w-5 h-5 text-white/60" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24 volume-slider"
                style={{
                  '--volume': `${volume}%`
                }}
              />
            </div>

            {canControl && (
              <>
                {/* <button
                  onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    crossfadeEnabled ? 'bg-cyan-500/20 text-cyan-500' : 'text-white/60 hover:bg-white/10'
                  }`}
                  title="Toggle Crossfade"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button> */}

                <button
                  onClick={togglePanel}
                  className={`p-2 rounded-full transition-colors ${
                    isDJModeEnabled ? 'bg-purple-500/20 text-purple-500' : 'text-white/60 hover:bg-white/10'
                  }`}
                  title="DJ Mode"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-white/60 hover:bg-white/10 rounded-full transition-colors"
                  title="Settings"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      <DJPanel />
    </>
  );
}