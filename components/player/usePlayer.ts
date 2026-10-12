'use client';

import { useCallback, useRef, useState } from 'react';
import type { RankedSong } from '@/lib/types';

// 재생 바의 재생/일시정지 버튼이 YouTube 플레이어나 미리듣기 오디오를 조작할 때 사용
export interface MediaControls {
  toggle: () => void;
}

export type PlayMode = 'youtube' | 'preview' | 'link';

export function usePlayer() {
  const [queue, setQueue] = useState<RankedSong[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failedVideos, setFailedVideos] = useState<Set<string>>(new Set());
  const controlsRef = useRef<MediaControls | null>(null);

  const current = index !== null ? queue[index] : undefined;
  // 재생 우선순위: YouTube 전곡 → 30초 미리듣기 → 외부 링크
  const mode: PlayMode =
    current?.youtubeId && !failedVideos.has(current.youtubeId) ? 'youtube' : current?.previewUrl ? 'preview' : 'link';

  const play = useCallback((song: RankedSong, list: RankedSong[]) => {
    setQueue(list);
    setIndex(Math.max(list.findIndex((s) => s.key === song.key), 0));
  }, []);

  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < queue.length - 1;
  const next = useCallback(() => setIndex((i) => (i !== null && i < queue.length - 1 ? i + 1 : i)), [queue.length]);
  const prev = useCallback(() => setIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const close = useCallback(() => {
    setIndex(null);
    setIsPlaying(false);
  }, []);
  const toggle = useCallback(() => controlsRef.current?.toggle(), []);

  const onEnded = useCallback(() => {
    if (hasNext) next();
  }, [hasNext, next]);

  const onVideoError = useCallback(() => {
    const id = current?.youtubeId;
    if (id) setFailedVideos((prev) => new Set(prev).add(id));
  }, [current?.youtubeId]);

  return {
    current,
    mode,
    isPlaying,
    hasPrev,
    hasNext,
    controlsRef,
    play,
    next,
    prev,
    close,
    toggle,
    onEnded,
    onVideoError,
    setIsPlaying,
  };
}

export type PlayerState = ReturnType<typeof usePlayer>;
