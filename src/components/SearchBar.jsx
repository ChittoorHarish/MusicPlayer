import React, { useState } from 'react';
import { searchMusic } from '../services/youtube';

const SearchBar = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [prevPageTokens, setPrevPageTokens] = useState([]); // store history of page tokens

  const handleSearch = async (e, pageToken = '') => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    // Clear results for new search
    if (!pageToken) {
      setResults([]);
      setPrevPageTokens([]);
      setNextPageToken(null);
    }

    try {
      const { results: searchResults, nextPageToken: nextToken } = await searchMusic(query, pageToken);
      setResults(searchResults);

      // Update page token history for Back button
      if (pageToken) {
        setPrevPageTokens(prev => [...prev, pageToken]);
      }

      setNextPageToken(nextToken || null);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!nextPageToken) return;
    await handleSearch(null, nextPageToken);
  };

  const handleBack = async () => {
    if (prevPageTokens.length === 0) return;
    const prevTokens = [...prevPageTokens];
    const lastToken = prevTokens.pop(); // get previous page token
    setPrevPageTokens(prevTokens);
    await handleSearch(null, lastToken);
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

      {error && <div className="text-red-500 mb-4">{error}</div>}

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

      {(nextPageToken || prevPageTokens.length > 0) && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleBack}
            disabled={prevPageTokens.length === 0 || loading}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!nextPageToken || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
