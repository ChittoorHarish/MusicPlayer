// LocalAudioPlayer.jsx - Play local audio files with full effects support
import React, { useEffect, useRef } from 'react';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';
import { useRoleStore } from '../stores/roleStore';
import { connectAudioSource } from '../services/audioEffectsEngine';

const LocalAudioPlayer = ({ fileUrl, trackId, onStateChange, onError }) => {
  const audioRef = useRef(null);
  const audioSourceConnectedRef = useRef(false); // Track if source is connected
  const loadingTimeoutRef = useRef(null);

  const { 
    setDuration, 
    setCurrentTime, 
    volume, 
    isPlaying,
    setPlayerInstance,
    skipSong,
    setIsPlaying,
  } = usePlayerStore();
  
  const userRole = useRoleStore(state => state.userRole);
  const queue = useQueueStore(state => state.queue);

  // Connect audio element to Web Audio API effects (only once)
  useEffect(() => {
    if (!audioRef.current || !fileUrl || audioSourceConnectedRef.current) {
      if (audioSourceConnectedRef.current) {
        console.log('ℹ️ Audio source already connected, skipping');
      }
      return;
    }

    console.log('🎵 LocalAudioPlayer: Setting up audio with fileUrl:', fileUrl);
    console.log('🎵 LocalAudioPlayer: audioRef.current exists:', !!audioRef.current);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        if (audioRef.current && !audioSourceConnectedRef.current) {
          console.log('🎵 LocalAudioPlayer: Calling connectAudioSource...');
          const connected = connectAudioSource(audioRef.current);
          console.log('🎵 LocalAudioPlayer: connectAudioSource returned:', connected);
          
          if (connected) {
            audioSourceConnectedRef.current = true;
            console.log('✅ Local audio connected to effects chain');
          } else {
            console.warn('⚠️ Failed to connect audio source, audio will play without effects');
            // Audio will still play through normal output
          }
        }
      } catch (error) {
        console.error('❌ Failed to connect local audio to effects:', error);
        console.error('Error stack:', error.stack);
        console.warn('⚠️ Audio will play without effects');
        // Don't block playback - audio will work without effects
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [fileUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !fileUrl) return;

    console.log('🎵 LocalAudioPlayer: isPlaying changed to:', isPlaying);

    if (isPlaying) {
      // Resume audio context if suspended (browser autoplay policy)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio playback started successfully');
          })
          .catch(error => {
            console.error('❌ Playback failed:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // Try to resume audio context and retry
            if (error.name === 'NotAllowedError') {
              console.warn('⚠️ Playback blocked by browser. User interaction may be required.');
            }
            setIsPlaying(false);
          });
      }
    } else {
      audioRef.current.pause();
      console.log('⏸️ Audio paused');
    }
  }, [isPlaying, fileUrl, setIsPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Set up player instance for external control
  useEffect(() => {
    if (audioRef.current && fileUrl) {
      const playerInstance = {
        play: () => audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        seekTo: (seconds) => {
          if (audioRef.current) {
            audioRef.current.currentTime = seconds;
          }
        },
        getCurrentTime: () => audioRef.current?.currentTime || 0,
        getDuration: () => audioRef.current?.duration || 0,
        setVolume: (vol) => {
          if (audioRef.current) {
            audioRef.current.volume = vol / 100;
          }
        },
        setPlaybackRate: (rate) => {
          if (audioRef.current) {
            audioRef.current.playbackRate = rate;
          }
        }
      };
      
      setPlayerInstance(playerInstance);
    }

    return () => setPlayerInstance(null);
  }, [setPlayerInstance, fileUrl]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    console.log('✅ handleLoadedMetadata called');
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setDuration(duration);
      console.log('✅ Local audio loaded, duration:', duration);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  };

  // Set loading timeout
  useEffect(() => {
    console.log('🎵 LocalAudioPlayer mounted with fileUrl:', fileUrl);
    
    // Fallback: clear timeout after 3 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('✅ Audio loading timeout cleared');
    }, 3000);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [fileUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (onStateChange) {
      onStateChange({ data: 1 }); // Playing state
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onStateChange) {
      onStateChange({ data: 2 }); // Paused state
    }
  };

  const handleEnded = () => {
    console.log('Local audio track ended');
    setIsPlaying(false);
    
    if (onStateChange) {
      onStateChange({ data: 0 }); // Ended state
    }

    // Auto-skip to next song if host/subhost
    if (userRole === 'host' || userRole === 'subhost') {
      const currentIndex = queue.findIndex(song => song.id === trackId);
      if (currentIndex < queue.length - 1) {
        setTimeout(() => {
          skipSong();
        }, 500);
      }
    }
  };

  const handleError = (e) => {
    console.error('❌ Local audio playback error:', e);
    console.error('Error details:', {
      code: e.target?.error?.code,
      message: e.target?.error?.message,
      src: e.target?.src
    });
    if (onError) {
      onError(e);
    }
  };

  const handleCanPlay = () => {
    console.log('✅ handleCanPlay called - audio is ready');
  };

  const handleLoadStart = () => {
    console.log('🎵 handleLoadStart - audio started loading');
  };

  const handleLoadedData = () => {
    console.log('✅ handleLoadedData - first frame loaded');
  };

  return (
    <div className="local-audio-player w-full">
      {/* Audio element - hidden, controlled by FloatingDock */}
      <audio
        ref={audioRef}
        src={fileUrl}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Visual feedback - shows when local audio is active */}
      <div className="flex items-center justify-center space-x-2 py-2 text-xs text-green-400">
        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span className="font-medium">Local Audio {audioSourceConnectedRef.current ? '• Effects Active ✨' : '• Loading Effects...'}</span>
      </div>
    </div>
  );
};

export default LocalAudioPlayer;
