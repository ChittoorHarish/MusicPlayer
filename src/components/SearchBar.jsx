import React, { useState } from 'react';
import { searchMusic } from '../services/youtube';

const SearchBar = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('Searching for:', query);
      const searchResults = await searchMusic(query);
      console.log('Search results:', searchResults);
      if (searchResults && searchResults.length > 0) {
        setResults(searchResults);
      } else {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error?.message || 'Failed to search videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for music..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((video) => (
          <div
            key={video.id}
            onClick={() => onResultSelect(video)}
            className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-32 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
              <p className="text-gray-600">{video.artist}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>{video.duration}</span>
                <span>{video.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;