'use client';

import { useEffect, useRef } from 'react';

// YouTube IFrame Player API 중 이 사이트에서 쓰는 부분만 타입 선언
interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width: string;
      height: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const ENDED = 0;

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT!);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        apiPromise = null;
        reject(new Error('YouTube 플레이어를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

interface YouTubePlayerProps {
  videoId: string;
  onEnded: () => void;
  // 101/150: 퍼가기 금지 영상, 100: 삭제/비공개 영상, -1: API 로드 실패
  onError: (code: number) => void;
}

export default function YouTubePlayer({ videoId, onEnded, onError }: YouTubePlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  // 플레이어 준비 전에 다른 곡이 선택되면 준비된 뒤 재생
  const pendingRef = useRef<string | null>(null);
  const handlers = useRef({ onEnded, onError });

  useEffect(() => {
    handlers.current = { onEnded, onError };
  }, [onEnded, onError]);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        if (playerRef.current) {
          if (readyRef.current) playerRef.current.loadVideoById(videoId);
          else pendingRef.current = videoId;
          return;
        }
        const target = document.createElement('div');
        hostRef.current.appendChild(target);
        playerRef.current = new YT.Player(target, {
          videoId,
          width: '100%',
          height: '100%',
          host: 'https://www.youtube-nocookie.com',
          playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: (e) => {
              readyRef.current = true;
              const pending = pendingRef.current;
              pendingRef.current = null;
              if (pending && pending !== videoId) e.target.loadVideoById(pending);
              else e.target.playVideo();
            },
            onStateChange: (e) => {
              if (e.data === ENDED) handlers.current.onEnded();
            },
            onError: (e) => handlers.current.onError(e.data),
          },
        });
      })
      .catch(() => {
        if (!cancelled) handlers.current.onError(-1);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    },
    [],
  );

  return <div ref={hostRef} className='w-full h-full [&>iframe]:w-full [&>iframe]:h-full' />;
}
