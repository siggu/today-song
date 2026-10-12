import Image from 'next/image';
import { clsx } from 'clsx';
import { PlayIcon } from '@heroicons/react/16/solid';
import { genreLabel } from '@/lib/genres';
import type { RankedSong } from '@/lib/types';
import PlatformLinks from './PlatformLinks';

interface SongCardProps {
  song: RankedSong;
  variant?: 'pick' | 'list';
  rank?: number;
  showChange?: boolean;
  isPlaying?: boolean;
  onPlay: (song: RankedSong) => void;
}

export default function SongCard({ song, variant = 'pick', rank, showChange, isPlaying, onPlay }: SongCardProps) {
  if (variant === 'list') {
    return (
      <li
        className={clsx(
          'flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition-colors duration-200',
          isPlaying ? 'border-purple-300 bg-purple-50' : 'border-gray-100 hover:bg-gray-50',
        )}
      >
        {rank !== undefined && (
          <div className='flex flex-col items-center w-8 shrink-0'>
            <span className='text-lg font-bold text-purple-600'>{rank}</span>
            {showChange && <ChangeBadge change={song.change} />}
          </div>
        )}
        <button
          onClick={() => onPlay(song)}
          aria-label={`${song.title} 재생`}
          className='relative shrink-0 cursor-pointer group'
        >
          <Image src={song.artwork} alt='' width={56} height={56} className='w-14 h-14 object-cover rounded-xl' />
          <span className='absolute inset-0 rounded-xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <PlayIcon className='w-6 h-6 text-white' />
          </span>
        </button>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1.5'>
            <RegionFlag region={song.region} />
            <span className='text-base sm:text-lg line-clamp-1'>{song.title}</span>
          </div>
          <div className='text-sm text-gray-500 line-clamp-1'>{song.artist}</div>
          <PlatformLinks song={song} className='mt-1' />
        </div>
        <span className='hidden md:inline-block shrink-0 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full'>
          {genreLabel(song.genre)}
        </span>
        <PlayButton isPlaying={isPlaying} onClick={() => onPlay(song)} label={song.title} />
      </li>
    );
  }

  return (
    <article
      className={clsx(
        'flex flex-col rounded-3xl bg-white shadow-md p-3 gap-2 hover:shadow-xl transition-shadow duration-300',
        isPlaying && 'ring-2 ring-purple-400',
      )}
    >
      <button onClick={() => onPlay(song)} className='relative group cursor-pointer text-left' aria-label={`${song.title} 재생`}>
        <Image
          src={song.artwork}
          alt=''
          width={300}
          height={300}
          className='w-full aspect-square object-cover rounded-2xl'
        />
        <span className='absolute top-2 left-2 text-[11px] bg-white/90 text-purple-600 px-2 py-0.5 rounded-full'>
          {genreLabel(song.genre)}
        </span>
        <span className='absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
          <span className='bg-white/90 rounded-full p-3 shadow-md'>
            <PlayIcon className='w-6 h-6 text-purple-600' />
          </span>
        </span>
        {isPlaying && (
          <span className='absolute bottom-2 right-2 text-[11px] bg-purple-500 text-white px-2 py-0.5 rounded-full'>
            재생 중
          </span>
        )}
      </button>
      <div className='min-w-0 px-1'>
        <div className='flex items-center gap-1.5'>
          <RegionFlag region={song.region} />
          <span className='text-base line-clamp-1'>{song.title}</span>
        </div>
        <div className='text-sm text-gray-500 line-clamp-1'>{song.artist}</div>
      </div>
      <PlatformLinks song={song} className='px-1' />
    </article>
  );
}

function PlayButton({ isPlaying, onClick, label }: { isPlaying?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} 재생`}
      className={clsx(
        'shrink-0 rounded-full p-2 shadow-md transition-all cursor-pointer',
        isPlaying ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white text-purple-500 hover:scale-105',
      )}
    >
      <PlayIcon className='w-5 h-5' />
    </button>
  );
}

function RegionFlag({ region }: { region: RankedSong['region'] }) {
  return (
    <span title={region === 'kr' ? '한국 차트' : '글로벌 차트'} className='shrink-0 text-sm'>
      {region === 'kr' ? '🇰🇷' : '🌍'}
    </span>
  );
}

function ChangeBadge({ change }: { change: RankedSong['change'] }) {
  if (change === 'new') return <span className='text-[10px] font-bold text-pink-500'>NEW</span>;
  if (!change) return <span className='text-[10px] text-gray-300'>-</span>;
  return change > 0 ? (
    <span className='text-[10px] text-red-500'>▲{change}</span>
  ) : (
    <span className='text-[10px] text-blue-500'>▼{-change}</span>
  );
}
