import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  videoId: string;
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function searchYouTubeVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY,
        order: 'relevance',
        videoDefinition: 'any',
        videoCategoryId: '10',
      },
    });

    const videoIds = response.data.items.map((item: any) => item.id.videoId).join(',');
    
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    const videos: YouTubeVideo[] = response.data.items.map((item: any, index: number) => {
      const details = detailsResponse.data.items.find((detail: any) => detail.id === item.id.videoId);
      return {
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: details?.contentDetails?.duration || '',
        viewCount: details?.statistics?.viewCount || '0',
      };
    });

    return videos;
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('YouTube 검색 중 오류가 발생했습니다.');
  }
}

export function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';

  const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
  const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
  const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}