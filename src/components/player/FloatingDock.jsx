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
      <div className="sticky top-0 z-10 bg-gradient-to-b">
       <div className="flex flex-col space-y-2 ml-4 mr-4">
          {/* Top: Track Info + Controls */}
          <div className="flex items-center justify-between">
            {currentSong ? (
              <div className="flex items-center space-x-4 max-w-[300px]">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex flex-col truncate">
                  <span className="text-white font-medium truncate">{currentSong.title}</span>
                  <span className="text-white/60 text-sm truncate">{currentSong.artist}</span>
                </div>
              </div>
            ) : (
              <div className="text-white/60">No track playing</div>
            )}

            {/* Playback Controls */}
            <div className="flex items-center space-x-4">
              {canControl && (
                <button onClick={handlePrevious} className="p-2 hover:bg-white/10 rounded-full" title="Previous">
                  <BackwardIcon className="w-6 h-6 text-white/80" />
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
                  <ForwardIcon className="w-6 h-6 text-white/80" />
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
                className="flex-1 h-1 rounded-lg accent-cyan-500"
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
                className="w-24"
              />
            </div>

            {canControl && (
              <>
                <button
                  onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    crossfadeEnabled ? 'bg-cyan-500/20 text-cyan-500' : 'text-white/60 hover:bg-white/10'
                  }`}
                  title="Toggle Crossfade"
                >
                  <ArrowPathIcon className="w-5 h-5" />
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
    </>
  );
}
