import React, { useState } from 'react';
import { searchMusic } from '../services/youtube';
import FileUploadSearch from './FileUploadSearch';
import VideoPreviewModal from './modals/VideoPreviewModal';
import { MusicalNoteIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { Switch } from '@headlessui/react';

const SearchBar = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [prevPageTokens, setPrevPageTokens] = useState([]); // store history of page tokens
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [musicSource, setMusicSource] = useState('youtube'); // 'youtube' or 'local'

  const handleSearch = async (e, pageToken = '') => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    console.log('🔍 Starting YouTube search for:', query, 'pageToken:', pageToken);
    setLoading(true);
    setError(null);

    // Clear results for new search
    if (!pageToken) {
      setResults([]);
      setPrevPageTokens([]);
      setNextPageToken(null);
    }

    try {
      console.log('🔍 Calling searchMusic API...');
      const { results: searchResults, nextPageToken: nextToken } = await searchMusic(query, pageToken);
      console.log('✅ Search results received:', searchResults.length, 'videos');
      setResults(searchResults);

      // Update page token history for Back button
      if (pageToken) {
        setPrevPageTokens(prev => [...prev, pageToken]);
      }

      setNextPageToken(nextToken || null);
    } catch (err) {
      console.error('❌ Search error:', err);
      console.error('Error message:', err.message);
      setError(err.message || 'Failed to search videos. Please try again.');
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
      {/* Source Toggle */}
      <div className="mb-4 flex items-center justify-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
        <button
          type="button"
          onClick={() => setMusicSource('youtube')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            musicSource === 'youtube'
              ? 'bg-red-500 text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🎬 YouTube
        </button>
        <button
          type="button"
          onClick={() => setMusicSource('local')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            musicSource === 'local'
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          📁 Local Files (All Effects Work!)
        </button>
      </div>

      {/* Show FileUploadSearch or YouTube search based on source */}
      {musicSource === 'local' ? (
        <FileUploadSearch onResultSelect={onResultSelect} />
      ) : (
        <>
          <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for music..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-white/40"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-white shadow-lg"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {/* Video/Audio Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={isVideoMode}
              onChange={setIsVideoMode}
              className={`${
                isVideoMode ? 'bg-purple-500' : 'bg-cyan-500'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
            >
              <span className="sr-only">{isVideoMode ? 'Switch to audio mode' : 'Switch to video mode'}</span>
              <span
                className={`${
                  isVideoMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className="text-sm text-white/60">
              {isVideoMode ? <VideoCameraIcon className="w-5 h-5" /> : <MusicalNoteIcon className="w-5 h-5" />}
            </span>
          </div>
        </div>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((video) => (
          <div
            key={video.id}
            className="relative flex gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors group bg-white/5"
          >
            <div 
              className="relative cursor-pointer" 
              onClick={() => {
                // Add isVideo flag to the video object when adding to queue
                const videoWithMode = {
                  ...video,
                  isVideo: isVideoMode
                };
                onResultSelect(videoWithMode);
                if (isVideoMode) {
                  setSelectedVideo(video);
                  setIsPreviewOpen(true);
                }
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-32 h-24 object-cover rounded"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isVideoMode ? (
                  <VideoCameraIcon className="w-8 h-8 text-white" />
                ) : (
                  <MusicalNoteIcon className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2 text-white">{video.title}</h3>
              <p className="text-white/60">{video.artist}</p>
              <div className="flex gap-4 mt-2 text-sm text-white/50">
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

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={selectedVideo}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedVideo(null);
        }}
      />
      </>
      )}
    </div>
  );
};

export default SearchBar;
