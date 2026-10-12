'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { MagnifyingGlassIcon, PauseIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import GenrePicker, { Chip } from '@/components/ui/GenrePicker';
import PickCard from '@/components/ui/PickCard';
import TrackRow, { TRACK_GRID } from '@/components/ui/TrackRow';
import { NowPlayingPanel, PlayerBar } from '@/components/player/Player';
import { usePlayer } from '@/components/player/usePlayer';
import { GENRE_IDS, genreLabel, type GenreId } from '@/lib/genres';
import type { ChartPeriod, RankedSong, SiteData } from '@/lib/types';
import Sidebar, { Logo } from './Sidebar';

const PREFS_KEY = 'today-song:genres';
const CHART_PREVIEW = 20;

const PERIODS: { id: ChartPeriod; label: string; empty: string }[] = [
  { id: 'today', label: '오늘', empty: '오늘 차트가 아직 없어요.' },
  { id: 'week', label: '이번 주', empty: '이번 주 데이터가 아직 없어요.' },
  { id: 'month', label: '이번 달', empty: '이번 달 데이터가 아직 없어요.' },
  { id: 'rising', label: '급상승', empty: '급상승 차트는 이틀 이상 데이터가 쌓이면 보여드려요.' },
];

export default function Home({ data }: { data: SiteData }) {
  const [prefs, setPrefs] = useState<GenreId[]>([]);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<ChartPeriod>('today');
  const [chartGenre, setChartGenre] = useState<GenreId[]>([]);
  const [showFullChart, setShowFullChart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const player = usePlayer();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '[]');
      if (Array.isArray(saved)) setPrefs(saved.filter((g): g is GenreId => GENRE_IDS.includes(g)));
    } catch {
      // 저장소를 쓸 수 없는 환경이면 기본값(전체) 사용
    }
  }, []);

  const updatePrefs = (genres: GenreId[]) => {
    setPrefs(genres);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(genres));
    } catch {
      // 무시
    }
  };

  const picks = useMemo(() => {
    if (prefs.length === 0) return data.picks.all;
    // 선택한 장르들의 추천곡을 번갈아 섞음
    const lists = prefs.map((g) => data.picks.byGenre[g] ?? []);
    const seen = new Set<string>();
    const out: RankedSong[] = [];
    for (let i = 0; out.length < 12 && lists.some((l) => i < l.length); i++) {
      for (const list of lists) {
        const song = list[i];
        if (song && !seen.has(song.key) && out.length < 12) {
          seen.add(song.key);
          out.push(song);
        }
      }
    }
    return out;
  }, [prefs, data.picks]);

  const availableGenres = useMemo(
    () => GENRE_IDS.filter((g) => (data.picks.byGenre[g]?.length ?? 0) > 0),
    [data.picks.byGenre],
  );

  const chart = useMemo(() => {
    const list = data.charts[period];
    return chartGenre.length ? list.filter((s) => chartGenre.includes(s.genre)) : list;
  }, [data.charts, period, chartGenre]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = new Map<string, RankedSong>();
    const lists = [
      data.charts.today,
      data.charts.week,
      data.charts.month,
      data.picks.all,
      ...Object.values(data.picks.byGenre),
    ];
    for (const list of lists) for (const s of list ?? []) if (!all.has(s.key)) all.set(s.key, s);
    return [...all.values()]
      .filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, data]);

  // 재생 중인 곡을 다시 누르면 일시정지/재생 전환
  const playOrToggle = (song: RankedSong, list: RankedSong[]) => {
    if (player.current?.key === song.key) player.toggle();
    else player.play(song, list);
  };
  const isCurrent = (song: RankedSong) => player.current?.key === song.key;
  const picksPlaying = !!player.current && picks.some(isCurrent);

  // 검색어가 바뀌면 결과가 보이도록 맨 위로
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [query]);

  const goHome = () => {
    setQuery('');
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!data.generatedAt) {
    return (
      <div className='min-h-dvh bg-base flex flex-col items-center justify-center gap-4 px-6 text-center'>
        <Logo className='text-2xl' />
        <div className='text-2xl font-bold mt-6'>아직 수집된 차트가 없어요</div>
        <p className='text-subtle'>
          매일 아침 6시(한국 시간)에 인기 차트를 모아 오늘의 노래를 골라드려요.
          <br />
          직접 수집하려면 <code className='bg-highlight px-2 py-0.5 rounded'>npm run collect</code> 를 실행하세요.
        </p>
      </div>
    );
  }

  return (
    <div className='h-dvh flex flex-col bg-black lg:p-2 lg:gap-2'>
      <div className='flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-2'>
        <Sidebar data={data} prefs={prefs} onPrefsChange={updatePrefs} onHome={goHome} />

        <main
          ref={mainRef}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}
          className='@container flex-1 min-h-0 min-w-0 bg-base lg:rounded-lg overflow-y-auto'
        >
          <div className='bg-gradient-to-b from-[#1f7a4d] via-[#14422b]/80 to-base'>
            <header
              id='top'
              className={clsx(
                'sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 h-16 transition-colors',
                scrolled ? 'bg-[#0f3d26]' : 'bg-transparent',
              )}
            >
              <Logo className='lg:hidden shrink-0' />
              <SearchBox query={query} onChange={setQuery} />
            </header>

            {!query.trim() && (
              <section className='px-4 md:px-6 pt-2 pb-6 flex flex-col @2xl:flex-row @2xl:items-end gap-5 @2xl:gap-6'>
                <Cover songs={data.picks.all} />
                <div className='min-w-0'>
                  <div className='text-sm font-medium'>매일 업데이트되는 플레이리스트</div>
                  <h1 className='text-5xl @3xl:text-7xl @6xl:text-8xl font-black tracking-tight my-2 @2xl:my-4'>오늘의 노래</h1>
                  <p className='text-sm text-subtle'>한국 차트 80% · 글로벌 차트 20% 인기곡 중에서 매일 새로 골라드려요</p>
                  <div className='text-sm mt-2'>
                    <span className='font-bold'>오늘의 노래</span>
                    <span className='text-subtle'> · {formatDate(data.date)} · {picks.length}곡</span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {query.trim() ? (
            <section className='px-4 md:px-6 py-4'>
              <h2 className='text-2xl font-bold mb-4'>&lsquo;{query.trim()}&rsquo; 검색 결과</h2>
              {searchResults.length ? (
                <TrackList
                  songs={searchResults}
                  isCurrent={isCurrent}
                  isPlaying={player.isPlaying}
                  onPlay={(s) => playOrToggle(s, searchResults)}
                />
              ) : (
                <p className='text-subtle'>최근 한 달 인기곡 중에는 검색 결과가 없어요.</p>
              )}
            </section>
          ) : (
            <>
              <div className='px-4 md:px-6 py-4 flex flex-col gap-4'>
                <div className='flex items-center gap-5'>
                  <button
                    onClick={() => (picksPlaying ? player.toggle() : picks[0] && player.play(picks[0], picks))}
                    disabled={!picks.length}
                    aria-label={picksPlaying && player.isPlaying ? '일시정지' : '오늘의 추천 전체 재생'}
                    className='w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center hover:scale-105 hover:bg-accent-strong transition-transform cursor-pointer disabled:opacity-50'
                  >
                    {picksPlaying && player.isPlaying ? <PauseIcon className='w-7 h-7' /> : <PlayIcon className='w-7 h-7 ml-0.5' />}
                  </button>
                  <span className='text-sm text-subtle'>
                    {prefs.length ? `내 취향: ${prefs.map(genreLabel).join(', ')}` : '모든 장르에서 골랐어요'}
                  </span>
                </div>
                <div className='lg:hidden'>
                  <GenrePicker selected={prefs} available={availableGenres} allLabel='전체 장르' onChange={updatePrefs} />
                </div>
              </div>

              <section className='px-4 md:px-6 py-4'>
                <h2 className='text-2xl font-bold'>오늘의 추천</h2>
                <p className='text-sm text-subtle mb-4'>인기곡 중에서 최근 한 달 동안 추천하지 않은 곡으로 골랐어요</p>
                {picks.length ? (
                  <div className='grid grid-cols-2 @xl:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6 gap-2 @2xl:gap-3'>
                    {picks.map((song) => (
                      <PickCard
                        key={song.key}
                        song={song}
                        isCurrent={isCurrent(song)}
                        isPlaying={player.isPlaying}
                        onPlay={(s) => playOrToggle(s, picks)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className='text-subtle'>선택한 장르의 추천곡이 오늘은 없어요. 다른 장르를 골라보세요.</p>
                )}
              </section>

              <section className='px-4 md:px-6 py-6'>
                <h2 className='text-2xl font-bold mb-4'>인기 차트</h2>
                <div className='flex flex-col gap-3 mb-4'>
                  <div className='flex flex-wrap gap-2'>
                    {PERIODS.map((p) => (
                      <Chip
                        key={p.id}
                        active={period === p.id}
                        onClick={() => {
                          setPeriod(p.id);
                          setShowFullChart(false);
                        }}
                      >
                        {p.label}
                      </Chip>
                    ))}
                  </div>
                  <GenrePicker
                    selected={chartGenre}
                    available={availableGenres}
                    multiple={false}
                    allLabel='모든 장르'
                    onChange={setChartGenre}
                  />
                </div>
                {chart.length ? (
                  <>
                    <TrackList
                      songs={showFullChart ? chart : chart.slice(0, CHART_PREVIEW)}
                      rankBy={chartGenre.length ? 'position' : 'chart'}
                      showChange={period === 'today' || period === 'rising'}
                      isCurrent={isCurrent}
                      isPlaying={player.isPlaying}
                      onPlay={(s) => playOrToggle(s, chart)}
                    />
                    {chart.length > CHART_PREVIEW && (
                      <button
                        onClick={() => setShowFullChart((v) => !v)}
                        className='mt-4 px-4 text-sm font-bold text-subtle hover:text-white cursor-pointer'
                      >
                        {showFullChart ? '간단히 보기' : `${chart.length}곡 모두 보기`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className='text-subtle'>{PERIODS.find((p) => p.id === period)?.empty}</p>
                )}
              </section>
            </>
          )}

          <footer className='mx-4 md:mx-6 mt-6 py-8 border-t border-white/10 text-xs text-subtle flex flex-col gap-1'>
            <span>차트 출처: {data.sources.filter((s) => s.ok).map((s) => s.name).join(', ')}</span>
            <span>{formatUpdated(data.generatedAt)} 업데이트 · 재생은 YouTube, 30초 미리듣기는 Apple Music 제공</span>
          </footer>
        </main>

        <NowPlayingPanel player={player} />
      </div>
      <PlayerBar player={player} />
    </div>
  );
}

function SearchBox({ query, onChange }: { query: string; onChange: (q: string) => void }) {
  return (
    <form role='search' onSubmit={(e) => e.preventDefault()} className='relative w-full max-w-[420px] lg:mx-auto'>
      <MagnifyingGlassIcon className='w-5 h-5 text-subtle absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none' />
      <input
        type='search'
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder='어떤 곡을 듣고 싶으세요?'
        aria-label='곡명, 가수 검색'
        className='w-full h-11 rounded-full bg-chip hover:bg-[#333] pl-12 pr-10 text-sm placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-white [&::-webkit-search-cancel-button]:hidden'
      />
      {query && (
        <button
          type='button'
          aria-label='검색어 지우기'
          onClick={() => onChange('')}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-white cursor-pointer'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      )}
    </form>
  );
}

// 오늘의 추천 앞 4곡 앨범아트로 만든 플레이리스트 커버
function Cover({ songs }: { songs: RankedSong[] }) {
  const covers = songs.slice(0, 4);
  return (
    <div className='w-44 h-44 @2xl:w-52 @2xl:h-52 @6xl:w-58 @6xl:h-58 shrink-0 self-center @2xl:self-auto rounded-md overflow-hidden shadow-[0_4px_60px_rgba(0,0,0,.5)] bg-highlight grid grid-cols-2'>
      {covers.length === 4 ? (
        covers.map((s) => <Image key={s.key} src={s.artwork} alt='' width={120} height={120} className='w-full h-full object-cover' />)
      ) : covers[0] ? (
        <Image src={covers[0].artwork} alt='' width={240} height={240} className='col-span-2 w-full h-full object-cover' />
      ) : null}
    </div>
  );
}

function TrackList({
  songs,
  rankBy = 'position',
  showChange,
  isCurrent,
  isPlaying,
  onPlay,
}: {
  songs: RankedSong[];
  rankBy?: 'chart' | 'position';
  showChange?: boolean;
  isCurrent: (song: RankedSong) => boolean;
  isPlaying: boolean;
  onPlay: (song: RankedSong) => void;
}) {
  return (
    <div>
      <div className={clsx(TRACK_GRID, 'hidden @2xl:grid h-9 mb-2 border-b border-white/10 text-sm text-subtle')}>
        <span className='text-center'>#</span>
        <span>제목</span>
        <span>장르</span>
        <span className='hidden @5xl:block'>듣기</span>
      </div>
      <ol>
        {songs.map((song, i) => (
          <TrackRow
            key={song.key}
            song={song}
            rank={rankBy === 'chart' ? song.rank : i + 1}
            showChange={showChange}
            isCurrent={isCurrent(song)}
            isPlaying={isPlaying}
            onPlay={onPlay}
          />
        ))}
      </ol>
    </div>
  );
}

function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00Z`);
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()];
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${day})`;
}

// 서버 빌드와 브라우저에서 같은 문자열이 나오도록 직접 한국 시간으로 변환
function formatUpdated(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString();
  return `${kst.slice(0, 10).replaceAll('-', '.')} ${kst.slice(11, 16)}`;
}
