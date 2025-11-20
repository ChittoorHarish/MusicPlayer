import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { 
  MusicalNoteIcon, 
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon 
} from '@heroicons/react/24/outline';
import useDJStore from '../../stores/djStore';
import { updateEQ, updateFilter, playDJSound } from '../../services/audioContext';
import toast from 'react-hot-toast';

export default function DJPanel() {
  const { 
    isPanelOpen, 
    setPanelOpen, 
    eq, 
    setEQ, 
    filter, 
    setFilter,
    resetAll 
  } = useDJStore();

  const [localEQ, setLocalEQ] = useState(eq);
  const [localFilter, setLocalFilter] = useState(filter);

  useEffect(() => {
    setLocalEQ(eq);
  }, [eq]);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  if (!isPanelOpen) return null;

  const handleEQChange = (band, value) => {
    const numValue = parseFloat(value);
    setLocalEQ(prev => ({ ...prev, [band]: numValue }));
    setEQ(band, numValue);
    updateEQ(band, numValue);
  };

  const handleFilterChange = (key, value) => {
    const newFilter = { ...localFilter, [key]: key === 'frequency' ? parseInt(value) : value };
    setLocalFilter(newFilter);
    setFilter(newFilter);
    updateFilter(newFilter);
  };

  const handleReset = () => {
    resetAll();
    setLocalEQ({ bass: 0, mid: 0, treble: 0 });
    setLocalFilter({ type: 'none', frequency: 1000, q: 1 });
    updateEQ('bass', 0);
    updateEQ('mid', 0);
    updateEQ('treble', 0);
    updateFilter({ type: 'none', frequency: 1000, q: 1 });
    toast.success('DJ settings reset');
  };

  const handleDJSound = async (soundType) => {
    try {
      const soundUrl = `/sounds/${soundType}.mp3`;
      await playDJSound(soundUrl);
    } catch (error) {
      console.error('Error playing DJ sound:', error);
      toast.error('Sound effect not available');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-black border border-cyan-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/80 to-cyan-900/80 backdrop-blur-lg p-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DJ Control Panel</h2>
              <p className="text-xs text-cyan-300">Real-time audio effects</p>
            </div>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 3-Band Equalizer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MusicalNoteIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">3-Band Equalizer</h3>
            </div>

            {/* Bass */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-cyan-300">Bass</label>
                <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                  {localEQ.bass > 0 ? '+' : ''}{localEQ.bass.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={localEQ.bass}
                onChange={(e) => handleEQChange('bass', e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Mid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-purple-300">Mid</label>
                <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                  {localEQ.mid > 0 ? '+' : ''}{localEQ.mid.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={localEQ.mid}
                onChange={(e) => handleEQChange('mid', e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Treble */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-pink-300">Treble</label>
                <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                  {localEQ.treble > 0 ? '+' : ''}{localEQ.treble.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={localEQ.treble}
                onChange={(e) => handleEQChange('treble', e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <SpeakerWaveIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Audio Filter</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Filter Type</label>
              <select
                value={localFilter.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="none">None</option>
                <option value="lowpass">Low Pass</option>
                <option value="highpass">High Pass</option>
                <option value="bandpass">Band Pass</option>
              </select>
            </div>

            {localFilter.type !== 'none' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/80">Frequency</label>
                  <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                    {localFilter.frequency} Hz
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="20000"
                  step="10"
                  value={localFilter.frequency}
                  onChange={(e) => handleFilterChange('frequency', e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            )}
          </div>

          {/* DJ Sound Effects */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white">DJ Sound Effects</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDJSound('airhorn')}
                className="px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-lg text-white font-medium transition-all transform hover:scale-105"
              >
                🎺 Airhorn
              </button>
              <button
                onClick={() => handleDJSound('scratch')}
                className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg text-white font-medium transition-all transform hover:scale-105"
              >
                💿 Scratch
              </button>
              <button
                onClick={() => handleDJSound('drop')}
                className="px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg text-white font-medium transition-all transform hover:scale-105"
              >
                💥 Drop
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
