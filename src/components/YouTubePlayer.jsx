// YouTubePlayer.jsx (updated handler)
import React, { useEffect, useRef } from 'react';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';

const YouTubePlayer = ({ videoId, onStateChange, onError }) => {
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
          autoplay: 1,
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

              event.target.playVideo();
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
                const nextPlayed = await skipSongRef.current();
                if (!nextPlayed) {
                  console.log('No more songs in queue and no recommendation found — stopping playback');
                  setIsPlayingRef.current(false);
                  return;
                }

                // Get new current song after skip (might be a recommended one)
                const { currentSong } = usePlayerStore.getState();
                if (currentSong?.id) {
                  console.log('Loading next song:', currentSong.title);
                  safePlayerCall('loadVideoById', currentSong.id);
                  // ensure play
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
      safePlayerCall('loadVideoById', videoId);
    }
  }, [videoId]);

  return <div ref={containerRef} />;
};

export default YouTubePlayer;
