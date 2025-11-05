import React from 'react';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, PlayIcon } from '@heroicons/react/24/outline';
import useQueueStore from '../stores/queueStore';
import usePlayerStore from '../stores/playerStore';
import { useRoleStore } from '../stores/roleStore';
import useEventStore from '../stores/eventStore';

const formatDuration = (duration) => {
  if (!duration) return '--:--';
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function QueueManager() {
  const queue = useQueueStore(state => state.queue);
  const removeFromQueue = useQueueStore(state => state.removeSong);
  const userRole = useRoleStore(state => state.userRole);
  const eventData = useEventStore(state => state.eventData);
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);

  const handleDelete = (songId) => {
    if (userRole !== 'host' && userRole !== 'subhost') return;
    removeFromQueue(songId);
  };

  const handlePlay = (song) => {
    // Allow any user to play songs from the queue
    setCurrentSong(song);
  };

  const handleVoteSkip = (songId) => {
    if (userRole !== 'guest') return;
    // Implement vote-skip logic here
  };

  return (
    <div className="space-y-4">
      {queue.map((song, index) => (
        <div
          key={song.id}
          className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="relative z-10 flex-shrink-0">
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
              {song.title}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-white/60 text-sm truncate">
                {song.artist}
              </p>
              <span className="text-purple-400/60 text-xs">
                {formatDuration(song.duration)}
              </span>
            </div>
          </div>

          {/* Queue Controls */}
          <div className="flex items-center space-x-2">
            {(userRole === 'host' || userRole === 'subhost') && (
              <>
                <button
                  onClick={() => handlePlay(song)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <PlayIcon className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => handleDelete(song.id)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <TrashIcon className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {userRole === 'guest' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePlay(song)}
                  className="p-1 hover:bg-white/10 rounded group"
                  title="Play this song"
                >
                  <PlayIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </button>
                <button
                  onClick={() => handleVoteSkip(song.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-500/20 hover:bg-purple-500/30 rounded-full transition-all transform hover:scale-105"
                >
                  <span className="text-purple-300">Vote Skip</span>
                  <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full">0/3</span>
                </button>
                {song.addedBy === eventData?.userId && (
                  <span className="text-xs px-2 py-1 bg-purple-500/10 rounded-full text-purple-300">
                    Added by you
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}