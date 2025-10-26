import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';

export default function Player() {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const { setIsPlaying, currentSong, setCurrentSong, skipSong } = usePlayerStore();
  const queue = useQueueStore((state) => state.queue);

  // Start playing first song in queue if none is playing
  useEffect(() => {
    if (!currentSong && queue.length > 0) {
      setCurrentSong(queue[0]);
    }
  }, [queue, currentSong, setCurrentSong]);

  // Update video ID when current song changes
  useEffect(() => {
    if (currentSong) {
      console.log('🎶 Now playing:', currentSong.title);
      setCurrentVideoId(currentSong.id);
      setIsPlaying(true);
    }
  }, [currentSong, setIsPlaying]);

  const handleStateChange = async (event) => {
    const state = event.data;
    const YT = window.YT?.PlayerState;

    if (state === YT.PLAYING) setIsPlaying(true);
    if (state === YT.PAUSED) setIsPlaying(false);

    // 🎵 When song ends
    if (state === YT.ENDED || state === 0) {
      console.log('⏭️ Song ended — attempting to play next or get recommendation...');
      const success = await skipSong();
      if (!success) {
        console.log('🛑 No songs or recommendations available — stopping playback.');
        setIsPlaying(false);
      }
    }
  };

  const handleError = async (error) => {
    console.error('⚠️ YouTube Player Error:', error);
    await skipSong();
  };

  return (
    <div style={{ display: 'none' }}>
      {currentVideoId && (
        <YouTubePlayer
          videoId={currentVideoId}
          onStateChange={handleStateChange}
          onError={handleError}
        />
      )}
    </div>
  );
}
