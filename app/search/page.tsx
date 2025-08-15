'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/public/components/common/Header';
import { searchYouTubeVideos, YouTubeVideo, formatDuration, formatViewCount } from '@/app/lib/youtube';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/16/solid';
import YouTubePlayerModal from '@/public/components/ui/YouTubePlayerModal';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchYouTubeVideos(searchQuery);
      setVideos(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openYouTubeVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className='font-jua bg-purple-50 min-h-screen'>
      <Header isLogin={false} />
      <main className='max-w-[1440px] mx-auto px-6 py-6'>
        <div className='bg-white rounded-3xl p-10'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold mb-2'>검색 결과</h1>
            {query && (
              <p className='text-gray-600'>
                &quot;<span className='font-medium text-purple-600'>{query}</span>&quot;에 대한 검색 결과
              </p>
            )}
          </div>

          {loading && (
            <div className='flex justify-center items-center py-20'>
              <div className='text-xl text-gray-500'>검색 중...</div>
            </div>
          )}

          {error && (
            <div className='flex justify-center items-center py-20'>
              <div className='text-xl text-red-500'>{error}</div>
            </div>
          )}

          {!loading && !error && videos.length === 0 && query && (
            <div className='flex justify-center items-center py-20'>
              <div className='text-xl text-gray-500'>검색 결과가 없습니다.</div>
            </div>
          )}

          {!loading && !error && videos.length > 0 && (
            <div className='space-y-4'>
              {videos.map((video, index) => (
                <div
                  key={`${video.videoId}-${index}`}
                  className='flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100 cursor-pointer'
                  onClick={() => openYouTubeVideo(video)}
                >
                  <div className='relative flex-shrink-0'>
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={320}
                      height={180}
                      className='object-cover rounded-xl'
                    />
                    <div className='absolute inset-0 bg-black/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                      <PlayIcon className='w-12 h-12 text-white' />
                    </div>
                    {video.duration && (
                      <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded'>
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-medium text-gray-900 line-clamp-2 mb-2'>
                      {video.title}
                    </h3>
                    <p className='text-sm text-gray-600 mb-2'>{video.channelTitle}</p>
                    <div className='flex items-center gap-4 text-sm text-gray-500 mb-3'>
                      <span>조회수 {formatViewCount(video.viewCount || '0')}회</span>
                      <span>
                        {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* YouTube Player Modal */}
      <YouTubePlayerModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}