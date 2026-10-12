'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { BackwardIcon, ForwardIcon, XMarkIcon } from '@heroicons/react/16/solid';
import type { RankedSong } from '@/lib/types';
import PlatformLinks from '../ui/PlatformLinks';
import YouTubePlayer from './YouTubePlayer';

interface PlayerProps {
  song: RankedSong;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

// 재생 우선순위: YouTube 전곡 → 30초 미리듣기 → 외부 링크
export default function Player({ song, hasPrev, hasNext, onPrev, onNext, onClose }: PlayerProps) {
  const [failedVideos, setFailedVideos] = useState<Set<string>>(new Set());
  const useYoutube = !!song.youtubeId && !failedVideos.has(song.youtubeId);
  const mode = useYoutube ? 'youtube' : song.previewUrl ? 'preview' : 'link';

  const handleEnded = useCallback(() => {
    if (hasNext) onNext();
  }, [hasNext, onNext]);

  const handleYoutubeError = useCallback(() => {
    if (song.youtubeId) setFailedVideos((prev) => new Set(prev).add(song.youtubeId!));
  }, [song.youtubeId]);

  return (
    <div className='fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'>
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5'>
        {/* YouTube 약관상 플레이어는 최소 200x200 이상 보이게 유지 */}
        {mode === 'youtube' ? (
          <div className='w-full sm:w-[356px] aspect-video sm:aspect-auto sm:h-[200px] shrink-0 rounded-xl overflow-hidden bg-black'>
            <YouTubePlayer videoId={song.youtubeId!} onEnded={handleEnded} onError={handleYoutubeError} />
          </div>
        ) : (
          <Image
            src={song.artwork}
            alt=''
            width={80}
            height={80}
            className='hidden sm:block w-20 h-20 rounded-xl object-cover shrink-0'
          />
        )}

        <div className='flex-1 min-w-0 flex flex-col gap-2'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <div className='text-lg line-clamp-1'>{song.title}</div>
              <div className='text-sm text-gray-500 line-clamp-1'>{song.artist}</div>
            </div>
            <div className='flex items-center gap-1 shrink-0'>
              <IconButton label='이전 곡' disabled={!hasPrev} onClick={onPrev}>
                <BackwardIcon className='w-5 h-5' />
              </IconButton>
              <IconButton label='다음 곡' disabled={!hasNext} onClick={onNext}>
                <ForwardIcon className='w-5 h-5' />
              </IconButton>
              <IconButton label='플레이어 닫기' onClick={onClose}>
                <XMarkIcon className='w-5 h-5' />
              </IconButton>
            </div>
          </div>

          {mode === 'preview' && (
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-purple-600'>
                {song.youtubeId ? '이 영상은 사이트에서 재생할 수 없어 ' : ''}30초 미리듣기 · 전곡은 아래 링크에서 들을 수 있어요
              </span>
              <audio key={song.previewUrl} src={song.previewUrl} controls autoPlay onEnded={handleEnded} className='w-full h-10' />
            </div>
          )}
          {mode === 'link' && (
            <span className='text-sm text-gray-500'>이 곡은 사이트에서 바로 재생할 수 없어요. 아래 링크에서 들어보세요.</span>
          )}

          <PlatformLinks song={song} />
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className='p-2 rounded-full text-purple-600 hover:bg-purple-100 disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default'
    >
      {children}
    </button>
  );
}
