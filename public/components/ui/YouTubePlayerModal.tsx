'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon, SpeakerWaveIcon, PlayIcon } from '@heroicons/react/16/solid';
import { YouTubeVideo } from '@/app/lib/youtube';

interface YouTubePlayerModalProps {
  video: YouTubeVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubePlayerModal({ video, isOpen, onClose }: YouTubePlayerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setShowPlayer(false);
    }
  }, [isOpen, video]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setShowPlayer(true);
  };

  if (!isOpen || !video) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div
        ref={modalRef}
        className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <SpeakerWaveIcon className='w-6 h-6 text-purple-600' />
            <h2 className='text-xl font-bold text-gray-900'>음악 재생</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <XMarkIcon className='w-6 h-6 text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Video Player */}
          <div className='relative w-full pb-[56.25%] mb-6 bg-black rounded-2xl overflow-hidden'>
            {!showPlayer ? (
              <div 
                className='absolute inset-0 bg-cover bg-center cursor-pointer'
                style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                onClick={handlePlayClick}
              >
                <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                  <div className='bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors transform hover:scale-110'>
                    <PlayIcon className='w-12 h-12 text-white ml-1' />
                  </div>
                </div>
                <div className='absolute bottom-4 left-4 right-4'>
                  <div className='bg-black/70 text-white px-3 py-2 rounded-lg text-sm'>
                    ▶ 클릭하여 재생하기
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                className='absolute top-0 left-0 w-full h-full'
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>

          {/* Video Info */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                {video.title}
              </h3>
              <p className='text-gray-600 font-medium'>{video.channelTitle}</p>
            </div>

            {video.description && (
              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>설명</h4>
                <p className='text-sm text-gray-600 line-clamp-3 leading-relaxed'>
                  {video.description}
                </p>
              </div>
            )}

            <div className='flex items-center gap-6 text-sm text-gray-500'>
              {video.viewCount && (
                <span>조회수: {parseInt(video.viewCount).toLocaleString()}회</span>
              )}
              <span>
                업로드: {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-500'>
              YouTube에서 재생 중
            </div>
            <button
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
              className='px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium'
            >
              YouTube에서 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}