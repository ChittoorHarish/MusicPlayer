import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import LocalAudioPlayer from './LocalAudioPlayer';
import VideoPreviewModal from './modals/VideoPreviewModal';
import usePlayerStore from '../stores/playerStore';
import useQueueStore from '../stores/queueStore';
import { useRoleStore } from '../stores/roleStore';

export default function Player() {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { 
    setIsPlaying, 
    currentSong, 
    setCurrentSong,
  } = usePlayerStore();
  const queue = useQueueStore(state => state.queue);
  const userRole = useRoleStore(state => state.userRole);
  
  // Start playing first song in queue if none is playing
  useEffect(() => {
    if (!currentSong && queue.length > 0) {
      setCurrentSong(queue[0]);
    }
  }, [queue, currentSong, setCurrentSong]);

  // Update video ID when current song changes
  useEffect(() => {
    if (currentSong) {
      console.log('🎵 Player: Current song changed to:', currentSong.title);
      console.log('🎵 Player: Song source:', currentSong.source);
      console.log('🎵 Player: File URL:', currentSong.fileUrl);
      
      // Only set videoId for YouTube songs, not local files
      if (currentSong.source === 'local') {
        setCurrentVideoId(null); // Clear video ID for local files
      } else {
        setCurrentVideoId(currentSong.id);
      }
      
      if (currentSong.isVideo) {
        setIsPreviewOpen(true);
      }
      // Auto-play for host when song changes
      if (userRole === 'host' || userRole === 'subhost') {
        console.log('🎵 Player: Auto-playing (user is host/subhost)');
        setIsPlaying(true);
      }
    }
  }, [currentSong, setIsPlaying, userRole]);

  const handleStateChange = (event) => {
    // Handle both YouTube events and local audio events
    if (!event || event.data === undefined) return;
    
    const state = event.data;
    console.log('Player state changed:', state, 'Source:', currentSong?.source);
    
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
    console.error('Player Error:', error, 'Source:', currentSong?.source);
    
    // Don't skip if it's a local file error - let local player handle it
    if (currentSong?.source === 'local') {
      console.log('Local audio error, not auto-skipping');
      return;
    }
    
    // For YouTube errors, skip to next song
    console.log('YouTube error, attempting to skip to next song');
    if (queue.length > 0 && currentSong) {
      const currentIndex = queue.findIndex(song => song.id === currentSong.id);
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        const nextSong = queue[currentIndex + 1];
        console.log('Skipping to next song:', nextSong.title);
        setCurrentSong(nextSong);
        setIsPlaying(true);
      }
    }
  };

  // Debug: Log what player is being rendered
  useEffect(() => {
    if (currentVideoId && currentSong) {
      console.log('🎵 Player: Rendering', currentSong.source === 'local' ? 'LocalAudioPlayer' : 'YouTubePlayer');
    }
  }, [currentVideoId, currentSong]);

  return (
    <>
      {/* Local Audio Player - Only render when source is local */}
      {currentSong?.source === 'local' && currentSong?.fileUrl && (
        <div className="w-full my-4 px-4">
          <LocalAudioPlayer
            fileUrl={currentSong.fileUrl}
            trackId={currentSong.id}
            onStateChange={handleStateChange}
            onError={handleError}
          />
        </div>
      )}
      
      {/* YouTube Player - Only render when source is NOT local and videoId exists */}
      {currentVideoId && currentSong?.source !== 'local' && (
        <div className="hidden">
          <YouTubePlayer
            videoId={currentVideoId}
            onStateChange={handleStateChange}
            onError={handleError}
            isVideo={currentSong?.isVideo}
          />
        </div>
      )}
      {currentSong?.isVideo && isPreviewOpen && (
        <VideoPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          videoId={currentVideoId}
        />
      )}
    </>
  );
}