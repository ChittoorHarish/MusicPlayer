import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import usePlayerStore from '../../stores/playerStore';
import { useRoleStore } from '../../stores/roleStore';
import SettingsModal from '../modals/SettingsModal';

// Add Safari-specific styles
const SafariStyles = () => (
  <style>
    {`
      /* Progress bar and range input styling for Safari */
      @media not all and (min-resolution:.001dpcm) { 
        @supports (-webkit-appearance:none) {
          input[type='range'] {
            -webkit-appearance: none;
            background: transparent;
          }
          
          input[type='range']::-webkit-slider-runnable-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            height: 4px;
          }
          
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            background: rgb(6, 182, 212);
            border: 2px solid rgb(6, 182, 212);
            border-radius: 50%;
            cursor: pointer;
            height: 12px;
            margin-top: -4px;
            width: 12px;
          }
          
          /* Volume slider specific styling */
          input[type='range'].volume-slider::-webkit-slider-thumb {
            background: rgb(6, 182, 212);
            border-color: rgb(6, 182, 212);
          }
          
          /* Settings button color */
          .settings-button {
            color: rgb(6, 182, 212);
          }
          
          /* Progress bar color */
          .progress-bar {
            background: rgb(6, 182, 212);
          }
        }
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
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    isPlaying,
    currentSong,
    volume,
    crossfadeEnabled,
    currentTime,
    duration,
    playerInstance,
    setVolume,
    setCrossfadeEnabled,
    setCurrentTime,
    setDuration,
    playPause,
    skipSong,
    previousSong,
  } = usePlayerStore();

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
          {/* <div className="flex items-center justify-between"> */}
          <div className="flex items-center justify-between flex-wrap gap-3 min-w-0">
            {currentSong ? (
              // <div className="flex items-center space-x-4 max-w-[300px]">
              <div className="flex items-center space-x-3 min-w-0 max-w-[55vw] sm:max-w-[300px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg border border-white/10">
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {!canControl && currentSong && (
                    <div className="absolute -top-2 -right-2">
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
                <div className="flex flex-col gap-1 truncate">
                  <span className="text-white font-medium text-base truncate">{currentSong.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm truncate font-medium">{currentSong.artist}</span>
                    {!canControl && currentSong && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 border border-indigo-500/30 font-medium whitespace-nowrap">
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
            {/* <div className="flex items-center space-x-4"> */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {canControl && (
                <button onClick={handlePrevious} className="p-2 hover:bg-white/10 rounded-full settings-button" title="Previous">
                  <BackwardIcon className="w-6 h-6 text-cyan-500" />
                </button>
              )}

              <button
                onClick={handlePlayPause}
                className={`p-3 rounded-full transition-colors ${
                  canControl ? 'bg-cyan-500/20 hover:bg-cyan-500/30' : 'bg-gray-500/20'
                }`}
                disabled={!canControl}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <PauseIcon className={`w-8 h-8 ${canControl ? 'text-cyan-500' : 'text-gray-500'}`} />
                ) : (
                  <PlayIcon className={`w-8 h-8 ${canControl ? 'text-cyan-500' : 'text-gray-500'}`} />
                )}
              </button>

              {canControl && (
                <button onClick={handleSkip} className="p-2 hover:bg-white/10 rounded-full" title="Skip">
                  <ForwardIcon className="w-6 h-6 text-cyan-500"  />
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
    </>
  );
}
