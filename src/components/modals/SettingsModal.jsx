import React from 'react';
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
import usePlayerStore from '../../stores/playerStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    volume,
    setVolume,
    crossfadeEnabled,
    setCrossfadeEnabled,
  } = usePlayerStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cog6ToothIcon className="w-6 h-6" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm">Volume</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white/60 w-12 text-right">{volume}%</span>
            </div>
          </div>

          {/* Crossfade Toggle */}
          {/* <div className="flex items-center justify-between">
            <label className="text-white/80">Crossfade between songs</label>
            <button
              onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                crossfadeEnabled ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform ${
                  crossfadeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;