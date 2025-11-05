import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';

export default function Player() {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const { 
    setIsPlaying, 
    currentSong, 
    setCurrentSong,
  } = usePlayerStore();
  const queue = useQueueStore(state => state.queue);
  
  // Start playing first song in queue if none is playing
  useEffect(() => {
    if (!currentSong && queue.length > 0) {
      setCurrentSong(queue[0]);
    }
  }, [queue, currentSong, setCurrentSong]);

  // Update video ID when current song changes
  useEffect(() => {
    if (currentSong) {
      console.log('Current song changed to:', currentSong.title);
      setCurrentVideoId(currentSong.id);
      setIsPlaying(true); // Ensure we're in playing state when song changes
    }
  }, [currentSong, setIsPlaying]);

  const handleStateChange = (event) => {
    const state = event.data;
    console.log('YouTube state changed:', state);
    
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (state === 1) {
      setIsPlaying(true);
    } else if (state === 2) {
      setIsPlaying(false);
    }
    
    // When current song ends (state === 0), play next song in queue
    if (state === 0) {
      console.log('Song ended, checking for next song...');
      console.log('Current queue:', queue);
      console.log('Current song:', currentSong);
      
      if (queue.length > 0 && currentSong) {
        const currentIndex = queue.findIndex(song => song.id === currentSong.id);
        console.log('Current index in queue:', currentIndex);
        
        if (currentIndex !== -1 && currentIndex < queue.length - 1) {
          const nextSong = queue[currentIndex + 1];
          console.log('Found next song:', nextSong);
          setCurrentSong(nextSong);
          setIsPlaying(true);
        }
      }
    }
  };

  const handleError = (error) => {
    console.error('YouTube Player Error:', error);
    // Skip to next song on error
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(song => song.id === currentSong?.id);
      const nextSong = queue[currentIndex + 1];
      if (nextSong) {
        setCurrentSong(nextSong);
      }
    }
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