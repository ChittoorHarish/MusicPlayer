import axios from 'axios';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:`;
  result += seconds.padStart(2, '0');
  return result;
};

export const searchMusic = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query + ' music',
        type: 'video',
        videoCategoryId: '10', // Music category
        key: API_KEY
      }
    });

    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    
    // Get additional details for each video
    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: API_KEY
      }
    });

    // Combine search results with video details
    return response.data.items.map((item, index) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: formatDuration(detailsResponse.data.items[index].contentDetails.duration),
      views: parseInt(detailsResponse.data.items[index].statistics.viewCount).toLocaleString(),
      addedAt: new Date().toISOString(),
      addedBy: null // Will be set when adding to queue
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: API_KEY
      }
    });

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium.url,
      duration: formatDuration(video.contentDetails.duration),
      views: parseInt(video.statistics.viewCount).toLocaleString(),
      description: video.snippet.description
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
};