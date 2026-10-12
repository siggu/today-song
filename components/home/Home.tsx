'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { PlayIcon } from '@heroicons/react/16/solid';
import Header from '@/components/common/Header';
import Button from '@/components/common/Button';
import GenrePicker from '@/components/ui/GenrePicker';
import SongCard from '@/components/ui/SongCard';
import Player from '@/components/player/Player';
import { GENRE_IDS, type GenreId } from '@/lib/genres';
import type { ChartPeriod, RankedSong, SiteData } from '@/lib/types';

const PREFS_KEY = 'today-song:genres';
const CHART_PREVIEW = 20;

const PERIODS: { id: ChartPeriod; label: string; empty: string }[] = [
  { id: 'today', label: '오늘', empty: '오늘 차트가 아직 없어요.' },
  { id: 'week', label: '이번 주', empty: '이번 주 데이터가 아직 없어요.' },
  { id: 'month', label: '이번 달', empty: '이번 달 데이터가 아직 없어요.' },
  { id: 'rising', label: '🔥 급상승', empty: '급상승 차트는 이틀 이상 데이터가 쌓이면 보여드려요.' },
];

export default function Home({ data }: { data: SiteData }) {
  const [prefs, setPrefs] = useState<GenreId[]>([]);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<ChartPeriod>('today');
  const [chartGenre, setChartGenre] = useState<GenreId[]>([]);
  const [showFullChart, setShowFullChart] = useState(false);
  const [queue, setQueue] = useState<RankedSong[]>([]);
  const [index, setIndex] = useState<number | null>(null);

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

  const play = (song: RankedSong, list: RankedSong[]) => {
    setQueue(list);
    setIndex(Math.max(list.findIndex((s) => s.key === song.key), 0));
  };
  const current = index !== null ? queue[index] : undefined;
  const isPlaying = (song: RankedSong) => current?.key === song.key;

  const next = useCallback(() => setIndex((i) => (i !== null && i < queue.length - 1 ? i + 1 : i)), [queue.length]);
  const prev = useCallback(() => setIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);

  if (!data.generatedAt) {
    return (
      <div className='font-jua bg-purple-50 min-h-screen'>
        <Header />
        <main className='max-w-[720px] mx-auto px-6 py-24 text-center flex flex-col gap-4'>
          <div className='text-4xl'>🎵</div>
          <div className='text-2xl'>아직 수집된 차트가 없어요</div>
          <p className='text-gray-500'>
            매일 아침 6시(한국 시간)에 인기 차트를 모아 오늘의 노래를 골라드려요.
            <br />
            직접 수집하려면 <code className='bg-white px-2 py-0.5 rounded'>npm run collect</code> 를 실행하세요.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={clsx('font-jua bg-purple-50 min-h-screen', current && 'pb-[440px] sm:pb-[250px]')}>
      <Header query={query} onQueryChange={setQuery} />
      <main className='max-w-[1440px] mx-auto px-4 sm:px-6'>
        <section className='w-full mt-6 py-4 flex flex-col items-center gap-2 text-center'>
          <div className='text-sm text-purple-500'>{formatDate(data.date)}</div>
          <h1 className='text-4xl'>오늘의 노래</h1>
          <p className='text-md text-gray-500'>한국 차트 80% · 글로벌 차트 20% 인기곡 중에서 매일 새로 골라드려요</p>
        </section>

        {query.trim() && (
          <section className='w-full mt-4'>
            <div className='bg-white rounded-3xl p-5 sm:p-10'>
              <h2 className='text-2xl mb-4'>🔍 &lsquo;{query.trim()}&rsquo; 검색 결과</h2>
              {searchResults.length ? (
                <ol className='space-y-3'>
                  {searchResults.map((song) => (
                    <SongCard
                      key={song.key}
                      song={song}
                      variant='list'
                      isPlaying={isPlaying(song)}
                      onPlay={(s) => play(s, searchResults)}
                    />
                  ))}
                </ol>
              ) : (
                <p className='text-gray-500'>최근 한 달 인기곡 중에는 검색 결과가 없어요.</p>
              )}
            </div>
          </section>
        )}

        <section className='w-full mt-6'>
          <div className='bg-white rounded-3xl p-5 sm:p-10 flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2 className='text-2xl'>👑 오늘의 추천</h2>
                {picks.length > 0 && (
                  <Button onClick={() => play(picks[0], picks)} className='flex items-center gap-1'>
                    <PlayIcon className='w-4 h-4' /> 전체 재생
                  </Button>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <span className='text-sm text-gray-500'>내 취향 장르를 고르면 추천이 바뀌어요 (이 브라우저에 저장돼요)</span>
                <GenrePicker selected={prefs} available={availableGenres} allLabel='전체 장르' onChange={updatePrefs} />
              </div>
            </div>
            {picks.length ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                {picks.map((song) => (
                  <SongCard key={song.key} song={song} isPlaying={isPlaying(song)} onPlay={(s) => play(s, picks)} />
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>선택한 장르의 추천곡이 오늘은 없어요. 다른 장르를 골라보세요.</p>
            )}
          </div>
        </section>

        <section className='w-full mt-6 mb-8'>
          <div className='bg-white rounded-3xl p-5 sm:p-10 flex flex-col gap-4'>
            <h2 className='text-2xl'>📈 인기 차트</h2>
            <div className='flex flex-wrap gap-2 border-b border-gray-100 pb-3'>
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPeriod(p.id);
                    setShowFullChart(false);
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-full cursor-pointer transition-colors',
                    period === p.id ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-50',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <GenrePicker selected={chartGenre} available={availableGenres} multiple={false} onChange={setChartGenre} />
            {chart.length ? (
              <>
                <ol className='space-y-3'>
                  {(showFullChart ? chart : chart.slice(0, CHART_PREVIEW)).map((song, i) => (
                    <SongCard
                      key={song.key}
                      song={song}
                      variant='list'
                      rank={chartGenre.length ? i + 1 : song.rank}
                      showChange={period === 'today' || period === 'rising'}
                      isPlaying={isPlaying(song)}
                      onPlay={(s) => play(s, chart)}
                    />
                  ))}
                </ol>
                {chart.length > CHART_PREVIEW && (
                  <Button variant='secondary' onClick={() => setShowFullChart((v) => !v)} className='self-center'>
                    {showFullChart ? '접기' : `전체 ${chart.length}곡 보기`}
                  </Button>
                )}
              </>
            ) : (
              <p className='text-gray-500'>{PERIODS.find((p) => p.id === period)?.empty}</p>
            )}
          </div>
        </section>

        <footer className='text-xs text-gray-400 text-center pb-10 flex flex-col gap-1'>
          <span>
            차트 출처: {data.sources.filter((s) => s.ok).map((s) => s.name).join(', ')}
          </span>
          <span>
            {formatUpdated(data.generatedAt)} 업데이트 · 재생은 YouTube, 30초 미리듣기는 Apple Music 제공
          </span>
        </footer>
      </main>

      {current && (
        <Player
          song={current}
          hasPrev={index! > 0}
          hasNext={index! < queue.length - 1}
          onPrev={prev}
          onNext={next}
          onClose={() => setIndex(null)}
        />
      )}
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
