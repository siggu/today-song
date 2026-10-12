import Image from 'next/image';
import { clsx } from 'clsx';
import { PlayIcon } from '@heroicons/react/24/solid';
import { genreLabel } from '@/lib/genres';
import type { RankedSong } from '@/lib/types';
import PlatformLinks from './PlatformLinks';

interface TrackRowProps {
  song: RankedSong;
  rank: number;
  showChange?: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (song: RankedSong) => void;
}

// 본문 영역(@container) 너비에 따라 장르, 듣기 열을 보여줌
export const TRACK_GRID =
  'grid grid-cols-[32px_minmax(0,1fr)_auto] @2xl:grid-cols-[40px_minmax(0,4fr)_minmax(0,1.5fr)] @5xl:grid-cols-[40px_minmax(0,4fr)_minmax(0,1.2fr)_minmax(0,2.4fr)] gap-3 @2xl:gap-4 items-center px-2 @2xl:px-4';

// 스포티파이 트랙 리스트처럼: 마우스를 올리면 순위가 재생 버튼으로 바뀜
export default function TrackRow({ song, rank, showChange, isCurrent, isPlaying, onPlay }: TrackRowProps) {
  return (
    <li
      onClick={() => onPlay(song)}
      className={clsx(TRACK_GRID, 'group h-16 rounded-md hover:bg-white/10 cursor-pointer', isCurrent && 'bg-white/5')}
    >
      <div className='flex flex-col items-center justify-center'>
        <button
          aria-label={`${song.title} 재생`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          className='w-6 h-6 flex items-center justify-center cursor-pointer'
        >
          {isCurrent && isPlaying ? (
            <Equalizer />
          ) : (
            <>
              <span className={clsx('group-hover:hidden tabular-nums', isCurrent ? 'text-accent' : 'text-subtle')}>{rank}</span>
              <PlayIcon className='w-4 h-4 hidden group-hover:block' />
            </>
          )}
        </button>
        {showChange && <ChangeBadge change={song.change} />}
      </div>

      <div className='flex items-center gap-3 min-w-0'>
        <Image src={song.artwork} alt='' width={40} height={40} className='w-10 h-10 rounded object-cover shrink-0' />
        <div className='min-w-0'>
          <div className={clsx('line-clamp-1', isCurrent ? 'text-accent' : 'text-white')}>{song.title}</div>
          <div className='text-sm text-subtle line-clamp-1'>
            <span className='mr-1'>{song.region === 'kr' ? '🇰🇷' : '🌍'}</span>
            {song.artist}
          </div>
        </div>
      </div>

      <span className='hidden @2xl:block text-sm text-subtle line-clamp-1'>{genreLabel(song.genre)}</span>

      <PlatformLinks song={song} wrap={false} className='hidden @5xl:flex' />
      <span className='@2xl:hidden text-xs text-subtle'>{genreLabel(song.genre)}</span>
    </li>
  );
}

function ChangeBadge({ change }: { change: RankedSong['change'] }) {
  if (change === 'new') return <span className='text-[10px] font-bold text-accent leading-none'>NEW</span>;
  if (!change) return <span className='text-[10px] text-muted leading-none'>–</span>;
  return change > 0 ? (
    <span className='text-[10px] text-accent leading-none'>▲{change}</span>
  ) : (
    <span className='text-[10px] text-[#f15e6c] leading-none'>▼{-change}</span>
  );
}

function Equalizer() {
  return (
    <span className='flex items-end gap-[2px] h-3.5' aria-hidden>
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className='w-[3px] bg-accent rounded-sm animate-[eq_0.9s_ease-in-out_infinite]'
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
