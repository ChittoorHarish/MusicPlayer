import React from 'react';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, PlayIcon } from '@heroicons/react/24/outline';
import useQueueStore from '../stores/queueStore';
import usePlayerStore from '../stores/playerStore';
import { useRoleStore } from '../stores/roleStore';

export default function QueueManager() {
  const queue = useQueueStore(state => state.queue);
  const removeFromQueue = useQueueStore(state => state.removeSong);
  const userRole = useRoleStore(state => state.userRole);
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
          className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg"
        >
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-12 h-12 rounded"
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-white truncate">{song.title}</p>
            <p className="text-white/60 text-sm truncate">
              {song.artist}
            </p>
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
              <button
                onClick={() => handleVoteSkip(song.id)}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded"
              >
                Vote Skip
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}