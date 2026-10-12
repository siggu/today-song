import { GENRES, toGenreId } from '../../lib/genres';
import type { Region, Song } from '../../lib/types';
import { songKey } from './normalize';

export interface ChartEntry {
  appleId?: string;
  title: string;
  artist: string;
  rank: number;
}

export interface ChartSource {
  name: string;
  region: Region;
  // 같은 지역 안에서 이 차트를 얼마나 믿을지 (1 = 대표 차트)
  weight: number;
  // 곡 정보를 조회할 Apple 스토어 국가 코드. 없으면 기존 곡과 매칭만 함 (Deezer)
  country?: string;
  entries: ChartEntry[];
}

const USER_AGENT = 'today-song/1.0 (+https://github.com/siggu/today-song)';

export async function fetchJson<T>(url: string, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw new Error(`${url} 요청 실패: ${lastError instanceof Error ? lastError.message : lastError}`);
}

interface AppleRssResponse {
  feed: { results?: { id: string; name: string; artistName: string }[] };
}

// Apple Music 국가별 많이 재생된 곡 (키 불필요)
export async function appleMostPlayed(country: string, weight: number, region: Region): Promise<ChartSource> {
  const url = `https://rss.marketingtools.apple.com/api/v2/${country}/music/most-played/100/songs.json`;
  const data = await fetchJson<AppleRssResponse>(url);
  const entries = (data.feed.results ?? []).map((r, i) => ({
    appleId: r.id,
    title: r.name,
    artist: r.artistName,
    rank: i + 1,
  }));
  return { name: `Apple Music ${country.toUpperCase()} Top 100`, region, weight, country, entries };
}

interface ItunesRssEntry {
  id: { attributes: { 'im:id': string } };
  'im:name': { label: string };
  'im:artist': { label: string };
}

interface ItunesRssResponse {
  feed: { entry?: ItunesRssEntry | ItunesRssEntry[] };
}

// iTunes 장르별 인기곡 (구형 RSS, 키 불필요). 장르 다양성 확보용
export async function itunesGenreTop(
  country: string,
  appleGenreId: number,
  weight: number,
  region: Region,
): Promise<ChartSource> {
  const url = `https://itunes.apple.com/${country}/rss/topsongs/limit=50/genre=${appleGenreId}/json`;
  const data = await fetchJson<ItunesRssResponse>(url);
  const raw = data.feed.entry;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const entries = list.map((e, i) => ({
    appleId: e.id.attributes['im:id'],
    title: e['im:name'].label,
    artist: e['im:artist'].label,
    rank: i + 1,
  }));
  return { name: `iTunes ${country.toUpperCase()} 장르 ${appleGenreId}`, region, weight, country, entries };
}

interface DeezerChartResponse {
  data?: { title: string; artist: { name: string }; position?: number }[];
}

// Deezer 글로벌 차트 (키 불필요). Apple 곡과 매칭되는 경우 글로벌 인기 점수만 보강
export async function deezerChart(weight: number): Promise<ChartSource> {
  const data = await fetchJson<DeezerChartResponse>('https://api.deezer.com/chart/0/tracks?limit=100');
  const entries = (data.data ?? []).map((t, i) => ({
    title: t.title,
    artist: t.artist.name,
    rank: t.position ?? i + 1,
  }));
  return { name: 'Deezer Global Top 100', region: 'global', weight, entries };
}

export function sourceTasks(): { name: string; run: () => Promise<ChartSource> }[] {
  const kr: { name: string; run: () => Promise<ChartSource> }[] = [
    { name: 'Apple Music KR', run: () => appleMostPlayed('kr', 1, 'kr') },
  ];
  for (const genre of GENRES) {
    for (const id of genre.appleGenreIds) {
      kr.push({ name: `iTunes KR ${genre.label}`, run: () => itunesGenreTop('kr', id, 0.7, 'kr') });
    }
  }
  return [
    ...kr,
    { name: 'Apple Music US', run: () => appleMostPlayed('us', 1, 'global') },
    { name: 'Apple Music GB', run: () => appleMostPlayed('gb', 0.8, 'global') },
    { name: 'Deezer Global', run: () => deezerChart(0.8) },
  ];
}

interface ItunesLookupResult {
  wrapperType?: string;
  kind?: string;
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
  primaryGenreName?: string;
  releaseDate?: string;
}

// iTunes Lookup으로 곡 상세 정보(장르, 앨범아트, 30초 미리듣기, Apple Music 링크) 조회
export async function lookupSongs(country: string, appleIds: string[]): Promise<Map<string, Song>> {
  const songs = new Map<string, Song>();
  const unique = [...new Set(appleIds)];
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    const url = `https://itunes.apple.com/lookup?id=${batch.join(',')}&country=${country}&entity=song`;
    try {
      const data = await fetchJson<{ results?: ItunesLookupResult[] }>(url);
      for (const r of data.results ?? []) {
        if (r.wrapperType !== 'track' || r.kind !== 'song') continue;
        songs.set(String(r.trackId), {
          key: songKey(r.trackName, r.artistName),
          appleId: String(r.trackId),
          title: r.trackName,
          artist: r.artistName,
          album: r.collectionName,
          artwork: (r.artworkUrl100 ?? '').replace(/\/\d+x\d+bb\./, '/600x600bb.'),
          genre: toGenreId(r.primaryGenreName),
          genreName: r.primaryGenreName ?? '',
          releaseDate: r.releaseDate?.slice(0, 10),
          previewUrl: r.previewUrl,
          appleUrl: r.trackViewUrl,
        });
      }
    } catch (error) {
      console.warn(`  ! iTunes Lookup(${country}) 일부 실패: ${error instanceof Error ? error.message : error}`);
    }
  }
  return songs;
}
