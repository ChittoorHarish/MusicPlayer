// YouTubePlayer.jsx (updated handler)
import React, { useEffect, useRef } from 'react';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';
import { useRoleStore } from '../stores/roleStore';

const YouTubePlayer = ({ videoId, onStateChange, onError, isVideo = false }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const frameRef = useRef(null);
  const isPlayerReadyRef = useRef(false);

  const { 
    setDuration, 
    setCurrentTime, 
    volume, 
    isPlaying,
    setPlayerInstance,
    skipSong,
    setIsPlaying,
    setCurrentSong,
  } = usePlayerStore();
  
  const userRole = useRoleStore(state => state.userRole);

  const queue = useQueueStore(state => state.queue);

  const setPlayerInstanceRef = useRef(setPlayerInstance);
  const setDurationRef = useRef(setDuration);
  const setCurrentTimeRef = useRef(setCurrentTime);
  const skipSongRef = useRef(skipSong);
  const setIsPlayingRef = useRef(setIsPlaying);
  const setCurrentSongRef = useRef(setCurrentSong);

  // Keep refs synced
  useEffect(() => {
    setPlayerInstanceRef.current = setPlayerInstance;
    setDurationRef.current = setDuration;
    setCurrentTimeRef.current = setCurrentTime;
    skipSongRef.current = skipSong;
    setIsPlayingRef.current = setIsPlaying;
    setCurrentSongRef.current = setCurrentSong;
  }, [setPlayerInstance, setDuration, setCurrentTime, skipSong, setIsPlaying, setCurrentSong]);

  const safePlayerCall = (methodName, ...args) => {
    const player = playerRef.current;
    if (player && isPlayerReadyRef.current && typeof player[methodName] === 'function') {
      try {
        return player[methodName](...args);
      } catch (err) {
        console.warn(`Failed to call ${methodName}:`, err);
      }
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const createPlayer = () => {
      if (!containerRef.current || playerRef.current || !isMounted) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            console.log('YouTube player ready');
            isPlayerReadyRef.current = true;

            try {
              event.target.setVolume(volume);
              setPlayerInstanceRef.current(event.target);

              const dur = event.target.getDuration?.();
              if (dur) setDurationRef.current(dur);

              // Only auto-play if isPlaying is true in the store
              const currentIsPlaying = usePlayerStore.getState().isPlaying;
              if (currentIsPlaying) {
                event.target.playVideo();
              } else {
                // Cue the video but don't play it
                event.target.cueVideoById(videoId);
              }
            } catch (err) {
              console.warn('Error initializing player:', err);
            }
          },
          // Make the handler async to await skipSong which can fetch recommendations
          onStateChange: async (event) => {
            if (!isMounted) return;
            onStateChange?.(event);

            // ✅ Detect when current song ends
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log('Song ended — attempting to play next song');

              try {
                // First check if we're already at the end of the queue
                const store = usePlayerStore.getState();
                const queue = useQueueStore.getState().queue;
                const currentIndex = queue.findIndex(s => s.id === store.currentSong?.id);
                const isLastSong = currentIndex === queue.length - 1;

                // Try to skip to next song
                const nextPlayed = await skipSongRef.current();

                if (!nextPlayed) {
                  console.log('No more songs in queue and no recommendation found — stopping playback');
                  setIsPlayingRef.current(false);
                  return;
                }

                // Get fresh state after skip
                const freshState = usePlayerStore.getState();
                if (freshState.currentSong?.id) {
                  console.log('Loading next song:', freshState.currentSong.title, 
                            isLastSong ? '(auto-recommended)' : '(from queue)');
                  
                  // Reset player state before loading new video
                  safePlayerCall('stopVideo');
                  await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
                  
                  safePlayerCall('loadVideoById', freshState.currentSong.id);
                  safePlayerCall('playVideo');
                  setIsPlayingRef.current(true);
                }
              } catch (err) {
                console.error('Error during skip/recommendation flow:', err);
                setIsPlayingRef.current(false);
              }
            }
          },
          onError: (event) => {
            if (!isMounted) return;
            console.error('YouTube player error:', event);
            onError?.(event);
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      isMounted = false;
      isPlayerReadyRef.current = false;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);

      try {
        playerRef.current?.destroy();
      } catch (err) {
        console.warn('Error destroying player:', err);
      }
      playerRef.current = null;
    };
  }, []); // run once

  // Track current time
  useEffect(() => {
    const updateTime = () => {
      if (isPlayerReadyRef.current && isPlaying) {
        const time = safePlayerCall('getCurrentTime');
        if (time != null) setCurrentTimeRef.current(time);
        frameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(updateTime);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying]);

  // Volume updates
  useEffect(() => {
    if (isPlayerReadyRef.current) safePlayerCall('setVolume', volume);
  }, [volume]);

  // Load new video when videoId changes
  useEffect(() => {
    if (isPlayerReadyRef.current && videoId) {
      const currentIsPlaying = usePlayerStore.getState().isPlaying;
      if (currentIsPlaying) {
        safePlayerCall('loadVideoById', videoId);
      } else {
        safePlayerCall('cueVideoById', videoId);
      }
    }
  }, [videoId]);
  
  // Handle play/pause state changes
  useEffect(() => {
    if (isPlayerReadyRef.current) {
      if (isPlaying) {
        safePlayerCall('playVideo');
      } else {
        safePlayerCall('pauseVideo');
      }
    }
  }, [isPlaying]);

  return <div ref={containerRef} />;
};

export default YouTubePlayer;
