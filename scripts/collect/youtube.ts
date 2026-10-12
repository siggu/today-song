import type { Song } from '../../lib/types';

export interface YoutubeMatch {
  videoId: string;
}

interface SearchItem {
  id: { videoId?: string };
  snippet: { title: string; channelTitle: string };
}

export class QuotaExceededError extends Error {}

// search.list 1회 = 100 유닛 (무료 한도 하루 10,000 유닛)
export async function searchYoutube(song: Song, apiKey: string): Promise<YoutubeMatch | null> {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '5',
    q: `${song.artist} ${song.title}`,
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    videoCategoryId: '10',
    regionCode: 'KR',
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 403) {
    const body = await res.text();
    if (/quota/i.test(body)) throw new QuotaExceededError('YouTube API 일일 할당량 초과');
    throw new Error(`YouTube API 403: ${body.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
  const data = (await res.json()) as { items?: SearchItem[] };
  const items = (data.items ?? []).filter((i) => i.id.videoId);
  if (items.length === 0) return null;

  const best = items
    .map((item, index) => ({ item, score: matchScore(song, item) - index * 0.1 }))
    .sort((a, b) => b.score - a.score)[0];
  return best.score >= 0.5 ? { videoId: best.item.id.videoId! } : null;
}

const compact = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

function matchScore(song: Song, item: SearchItem): number {
  const title = item.snippet.title;
  const channel = item.snippet.channelTitle;
  const songTitle = compact(song.title.replace(/\s*[(\[].*?[)\]]/g, ''));
  const firstArtist = compact(song.artist.split(/,|&/)[0]);
  let score = 0;
  if (songTitle && compact(title).includes(songTitle)) score += 2;
  if (firstArtist && (compact(channel).includes(firstArtist) || compact(title).includes(firstArtist))) score += 1;
  // "아티스트 - Topic" 채널은 음원 전곡을 올려주는 공식 자동 채널
  if (/ - topic$/i.test(channel)) score += 1;
  if (/official|m\/?v|audio|뮤직비디오/i.test(title)) score += 0.5;
  const unwanted = /cover|커버|reaction|리액션|karaoke|노래방|instrumental|inst\.|1\s?hour|1시간|playlist|플레이리스트|shorts|teaser|티저/i;
  if (unwanted.test(title) && !unwanted.test(song.title)) score -= 3;
  return score;
}
