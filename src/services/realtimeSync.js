// realtimeSync.js
import usePlayerStore from '../stores/playerStore';
import useEventStore from '../stores/eventStore';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const setupRealtimeSync = () => {
  const db = getDatabase();
  const eventData = useEventStore.getState().eventData;
  const playerStore = usePlayerStore.getState();

  if (!eventData?.id) return;

  // Reference to the event's player state
  const playerStateRef = ref(db, `events/${eventData.id}/playerState`);

  // Listen for remote player state changes
  onValue(playerStateRef, (snapshot) => {
    const remoteState = snapshot.val();
    if (!remoteState) return;

    const userRole = eventData.userRole;
    
    // If we're a guest, update our local state
    if (userRole !== 'host') {
      usePlayerStore.setState({
        currentSong: remoteState.currentSong,
        isPlaying: remoteState.isPlaying,
        currentTime: remoteState.currentTime
      });

      // Sync YouTube player if it exists
      const player = playerStore.playerInstance;
      if (player) {
        if (remoteState.isPlaying) {
          player.playVideo();
          // Sync time with a small buffer to account for network delay
          const timeDiff = Math.abs(player.getCurrentTime() - remoteState.currentTime);
          if (timeDiff > 2) {
            player.seekTo(remoteState.currentTime);
          }
        } else {
          player.pauseVideo();
        }
      }
    }
  });

  // Update remote state when host makes changes
  const updateRemoteState = () => {
    if (eventData.userRole === 'host') {
      const state = usePlayerStore.getState();
      set(playerStateRef, {
        currentSong: state.currentSong,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
        lastUpdated: Date.now()
      });
    }
  };

  return updateRemoteState;
};

export default setupRealtimeSync;