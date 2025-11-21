// LocalMusicPage.jsx - Dedicated page for local MP3 upload and effects
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import FileUploadSearch from '../components/FileUploadSearch';
import AudioEffectsBar from '../components/AudioEffectsBar';
import FloatingDock from '../components/player/FloatingDock';
import SidePanel from '../components/SidePanel';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';
import { useRoleStore } from '../stores/roleStore';

export default function LocalMusicPage() {
  const navigate = useNavigate();
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const addToQueue = useQueueStore((state) => state.addToQueue);
  const { role, userId } = useRoleStore();

  const handleFileSelect = (file) => {
    const addedBy = role === "host" ? "host" : "guest";
    const songToAdd = {
      ...file,
      addedBy,
      addedById: userId,
      addedAt: Date.now(),
    };

    addToQueue(songToAdd, addedBy);
    
    // Auto-play local files immediately
    setCurrentSong(songToAdd);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <div className="xl:pr-80 transition-all duration-300">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Main Page</span>
            </button>
          </div>
        </div>

        {/* Audio Effects Bar - Only shown on this page */}
        <AudioEffectsBar />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2">
              Local Music Studio
            </h1>
            <p className="text-white/60">
              Upload your MP3 files and transform them with real-time audio effects
            </p>
          </div>

          {/* File Upload Section */}
          <FileUploadSearch onResultSelect={handleFileSelect} />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-6 bg-white/5 rounded-lg border border-green-500/20">
              <div className="text-3xl mb-2">🎵</div>
              <h3 className="font-semibold mb-1">Upload Local Files</h3>
              <p className="text-sm text-white/60">
                Support for MP3, WAV, OGG, M4A formats
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-purple-500/20">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">10 Audio Effects</h3>
              <p className="text-sm text-white/60">
                Lo-Fi, EDM, Bass Boost, 8D Audio, Nightcore & more
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-cyan-500/20">
              <div className="text-3xl mb-2">🎚️</div>
              <h3 className="font-semibold mb-1">Real-Time Processing</h3>
              <p className="text-sm text-white/60">
                Instant audio transformation using Web Audio API
              </p>
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="fixed bottom-0 inset-x-0 z-10 xl:right-80 pb-[env(safe-area-inset-bottom)]">
          <FloatingDock />
        </div>
      </div>

      {/* Desktop Side Panel */}
      <div className="hidden xl:block">
        <SidePanel />
      </div>

      {/* Mobile & Tablet Side Panel */}
      <div className="xl:hidden fixed top-0 right-0 bottom-0 w-full max-w-[320px] transform translate-x-full transition-transform duration-300 z-[100] mobile-side-panel bg-gray-900/95 backdrop-blur-lg flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SidePanel isMobile={true} />
        </div>

        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
          <button
            className="w-full py-3 px-6 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-center gap-2 backdrop-blur-sm"
            onClick={() => {
              const panel = document.querySelector(".mobile-side-panel");
              panel?.classList.add("translate-x-full");
            }}
            aria-label="Close Menu"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Close</span>
          </button>
        </div>
        
        <div className="h-[env(safe-area-inset-bottom)] bg-gray-900" />
      </div>
    </div>
  );
}
