'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { genreLabel } from '@/lib/genres';
import PlatformLinks from '../ui/PlatformLinks';
import type { PlayerState } from './usePlayer';
import YouTubePlayer from './YouTubePlayer';

// 오른쪽 "지금 재생 중" 패널 (모바일에서는 재생 바 위에 영상만 표시)
// YouTube 약관상 영상은 최소 200x200 이상 보이게 유지
export function NowPlayingPanel({ player }: { player: PlayerState }) {
  const { current: song, mode } = player;
  if (!song) return null;

  return (
    <aside className='shrink-0 bg-base lg:w-[360px] lg:rounded-lg lg:overflow-y-auto flex flex-col'>
      <div className='hidden lg:flex items-center justify-between px-4 pt-4 pb-3'>
        <span className='font-bold'>지금 재생 중</span>
        <button
          onClick={player.close}
          aria-label='재생 닫기'
          className='p-1.5 rounded-full text-subtle hover:text-white hover:bg-highlight cursor-pointer'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      </div>

      <div className='lg:px-4'>
        {mode === 'youtube' ? (
          <div className='w-full h-[200px] lg:h-auto lg:aspect-video bg-black lg:rounded-lg overflow-hidden'>
            <YouTubePlayer
              videoId={song.youtubeId!}
              onEnded={player.onEnded}
              onError={player.onVideoError}
              onPlayingChange={player.setIsPlaying}
              controlsRef={player.controlsRef}
            />
          </div>
        ) : (
          <>
            <Image
              src={song.artwork}
              alt=''
              width={360}
              height={360}
              className='hidden lg:block w-full aspect-square object-cover rounded-lg shadow-[0_8px_24px_rgba(0,0,0,.5)]'
            />
            {mode === 'preview' && <PreviewAudio player={player} />}
          </>
        )}
      </div>

      <div className='hidden lg:flex flex-col gap-4 p-4'>
        <div className='min-w-0'>
          <div className='text-2xl font-bold line-clamp-2'>{song.title}</div>
          <div className='text-subtle line-clamp-1'>{song.artist}</div>
        </div>
        {mode !== 'youtube' && (
          <p className='text-sm text-subtle bg-highlight rounded-lg p-3'>
            {mode === 'preview'
              ? `${song.youtubeId ? '이 영상은 사이트에서 재생할 수 없어 ' : ''}30초 미리듣기로 재생 중이에요. 전곡은 아래에서 들을 수 있어요.`
              : '이 곡은 사이트에서 바로 재생할 수 없어요. 아래에서 들어보세요.'}
          </p>
        )}
        <div className='bg-highlight rounded-lg p-4 flex flex-col gap-3'>
          <span className='font-bold'>다른 곳에서 듣기</span>
          <PlatformLinks song={song} size='md' />
        </div>
        <div className='bg-highlight rounded-lg p-4 flex flex-col gap-1 text-sm'>
          <span className='font-bold mb-1'>곡 정보</span>
          <Info label='장르' value={genreLabel(song.genre)} />
          <Info label='차트' value={song.region === 'kr' ? '한국 인기 차트' : '글로벌 인기 차트'} />
          {song.album && <Info label='앨범' value={song.album} />}
          {song.releaseDate && <Info label='발매일' value={song.releaseDate.replaceAll('-', '.')} />}
        </div>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex gap-3'>
      <span className='w-12 shrink-0 text-subtle'>{label}</span>
      <span className='line-clamp-1'>{value}</span>
    </div>
  );
}

function PreviewAudio({ player }: { player: PlayerState }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { controlsRef } = player;

  useEffect(() => {
    controlsRef.current = {
      toggle: () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
      },
    };
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef]);

  return (
    <div className='px-4 py-2 lg:px-0 lg:pt-3 lg:pb-0 flex flex-col gap-1'>
      <span className='text-xs text-accent lg:hidden'>30초 미리듣기</span>
      <audio
        ref={audioRef}
        key={player.current?.previewUrl}
        src={player.current?.previewUrl}
        controls
        autoPlay
        onPlay={() => player.setIsPlaying(true)}
        onPause={() => player.setIsPlaying(false)}
        onEnded={player.onEnded}
        className='w-full h-9 [color-scheme:dark]'
      />
    </div>
  );
}

// 하단 재생 바
export function PlayerBar({ player }: { player: PlayerState }) {
  const { current: song, mode, isPlaying } = player;
  if (!song) return null;

  return (
    <div className='shrink-0 h-[72px] lg:h-[80px] bg-black px-2 lg:px-4 flex items-center gap-3'>
      <div className='flex items-center gap-3 min-w-0 flex-1 lg:flex-none lg:w-[30%]'>
        <Image src={song.artwork} alt='' width={56} height={56} className='w-12 h-12 lg:w-14 lg:h-14 rounded object-cover' />
        <div className='min-w-0'>
          <div className='text-sm font-medium line-clamp-1'>{song.title}</div>
          <div className='text-xs text-subtle line-clamp-1'>
            {song.artist}
            {mode === 'preview' && <span className='ml-1.5 text-accent'>· 30초 미리듣기</span>}
          </div>
        </div>
      </div>

      <div className='flex items-center justify-center gap-2 lg:gap-4 lg:flex-1'>
        <BarButton label='이전 곡' disabled={!player.hasPrev} onClick={player.prev}>
          <BackwardIcon className='w-5 h-5' />
        </BarButton>
        <button
          onClick={player.toggle}
          disabled={mode === 'link'}
          aria-label={isPlaying ? '일시정지' : '재생'}
          className='w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-default'
        >
          {isPlaying ? <PauseIcon className='w-5 h-5' /> : <PlayIcon className='w-5 h-5 ml-0.5' />}
        </button>
        <BarButton label='다음 곡' disabled={!player.hasNext} onClick={player.next}>
          <ForwardIcon className='w-5 h-5' />
        </BarButton>
      </div>

      <div className='hidden lg:flex items-center justify-end gap-2 w-[30%]'>
        <PlatformLinks song={song} />
      </div>
      <BarButton label='재생 닫기' onClick={player.close} className='lg:hidden'>
        <XMarkIcon className='w-5 h-5' />
      </BarButton>
    </div>
  );
}

function BarButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 text-subtle hover:text-white disabled:text-muted disabled:hover:text-muted cursor-pointer disabled:cursor-default ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
