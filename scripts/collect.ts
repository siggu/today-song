/**
 * 매일 인기 차트를 수집해서 data/ 폴더를 갱신하는 스크립트 (GitHub Actions에서 실행)
 *
 *  - data/catalog.json        곡 정보 + YouTube 영상 ID 캐시
 *  - data/snapshots/날짜.json  그날의 곡별 인기 점수와 오늘의 추천 (기간 차트 계산용)
 *  - data/site.json           웹사이트가 읽는 최종 데이터
 *
 * 환경 변수
 *  - YOUTUBE_API_KEY       있으면 YouTube 영상 ID를 찾아 전곡 재생을 지원
 *  - YOUTUBE_MAX_SEARCHES  하루 최대 검색 횟수 (기본 80회 = 8,000 유닛)
 *  - COLLECT_DATE          수집 날짜 강제 지정 (YYYY-MM-DD, 테스트용)
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GENRE_IDS, type GenreId } from '../lib/genres';
import type { RankedSong, SiteData, Song, SourceStatus } from '../lib/types';
import { songKey } from './collect/normalize';
import {
  averageScores,
  mixedChart,
  pickSongs,
  rankChanges,
  regionRanking,
  risingKeys,
  scoreEntries,
  type Picks,
  type Ranked,
  type ScoredEntry,
  type Snapshot,
} from './collect/rank';
import { lookupSongs, sourceTasks, type ChartSource } from './collect/sources';
import { QuotaExceededError, searchYoutube } from './collect/youtube';

const DATA_DIR = path.join(process.cwd(), 'data');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshots');
const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');
const SITE_PATH = path.join(DATA_DIR, 'site.json');

const PICK_COUNT = 10;
const GENRE_PICK_COUNT = 6;
const CHART_SIZE = 50;
const RECENT_PICK_DAYS = 30;
const KEEP_DAYS = 40;
const YOUTUBE_RETRY_DAYS = 7;

type CatalogEntry = Song & { lastSeen: string; youtubeCheckedAt?: string };
type Catalog = Record<string, CatalogEntry>;

async function main() {
  const today = process.env.COLLECT_DATE ?? kstDate();
  console.log(`🎵 ${today} 차트 수집 시작`);

  const catalog = await readJson<Catalog>(CATALOG_PATH, {});
  const history = (await loadSnapshots()).filter((s) => s.date < today);
  const existingToday = await readJson<Snapshot | null>(snapshotPath(today), null);

  // 1. 차트 수집
  const tasks = sourceTasks();
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const sources: ChartSource[] = [];
  const status: SourceStatus[] = [];
  results.forEach((r, i) => {
    const name = tasks[i].name;
    if (r.status === 'fulfilled' && r.value.entries.length > 0) {
      sources.push(r.value);
      status.push({ name, ok: true, count: r.value.entries.length });
      console.log(`  ✓ ${name}: ${r.value.entries.length}곡`);
    } else {
      status.push({ name, ok: false, count: 0 });
      console.warn(`  ✗ ${name}: ${r.status === 'rejected' ? r.reason : '결과 없음'}`);
    }
  });
  if (!sources.some((s) => s.region === 'kr')) {
    throw new Error('한국 차트를 하나도 가져오지 못해 기존 데이터를 유지합니다.');
  }

  // 2. iTunes Lookup으로 곡 정보 보강 (한국 스토어 정보 우선)
  const lookups = new Map<string, Map<string, Song>>();
  for (const country of [...new Set(sources.flatMap((s) => (s.country ? [s.country] : [])))]) {
    const ids = sources.filter((s) => s.country === country).flatMap((s) => s.entries.flatMap((e) => e.appleId ?? []));
    lookups.set(country, await lookupSongs(country, ids));
  }

  const todaySongs = new Map<string, Song>();
  const entries: ScoredEntry[] = [];
  for (const source of sources) {
    const total = source.entries.length;
    for (const entry of source.entries) {
      let key: string | undefined;
      if (source.country && entry.appleId) {
        const song = lookups.get(source.country)?.get(entry.appleId);
        if (!song) continue;
        key = song.key;
        if (!todaySongs.has(key)) todaySongs.set(key, song);
      } else {
        // Deezer처럼 Apple ID가 없는 차트는 이미 수집된 곡과 이름이 같을 때만 반영
        key = songKey(entry.title, entry.artist);
        if (!todaySongs.has(key)) continue;
      }
      entries.push({ key, region: source.region, weight: source.weight, rank: entry.rank, total });
    }
  }
  const scores = scoreEntries(entries);
  console.log(`  → 중복 제거 후 ${scores.length}곡`);

  for (const [key, song] of todaySongs) {
    const prev = catalog[key];
    catalog[key] = {
      ...song,
      youtubeId: prev?.youtubeId,
      youtubeCheckedAt: prev?.youtubeCheckedAt,
      lastSeen: today,
    };
  }

  // 3. 오늘의 추천 (같은 날 다시 실행해도 바뀌지 않게 기존 추천 유지)
  const picks: Picks = existingToday?.picks.all.length
    ? existingToday.picks
    : makePicks(scores, catalog, history, today);

  const todaySnapshot: Snapshot = { date: today, songs: scores, picks };
  const snapshots = [...history, todaySnapshot];

  // 4. 기간별 차트
  const fullChart = mixedChart(scores, scores.length);
  const todayChart = fullChart.slice(0, 100);
  const prevSnapshot = history.at(-1);
  const changes = rankChanges(todayChart, prevSnapshot ? mixedChart(prevSnapshot.songs, 100) : null);
  const weekChart = mixedChart(averageScores(snapshots.filter((s) => s.date > shiftDate(today, -7))), CHART_SIZE);
  const monthChart = mixedChart(averageScores(snapshots.filter((s) => s.date > shiftDate(today, -30))), CHART_SIZE);
  const rising = risingKeys(todayChart, changes, 20);

  // 5. YouTube 영상 ID 찾기 (추천곡 → 차트 상위 순으로 우선)
  const priority = [
    ...picks.all,
    ...Object.values(picks.byGenre).flat(),
    ...todayChart.slice(0, CHART_SIZE).map((r) => r.key),
    ...rising,
    ...weekChart.map((r) => r.key),
    ...monthChart.map((r) => r.key),
  ];
  await fillYoutube([...new Set(priority)], catalog, today);

  // 6. 저장
  pruneCatalog(catalog, today, new Set(priority));
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await writeJson(snapshotPath(today), todaySnapshot);
  await removeOldSnapshots(today);
  await writeJson(CATALOG_PATH, sortKeys(catalog));

  const toSongs = (list: Ranked[], withChange = false): RankedSong[] =>
    list.flatMap((r, i) => {
      const entry = catalog[r.key];
      if (!entry) return [];
      return [{ ...toSong(entry), rank: i + 1, region: r.region, ...(withChange ? { change: changes.get(r.key) } : {}) }];
    });
  const ranked = new Map(fullChart.map((r) => [r.key, r]));
  const fromKeys = (keys: string[]) => toSongs(keys.flatMap((k) => ranked.get(k) ?? []));

  const site: SiteData = {
    generatedAt: new Date().toISOString(),
    date: today,
    picks: {
      all: fromKeys(picks.all),
      byGenre: Object.fromEntries(
        Object.entries(picks.byGenre).map(([genre, keys]) => [genre, fromKeys(keys ?? [])]),
      ),
    },
    charts: {
      today: toSongs(todayChart.slice(0, CHART_SIZE), true),
      week: toSongs(weekChart),
      month: toSongs(monthChart),
      rising: toSongs(rising.flatMap((k) => ranked.get(k) ?? []), true),
    },
    sources: status,
  };
  await writeJson(SITE_PATH, site);

  const withVideo = site.charts.today.filter((s) => s.youtubeId).length;
  console.log(`✅ 완료: 추천 ${site.picks.all.length}곡, 오늘 차트 ${site.charts.today.length}곡 (전곡 재생 가능 ${withVideo}곡)`);
}

function makePicks(
  scores: Snapshot['songs'],
  catalog: Catalog,
  history: Snapshot[],
  today: string,
): Picks {
  const recentSnaps = history.filter((s) => s.date > shiftDate(today, -RECENT_PICK_DAYS));
  const ranking = regionRanking(scores);

  const recentAll = new Set(recentSnaps.flatMap((s) => s.picks.all));
  const all = pickSongs(ranking, PICK_COUNT, recentAll, `${today}:all`);

  const byGenre: Partial<Record<GenreId, string[]>> = {};
  for (const genre of GENRE_IDS) {
    const inGenre = (r: Ranked) => catalog[r.key]?.genre === genre;
    const genreRanking = { kr: ranking.kr.filter(inGenre), global: ranking.global.filter(inGenre) };
    if (genreRanking.kr.length + genreRanking.global.length === 0) continue;
    const recent = new Set(recentSnaps.flatMap((s) => s.picks.byGenre[genre] ?? []));
    byGenre[genre] = pickSongs(genreRanking, GENRE_PICK_COUNT, recent, `${today}:${genre}`);
  }
  return { all, byGenre };
}

async function fillYoutube(keys: string[], catalog: Catalog, today: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('  ℹ YOUTUBE_API_KEY가 없어 YouTube 검색을 건너뜁니다 (30초 미리듣기만 제공).');
    return;
  }
  const max = Number(process.env.YOUTUBE_MAX_SEARCHES ?? 80);
  const targets = keys.filter((key) => {
    const entry = catalog[key];
    if (!entry || entry.youtubeId) return false;
    return !entry.youtubeCheckedAt || entry.youtubeCheckedAt <= shiftDate(today, -YOUTUBE_RETRY_DAYS);
  });

  let searched = 0;
  let found = 0;
  for (const key of targets.slice(0, max)) {
    const entry = catalog[key];
    try {
      const match = await searchYoutube(entry, apiKey);
      searched++;
      entry.youtubeCheckedAt = today;
      if (match) {
        entry.youtubeId = match.videoId;
        found++;
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        console.warn(`  ! ${error.message} — 남은 곡은 내일 이어서 검색합니다.`);
        break;
      }
      console.warn(`  ! YouTube 검색 실패 (${entry.title}): ${error instanceof Error ? error.message : error}`);
    }
  }
  console.log(`  ▶ YouTube: ${searched}회 검색, ${found}곡 찾음 (대기 ${Math.max(targets.length - searched, 0)}곡)`);
}

function pruneCatalog(catalog: Catalog, today: string, keep: Set<string>) {
  const cutoff = shiftDate(today, -KEEP_DAYS);
  for (const [key, entry] of Object.entries(catalog)) {
    if (entry.lastSeen < cutoff && !keep.has(key)) delete catalog[key];
  }
}

function toSong(entry: CatalogEntry): Song {
  // 사이트에는 캐시용 필드를 빼고 내보냄
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastSeen, youtubeCheckedAt, ...song } = entry;
  return song;
}

async function loadSnapshots(): Promise<Snapshot[]> {
  let files: string[] = [];
  try {
    files = (await readdir(SNAPSHOT_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
  } catch {
    return [];
  }
  const snaps = await Promise.all(files.map((f) => readJson<Snapshot | null>(path.join(SNAPSHOT_DIR, f), null)));
  return snaps.filter((s): s is Snapshot => s !== null).sort((a, b) => a.date.localeCompare(b.date));
}

async function removeOldSnapshots(today: string) {
  const cutoff = shiftDate(today, -KEEP_DAYS);
  for (const file of await readdir(SNAPSHOT_DIR)) {
    const date = file.replace(/\.json$/, '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date < cutoff) await rm(path.join(SNAPSHOT_DIR, file));
  }
}

const snapshotPath = (date: string) => path.join(SNAPSHOT_DIR, `${date}.json`);

function kstDate(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function sortKeys<T>(obj: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
