import Image from 'next/image';
import { clsx } from 'clsx';
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { genreLabel } from '@/lib/genres';
import type { RankedSong } from '@/lib/types';

interface PickCardProps {
  song: RankedSong;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (song: RankedSong) => void;
}

export default function PickCard({ song, isCurrent, isPlaying, onPlay }: PickCardProps) {
  return (
    <button
      onClick={() => onPlay(song)}
      aria-label={`${song.title} ${isCurrent && isPlaying ? '일시정지' : '재생'}`}
      className='group text-left p-3 rounded-md bg-elevated hover:bg-highlight transition-colors duration-300 cursor-pointer flex flex-col gap-3 min-w-0'
    >
      <div className='relative'>
        <Image
          src={song.artwork}
          alt=''
          width={300}
          height={300}
          className='w-full aspect-square object-cover rounded-md shadow-[0_8px_24px_rgba(0,0,0,.5)]'
        />
        <span
          className={clsx(
            'absolute bottom-2 right-2 w-12 h-12 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_8px_8px_rgba(0,0,0,.3)] transition-all duration-300 group-hover:scale-105',
            isCurrent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
          )}
        >
          {isCurrent && isPlaying ? <PauseIcon className='w-6 h-6' /> : <PlayIcon className='w-6 h-6 ml-0.5' />}
        </span>
      </div>
      <div className='min-w-0'>
        <div className={clsx('font-bold line-clamp-1', isCurrent && 'text-accent')}>{song.title}</div>
        <div className='text-sm text-subtle line-clamp-1'>{song.artist}</div>
        <div className='text-xs text-muted mt-1 line-clamp-1'>
          {song.region === 'kr' ? '한국' : '글로벌'} · {genreLabel(song.genre)}
        </div>
      </div>
    </button>
  );
}
