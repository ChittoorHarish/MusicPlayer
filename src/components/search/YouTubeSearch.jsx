import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRoleStore } from '../../stores/roleStore';
import useQueueStore from '../../stores/queueStore';
import toast from 'react-hot-toast';

export default function YouTubeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole, userId } = useRoleStore();
  const { addToQueue } = useQueueStore();

  const searchYouTube = async (searchQuery) => {
    setLoading(true);
    try {
      // TODO: Replace with actual YouTube API call
      const mockResults = [
        {
          id: '1',
          title: 'Sample Song',
          thumbnail: 'https://via.placeholder.com/120',
          channelTitle: 'Sample Artist',
          duration: '3:45'
        }
      ];
      setResults(mockResults);
    } catch (error) {
      toast.error('Failed to search YouTube');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchYouTube(query);
  };

  const handleAddSong = (song) => {
    const songWithMetadata = {
      ...song,
      addedBy: userId,
      userRole: userRole,
      addedAt: new Date().toISOString()
    };
    addToQueue(songWithMetadata);
  };

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={{ color: 'white' }}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-cyan-500" />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-cyan-500" />
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center space-x-3 bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleAddSong(result)}
            >
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{result.title}</p>
                <p className="text-white/60 text-sm truncate">
                  {result.channelTitle}
                </p>
              </div>
              <span className="text-white/40 text-sm">{result.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}