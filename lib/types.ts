import type { GenreId } from './genres';

export type Region = 'kr' | 'global';

export interface Song {
  key: string;
  appleId: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  genre: GenreId;
  genreName: string;
  releaseDate?: string;
  previewUrl?: string;
  appleUrl?: string;
  youtubeId?: string;
}

export interface RankedSong extends Song {
  rank: number;
  region: Region;
  // 어제 대비 순위 변화 (양수 = 상승). 'new'는 어제 차트에 없던 곡
  change?: number | 'new';
}

export type ChartPeriod = 'today' | 'week' | 'month' | 'rising';

export interface SourceStatus {
  name: string;
  ok: boolean;
  count: number;
}

export interface SiteData {
  generatedAt: string | null;
  date: string | null;
  picks: {
    all: RankedSong[];
    byGenre: Partial<Record<GenreId, RankedSong[]>>;
  };
  charts: Record<ChartPeriod, RankedSong[]>;
  sources: SourceStatus[];
}
