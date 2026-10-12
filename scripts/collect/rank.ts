import type { GenreId } from '../../lib/genres';
import type { Region } from '../../lib/types';

// 한국 차트 : 글로벌 차트 비중
export const KR_RATIO = 0.8;

export interface DayScore {
  key: string;
  kr: number;
  global: number;
}

export interface Picks {
  all: string[];
  byGenre: Partial<Record<GenreId, string[]>>;
}

export interface Snapshot {
  date: string;
  songs: DayScore[];
  picks: Picks;
}

export interface Ranked {
  key: string;
  region: Region;
  score: number;
}

export interface ScoredEntry {
  key: string;
  region: Region;
  weight: number;
  rank: number;
  total: number;
}

// 차트 순위를 0~1 점수로 바꿔 곡마다 지역별 최고 점수를 남김 (1위 = 1점)
export function scoreEntries(entries: ScoredEntry[]): DayScore[] {
  const byKey = new Map<string, DayScore>();
  for (const e of entries) {
    const value = e.weight * (1 - (e.rank - 1) / Math.max(e.total, 1));
    const cur = byKey.get(e.key) ?? { key: e.key, kr: 0, global: 0 };
    cur[e.region] = Math.max(cur[e.region], round(value));
    byKey.set(e.key, cur);
  }
  return [...byKey.values()];
}

// 한국 차트에 있는 곡은 한국 곡, 해외 차트에만 있는 곡은 글로벌 곡으로 분류
export function regionRanking(scores: DayScore[]): { kr: Ranked[]; global: Ranked[] } {
  const kr = scores
    .filter((s) => s.kr > 0)
    .map((s) => ({ key: s.key, region: 'kr' as const, score: s.kr + 0.1 * s.global }))
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  const global = scores
    .filter((s) => s.kr === 0 && s.global > 0)
    .map((s) => ({ key: s.key, region: 'global' as const, score: s.global }))
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  return { kr, global };
}

// 어느 구간을 잘라도 한국:글로벌이 80:20이 되도록 섞음 (한한한한글 한한한한글 ...)
export function mixByRatio<T>(kr: T[], global: T[], n: number, krRatio = KR_RATIO): T[] {
  const out: T[] = [];
  let k = 0;
  let g = 0;
  while (out.length < n && (k < kr.length || g < global.length)) {
    const krTarget = Math.round((out.length + 1) * krRatio);
    const wantKr = k < krTarget;
    if ((wantKr && k < kr.length) || g >= global.length) out.push(kr[k++]);
    else out.push(global[g++]);
  }
  return out;
}

export function mixedChart(scores: DayScore[], n: number): Ranked[] {
  const { kr, global } = regionRanking(scores);
  return mixByRatio(kr, global, n);
}

// 기간 차트용: 여러 날 점수의 평균 (차트에 없던 날은 0점)
export function averageScores(snapshots: Snapshot[]): DayScore[] {
  const sums = new Map<string, DayScore>();
  for (const snap of snapshots) {
    for (const s of snap.songs) {
      const cur = sums.get(s.key) ?? { key: s.key, kr: 0, global: 0 };
      cur.kr += s.kr;
      cur.global += s.global;
      sums.set(s.key, cur);
    }
  }
  const days = Math.max(snapshots.length, 1);
  return [...sums.values()].map((s) => ({ key: s.key, kr: round(s.kr / days), global: round(s.global / days) }));
}

// 어제 대비 순위 변화 (양수 = 상승)
export function rankChanges(today: Ranked[], yesterday: Ranked[] | null): Map<string, number | 'new'> {
  const changes = new Map<string, number | 'new'>();
  if (!yesterday) return changes;
  const prev = new Map(yesterday.map((r, i) => [r.key, i + 1]));
  today.forEach((r, i) => {
    const before = prev.get(r.key);
    changes.set(r.key, before === undefined ? 'new' : before - (i + 1));
  });
  return changes;
}

export function risingKeys(today: Ranked[], changes: Map<string, number | 'new'>, n: number): string[] {
  const rank = new Map(today.map((r, i) => [r.key, i + 1]));
  const up = (key: string) => {
    const c = changes.get(key);
    return c === 'new' ? 100 - (rank.get(key) ?? 100) : (c ?? 0);
  };
  return today
    .filter((r) => {
      const c = changes.get(r.key);
      return c === 'new' || (typeof c === 'number' && c > 0);
    })
    .sort((a, b) => up(b.key) - up(a.key))
    .slice(0, n)
    .map((r) => r.key);
}

// 인기곡 상위권 안에서 인기도 가중 랜덤으로 골라 매일 다른 곡이 나오게 함.
// recent(최근 추천곡)는 가능하면 제외하고, 후보가 모자랄 때만 다시 허용
export function pickSongs(
  ranking: { kr: Ranked[]; global: Ranked[] },
  count: number,
  recent: Set<string>,
  seed: string,
): string[] {
  const rng = seededRandom(seed);
  const krWanted = Math.round(count * KR_RATIO);
  const krPool = ranking.kr.slice(0, 60);
  const globalPool = ranking.global.slice(0, 30);

  const krPicked = draw(krPool, krWanted, recent, rng);
  const globalPicked = draw(globalPool, count - krPicked.length, recent, rng);
  // 글로벌 후보가 모자라면 한국 곡으로 채움
  if (krPicked.length + globalPicked.length < count) {
    const extra = draw(
      krPool.filter((r) => !krPicked.includes(r)),
      count - krPicked.length - globalPicked.length,
      recent,
      rng,
    );
    krPicked.push(...extra);
  }
  const byScore = (a: Ranked, b: Ranked) => b.score - a.score;
  return mixByRatio(krPicked.sort(byScore), globalPicked.sort(byScore), count).map((r) => r.key);
}

function draw(pool: Ranked[], k: number, recent: Set<string>, rng: () => number): Ranked[] {
  const fresh = pool.filter((r) => !recent.has(r.key));
  const picked = weightedSample(fresh, k, rng);
  if (picked.length < k) {
    const stale = pool.filter((r) => recent.has(r.key));
    picked.push(...weightedSample(stale, k - picked.length, rng));
  }
  return picked;
}

function weightedSample(items: Ranked[], k: number, rng: () => number): Ranked[] {
  const left = [...items];
  const out: Ranked[] = [];
  while (out.length < k && left.length > 0) {
    const total = left.reduce((sum, r) => sum + r.score, 0);
    let x = rng() * total;
    let idx = left.findIndex((r) => (x -= r.score) <= 0);
    if (idx < 0) idx = left.length - 1;
    out.push(left.splice(idx, 1)[0]);
  }
  return out;
}

// 같은 날짜로 다시 돌려도 같은 결과가 나오는 난수 (mulberry32)
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
