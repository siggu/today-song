'use client';

import Header from '@/public/components/common/Header';
import Button from '@/public/components/common/Button';
import SongCard from '@/public/components/ui/SongCard';
import { useState } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  image: string;
  username: string;
  userImage: string;
  uploadedAt?: Date;
  likes?: number;
}

const songs: Song[] = [
  {
    id: 1,
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    image: 'https://picsum.photos/700/700',
    username: 'user1',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-01T12:00:00Z'),
    likes: 120,
  },
  {
    id: 2,
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    image: 'https://picsum.photos/700/700',
    username: 'user2',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-02T12:00:00Z'),
    likes: 95,
  },
  {
    id: 3,
    title: 'Butter',
    artist: 'BTS',
    image: 'https://picsum.photos/700/700',
    username: 'user3',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-03T12:00:00Z'),
    likes: 150,
  },
  {
    id: 4,
    title: 'Dynamite',
    artist: 'BTS',
    image: 'https://picsum.photos/700/700',
    username: 'user4',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-04T12:00:00Z'),
    likes: 200,
  },
  {
    id: 5,
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    image: 'https://picsum.photos/700/700',
    username: 'user5',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-05T12:00:00Z'),
    likes: 180,
  },
  {
    id: 6,
    title: 'Rolling in the Deep',
    artist: 'Adele',
    image: 'https://picsum.photos/700/700',
    username: 'user6',
    userImage: 'https://picsum.photos/700/700',
    uploadedAt: new Date('2023-10-06T12:00:00Z'),
    likes: 160,
  },
];

export default function Home() {
  const [isLogin] = useState(false);
  const [isLiked, setIsLiked] = useState<{ [key: number]: boolean }>({});

  const toggleLike = (songId: number) => {
    setIsLiked((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  return (
    <div className='font-jua bg-purple-50 min-h-screen'>
      <Header isLogin={isLogin} />
      <main className='max-w-[1440px] mx-auto px-6'>
        <section className='bg-purple-50 w-full mt-6 mx-auto py-4'>
          <div className='flex flex-col justify-between items-center gap-5'>
            <div className='flex flex-col justify-center items-center gap-2'>
              <div className='text-4xl'>오늘의 곡</div>
              <div className='text-md text-gray-500'>유저들이 선정한 오늘의 특별한 음악들을 만나보세요</div>
            </div>
            <div className='flex gap-2'>
              <Button>내 곡 선정하기</Button>
              <Button variant='secondary'>내 곡 보기</Button>
            </div>
          </div>
        </section>
        {/* 오늘의 곡 TOP 3 */}
        <section className='w-full mt-6 mx-auto py-4'>
          <div className='bg-white rounded-3xl p-10'>
            <div>
              <div className='text-2xl font-semibold mb-4'>👑 오늘의 곡 TOP 3</div>
              <div className='grid grid-cols-3 gap-6'>
                {songs
                  .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                  .slice(0, 3)
                  .map((song, index) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      variant='top3'
                      rank={index + 1}
                      isLiked={isLiked[song.id]}
                      onLikeToggle={toggleLike}
                    />
                  ))}
              </div>
            </div>
          </div>
        </section>
        {/* 실시간 오늘의 곡 */}
        <section className='w-full mt-6 mx-auto py-4'>
          <div className='bg-white rounded-3xl p-10'>
            <div className='flex justify-between items-center mb-4'>
              <div className='text-2xl font-semibold'>🔥 실시간 오늘의 곡</div>
              <div className='text-purple-500 cursor-pointer hover:text-purple-600'>전체 보기</div>
            </div>
            <div className='space-y-4'>
              {songs.slice(0, 5).map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  variant='list'
                  rank={index + 1}
                  isLiked={isLiked[song.id]}
                  onLikeToggle={toggleLike}
                />
              ))}
            </div>
          </div>
        </section>
        {/* 내가 선정한 곡 */}
        <section className='w-full mt-6 mx-auto py-4 mb-8'>
          <div className='bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-10'>
            <div className='flex justify-between items-center mb-6'>
              <div className='text-2xl font-semibold text-purple-800'>💜 내가 선정한 곡</div>
              <div className='text-purple-600 cursor-pointer hover:text-purple-700 font-medium'>전체 보기</div>
            </div>
            <div className='grid grid-cols-4 gap-4'>
              {songs.slice(0, 4).map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  variant='grid'
                  isLiked={isLiked[song.id]}
                  onLikeToggle={toggleLike}
                  showUserInfo={false}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
