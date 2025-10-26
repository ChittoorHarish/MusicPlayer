import React from 'react';
import { PauseIcon, PlayIcon, ForwardIcon, SpeakerWaveIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import useStore from '../store';

export default function Controls() {
  const { 
    isPlaying,
    currentSong,
    volume,
    crossfadeEnabled,
    setIsPlaying,
    setVolume,
    setCrossfadeEnabled,
    skipSong 
  } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Now Playing */}
        <div className="flex items-center space-x-4">
          {currentSong && (
            <>
              <img 
                src={currentSong.thumbnail} 
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-white font-medium">{currentSong.title}</span>
                <span className="text-white/60 text-sm">{currentSong.artist}</span>
              </div>
            </>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8 text-white" />
            ) : (
              <PlayIcon className="w-8 h-8 text-white" />
            )}
          </button>

          <button
            onClick={skipSong}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ForwardIcon className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Volume & Settings */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SpeakerWaveIcon className="w-5 h-5 text-white" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-24"
            />
          </div>

          <button
            onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
            className={`p-2 rounded-full transition-colors ${
              crossfadeEnabled ? 'bg-purple-500/20 text-purple-500' : 'text-white/60 hover:bg-white/10'
            }`}
            title="Toggle Crossfade"
          >
            <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}