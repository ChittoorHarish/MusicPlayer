// localSync.js
import usePlayerStore from '../stores/playerStore';
import useEventStore from '../stores/eventStore';
import { useRoleStore } from '../stores/roleStore';

const LOCAL_STORAGE_KEY = 'musicplayer_state';

const setupLocalSync = () => {
  const eventData = useEventStore.getState().eventData;
  const userRole = useRoleStore.getState().userRole;

  // Setup storage event listener for guests
  if (userRole !== 'host') {
    // First, immediately sync with current state when joining
    const initialState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (initialState) {
      try {
        const remoteState = JSON.parse(initialState);
        if (remoteState && remoteState.eventId === eventData?.id) {
          // Calculate time adjustment for sync
          const timeSinceUpdate = (Date.now() - remoteState.timestamp) / 1000;
          const adjustedTime = remoteState.currentTime + (remoteState.isPlaying ? timeSinceUpdate : 0);

          // Update store state immediately on join
          usePlayerStore.setState({
            currentSong: remoteState.currentSong,
            isPlaying: remoteState.isPlaying,
            currentTime: adjustedTime
          });
        }
      } catch (error) {
        console.error('Error syncing initial state:', error);
      }
    }

    // Then setup listener for future changes
    window.addEventListener('storage', (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        const remoteState = JSON.parse(e.newValue);
        if (!remoteState || remoteState.eventId !== eventData?.id) return;

        const playerStore = usePlayerStore.getState();
        const player = playerStore.playerInstance;

        // Calculate time adjustment for sync
        const timeSinceUpdate = (Date.now() - remoteState.timestamp) / 1000;
        const adjustedTime = remoteState.currentTime + (remoteState.isPlaying ? timeSinceUpdate : 0);

        // Update store state
        usePlayerStore.setState({
          currentSong: remoteState.currentSong,
          isPlaying: remoteState.isPlaying,
          currentTime: adjustedTime
        });

        // Sync YouTube player with time compensation
        if (player) {
          if (remoteState.currentSong?.id !== playerStore.currentSong?.id) {
            // If it's a different song, load or cue based on isPlaying state
            if (remoteState.isPlaying) {
              player.loadVideoById({
                videoId: remoteState.currentSong.id,
                startSeconds: adjustedTime
              });
            } else {
              player.cueVideoById({
                videoId: remoteState.currentSong.id,
                startSeconds: adjustedTime
              });
            }
          } else if (remoteState.isPlaying) {
            // If same song, just seek and play
            player.seekTo(adjustedTime);
            player.playVideo();
          } else {
            // Same song but paused
            player.seekTo(adjustedTime);
            player.pauseVideo();
          }
        }
      }
    });
  }

  // Function to update local storage (called by host)
  const updateLocalState = () => {
    if (userRole === 'host' && eventData?.id) {
      const state = usePlayerStore.getState();
      const player = state.playerInstance;
      
      // Get the most current time from the player
      const currentTime = player?.getCurrentTime?.() || state.currentTime;
      
      const syncData = {
        eventId: eventData.id,
        currentSong: state.currentSong,
        isPlaying: state.isPlaying,
        currentTime: currentTime,
        timestamp: Date.now()
      };
      
      // Immediate local storage update
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(syncData));
      
      // Force storage event for same-tab listeners
      window.dispatchEvent(new StorageEvent('storage', {
        key: LOCAL_STORAGE_KEY,
        newValue: JSON.stringify(syncData)
      }));
    }
  };

  return updateLocalState;
};

export default setupLocalSync;