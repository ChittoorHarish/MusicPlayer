// youtubeApi.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// --- Helper: Normalize and compare song titles to detect duplicates ---
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[\(\[\{].*?[\)\]\}]/g, '') // remove anything in brackets
    .replace(/official|video|audio|music|lyric|lyrics|full|hd|mv|visualizer|remix|cover|version|performance/gi, '')
    .replace(/[^\w\s]/gi, '') // remove special characters
    .replace(/\s+/g, ' ') // collapse extra spaces
    .trim();
};

// --- Main video search by keyword ---
export const searchVideos = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 10,
        videoCategoryId: '10', // Music category
        videoEmbeddable: 'true',
        key: API_KEY,
      },
    });

    const videoIds = response.data.items.map((item) => item.id.videoId).join(',');
    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics,snippet',
        id: videoIds,
        key: API_KEY,
      },
    });

    return detailsResponse.data.items.map((video) => ({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
    }));
  } catch (error) {
    console.error('YouTube API Error (searchVideos):', error.response?.data || error.message);
    throw error;
  }
};

// --- Get full details for a single video ---
export const getVideoDetails = async (videoId) => {
  if (!videoId) return null;

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: API_KEY,
      },
    });

    const video = response.data.items?.[0];
    if (!video) return null;

    return {
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      description: video.snippet.description,
    };
  } catch (error) {
    console.error('YouTube API Error (getVideoDetails):', error.response?.data || error.message);
    throw error;
  }
};

// --- Get related videos with strong filtering ---
export const getRelatedVideos = async (videoId, maxResults = 10) => {
  if (!videoId) {
    console.warn('Skipping related video fetch: videoId is null or undefined.');
    return [];
  }

  try {
    // Get current video details
    const currentVideo = await getVideoDetails(videoId);
    if (!currentVideo) return [];

    const baseTitle = normalizeTitle(currentVideo.title);
    const baseChannel = currentVideo.channelTitle.toLowerCase();

    // ✅ FIX: include videoEmbeddable & validate params
    const relatedResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        videoEmbeddable: 'true',
        maxResults: maxResults * 4, // fetch more for filtering
        key: API_KEY,
      },
    });

    const relatedItems = relatedResponse.data.items;
    if (!relatedItems || relatedItems.length === 0) return [];

    // Filter out duplicates, remixes, covers, same-song variations
    const seen = new Set();
    const filtered = relatedItems.filter((item) => {
      const title = normalizeTitle(item.snippet.title);
      const channel = item.snippet.channelTitle.toLowerCase();

      if (!title || seen.has(title)) return false;
      seen.add(title);

      // skip if same or too similar
      if (title.includes(baseTitle) || baseTitle.includes(title)) return false;

      // skip same artist + similar titles
      if (channel === baseChannel && title.split(' ')[0] === baseTitle.split(' ')[0]) return false;

      return true;
    }).slice(0, maxResults);

    const ids = filtered.map((f) => f.id.videoId).join(',');
    if (!ids) return [];

    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: ids,
        key: API_KEY,
      },
    });

    return detailsResponse.data.items.map((v) => ({
      id: v.id,
      title: v.snippet.title,
      channelTitle: v.snippet.channelTitle,
      thumbnail: v.snippet.thumbnails?.medium?.url || '',
      duration: v.contentDetails.duration,
      viewCount: v.statistics?.viewCount || 0,
    }));
  } catch (error) {
    console.error('YouTube API Error (getRelatedVideos):', error.response?.data || error.message);
    return [];
  }
};
