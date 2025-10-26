// playerStore.js
import { create } from 'zustand';
import useQueueStore from './queueStore';
import { getRelatedVideos, getVideoDetails, searchVideos } from '../services/youtubeApi';

const usePlayerStore = create((set, get) => ({
  isPlaying: false,
  currentSong: null,
  volume: 100,
  currentTime: 0,
  duration: 0,
  crossfadeEnabled: false,
  playerInstance: null,

  // Track played songs and signatures
  playedSongs: [],               // IDs of played songs
  playedSignatures: new Set(),   // Normalized title+artist for duplicate detection
  playedArtists: new Map(),      // Track artist frequency to avoid repeats

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setCurrentSong: (song) =>
    set((state) => {
      if (song) {
        // Update played songs list (last 50)
        state.playedSongs.push(song.id);
        if (state.playedSongs.length > 50) state.playedSongs = state.playedSongs.slice(-50);

        // Track normalized title+artist signature
        const signature = `${song.title}-${song.artist}`.toLowerCase()
          .replace(/[\(\)\[\]\-–_:|]/g, '')
          .replace(/\b(hd|lyrics|letra|traducida|audio|video|cover|remix|version)\b/g, '')
          .trim();
        state.playedSignatures.add(signature);

        // Track artist frequency
        const artist = (song.artist || '').toLowerCase();
        state.playedArtists.set(artist, (state.playedArtists.get(artist) || 0) + 1);

        // Keep last 50 artists
        if (state.playedArtists.size > 50) {
          const entries = Array.from(state.playedArtists.entries());
          state.playedArtists = new Map(entries.slice(-50));
        }
      }
      return { currentSong: song, isPlaying: song ? true : state.isPlaying };
    }),

  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlayerInstance: (player) => set({ playerInstance: player }),
  toggleCrossfade: () => set((state) => ({ crossfadeEnabled: !state.crossfadeEnabled })),

  playPause: () => {
    const player = get().playerInstance;
    const isPlaying = get().isPlaying;
    if (player) {
      try {
        if (isPlaying) player.pauseVideo();
        else player.playVideo();
      } catch (error) {
        console.error('Error in playPause:', error);
      }
    }
  },

  // Helper: Calculate string similarity (0-1)
  calculateTitleSimilarity: (str1, str2) => {
    const a = str1.split(' ');
    const b = str2.split(' ');
    const intersection = a.filter(word => b.includes(word));
    const union = new Set([...a, ...b]);
    return intersection.length / union.size;
  },

  /**
   * Skip song or fetch new unique recommendation
   */
  skipSong: async () => {
    const { currentSong, setCurrentSong } = get();
    const { queue, addToQueue } = useQueueStore.getState();

    // 1️⃣ Next song in queue
    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const nextSong = queue[currentIndex + 1];
      if (nextSong) {
        setCurrentSong(nextSong);
        return true;
      }
    }

    if (!currentSong?.id) return false;

    try {
      // 2️⃣ Fetch related videos
      let related = [];
      try {
        related = await getRelatedVideos(currentSong.id, 20);
      } catch (err) {
        console.warn('getRelatedVideos failed, falling back to search:', err.message);
      }

      // fallback search
      if (!related || related.length === 0) {
        related = await searchVideos(currentSong.title || 'popular music', 20);
      }

      if (!related || related.length === 0) return false;

      // Normalize title+artist signature
      const normalize = (title, artist) =>
        `${title}-${artist}`.toLowerCase()
          .replace(/[\(\)\[\]\-–_:|]/g, '')
          .replace(/\b(hd|lyrics|letra|traducida|audio|video|cover|remix|version)\b/g, '')
          .trim();

      // Strict filtering
      const unplayed = related.filter((vid) => {
        const signature = normalize(vid.title, vid.channelTitle);
        const artist = (vid.channelTitle || '').toLowerCase();

        // Skip if already played or queued
        if (get().playedSignatures.has(signature)) return false;
        if (queue.some(q => normalize(q.title, q.artist || q.channelTitle) === signature)) return false;

        // Limit same artist frequency
        if ((get().playedArtists.get(artist) || 0) >= 2) return false; // max 2 songs per artist

        // Skip if too similar to recently played songs
        const isSimilar = Array.from(get().playedSignatures).some(playedSig => {
          const similarity = get().calculateTitleSimilarity(signature, playedSig);
          return similarity > 0.7;
        });
        return !isSimilar;
      });

      if (unplayed.length === 0) {
        console.warn('No new unique recommendations found.');
        return false;
      }

      // Pick random candidate
      const candidate = unplayed[Math.floor(Math.random() * unplayed.length)];

      // Fetch full video details
      let details = null;
      try {
        details = await getVideoDetails(candidate.id);
      } catch {
        console.warn('Fallback: using candidate details.');
      }

      const recommended = {
        id: candidate.id,
        title: details?.title || candidate.title,
        artist: details?.channelTitle || candidate.channelTitle || '',
        thumbnail: details?.thumbnail || candidate.thumbnail || '',
        duration: details?.duration || candidate.duration || '',
        viewCount: details?.viewCount || candidate.viewCount || 0,
        addedAt: new Date().toISOString(),
        addedBy: 'system',
        userRole: 'host',
      };

      // Add to queue & set as current
      addToQueue(recommended);
      setCurrentSong(recommended);
      set({ isPlaying: true });

      console.log('🎵 Added new unique recommendation:', recommended.title);
      return true;
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      return false;
    }
  },

  previousSong: () => {
    const { currentSong } = get();
    const queue = useQueueStore.getState().queue;
    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex((song) => song.id === currentSong.id);
      if (currentIndex > 0) {
        set({ currentSong: queue[currentIndex - 1] });
        return true;
      }
    }
    return false;
  },

  resetPlayer: () =>
    set({
      isPlaying: false,
      currentSong: null,
      volume: 100,
      currentTime: 0,
      duration: 0,
      crossfadeEnabled: false,
      playedSongs: [],
      playedSignatures: new Set(),
      playedArtists: new Map(),
    }),
}));

export default usePlayerStore;
