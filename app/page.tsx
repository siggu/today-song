'use client';

import { HeartIcon, MagnifyingGlassIcon, PlayIcon, UserIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';
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
  const [isLogin, setIsLogin] = useState(false);
  const [isLiked, setIsLiked] = useState<{ [key: number]: boolean }>({});

  const toggleLike = (songId: number) => {
    setIsLiked((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  return (
    <div className='font-jua bg-purple-50 min-h-screen'>
      <header className='bg-white w-full py-5 px-6'>
        <div className='max-w-[1440px] mx-auto'>
          <div className='flex justify-between items-center'>
            <div className='text-4xl font-bold'>오늘의 노래</div>
            <div className='flex items-center gap-2 w-[60%]'>
              <input
                type='text'
                placeholder='노래 검색'
                className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none'
              />
              <button className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'>
                <MagnifyingGlassIcon className='w-6 h-6' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              {isLogin ? (
                <button className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'>
                  <UserIcon className='w-6 h-6' />
                </button>
              ) : (
                <button className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'>로그인</button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className='max-w-[1440px] mx-auto px-6'>
        <section className='bg-purple-50 w-full mt-6 mx-auto py-4'>
          <div className='flex flex-col justify-between items-center gap-5'>
            <div className='flex flex-col justify-center items-center gap-2'>
              <div className='text-4xl'>오늘의 곡</div>
              <div className='text-md text-gray-500'>유저들이 선정한 오늘의 특별한 음악들을 만나보세요</div>
            </div>
            <div className='flex gap-2'>
              <button className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'>
                내 곡 선정하기
              </button>
              <button className='border-2 border-purple-500 bg-white text-purple-500 rounded-full px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                내 곡 보기
              </button>
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
                    <div key={song.id} className='relative'>
                      <div className='flex flex-col rounded-3xl shadow-lg p-4 gap-3 hover:shadow-xl transition-shadow-lg duration-300 cursor-pointer group'>
                        <div className='absolute z-10 top-[10px] left-1 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                          {index + 1}
                        </div>
                        <div className='relative mb-3'>
                          <Image
                            src={song.image}
                            alt={song.title}
                            width={200}
                            height={200}
                            className='w-full aspect-square object-cover rounded-xl'
                          />
                          <div className='absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <button className='bg-white/90 hover:bg-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300 cursor-pointer'>
                              <PlayIcon className='w-6 h-6 text-purple-600' />
                            </button>
                          </div>
                          <button
                            onClick={() => toggleLike(song.id)}
                            className={`absolute top-2 right-2 rounded-full p-2 transition-all duration-300 shadow-md cursor-pointer ${
                              isLiked[song.id]
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                                : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
                            }`}
                          >
                            <HeartIcon className='w-4 h-4' />
                          </button>
                        </div>
                        <div className='flex flex-col gap-1 border-b-2 border-gray-200'>
                          <div className='text-lg text-ellipsis line-clamp-1'>{song.title}</div>
                          <div className='text-sm text-ellipsis line-clamp-1 text-gray-500 mb-3'>{song.artist}</div>
                        </div>
                        <div className='flex justify-between'>
                          <div className='flex items-center gap-2 rounded-2xl'>
                            <Image
                              src={song.userImage}
                              alt={song.username}
                              width={40}
                              height={40}
                              className='w-10 h-10 rounded-full'
                            />
                            <span className='text-sm'>{song.username}</span>
                          </div>
                          <div className='flex gap-3 justify-center items-center'>
                            <div className='flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full'>
                              <HeartIcon className='w-3 h-3 text-purple-500' />
                              <span className='text-xs font-medium text-purple-600'>{song.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                <div
                  key={song.id}
                  className='flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100 cursor-pointer'
                >
                  <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-300 text-white rounded-full text-sm font-bold'>
                    {index + 1}
                  </div>
                  <div className='relative'>
                    <Image
                      src={song.image}
                      alt={song.title}
                      width={60}
                      height={60}
                      className='object-cover rounded-xl'
                    />
                  </div>
                  <div className='flex-1'>
                    <div className='text-lg font-medium text-ellipsis line-clamp-1'>{song.title}</div>
                    <div className='text-sm text-gray-500 text-ellipsis line-clamp-1'>{song.artist}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={song.userImage}
                      alt={song.username}
                      width={32}
                      height={32}
                      className='w-8 h-8 rounded-full'
                    />
                    <span className='text-sm text-gray-600'>{song.username}</span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full'>
                      <HeartIcon className='w-3 h-3 text-purple-500' />
                      <span className='text-xs font-medium text-purple-600'>{song.likes}</span>
                    </div>
                    <button
                      onClick={() => toggleLike(song.id)}
                      className={`rounded-full p-2 transition-all duration-300 shadow-md cursor-pointer ${
                        isLiked[song.id]
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                          : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
                      }`}
                    >
                      <HeartIcon className='w-4 h-4' />
                    </button>
                  </div>
                </div>
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
              {songs.slice(0, 4).map((song, index) => (
                <div key={song.id} className='group relative cursor-pointer'>
                  <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer'>
                    <div className='relative mb-3'>
                      <Image
                        src={song.image}
                        alt={song.title}
                        width={200}
                        height={200}
                        className='w-full aspect-square object-cover rounded-xl'
                      />
                      <div className='absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                        <button className='bg-white/90 hover:bg-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300 cursor-pointer'>
                          <PlayIcon className='w-6 h-6 text-purple-600' />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleLike(song.id)}
                        className={`absolute top-2 right-2 rounded-full p-2 transition-all duration-300 shadow-md cursor-pointer ${
                          isLiked[song.id]
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                            : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
                        }`}
                      >
                        <HeartIcon className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='mb-3'>
                      <div className='text-md font-medium text-ellipsis line-clamp-1 text-gray-800'>{song.title}</div>
                      <div className='text-xs text-ellipsis line-clamp-1 text-gray-600'>{song.artist}</div>
                    </div>
                    <div className='flex items-center justify-between text-xs text-gray-600'>
                      <div className='flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full'>
                        <HeartIcon className='w-3 h-3 text-purple-500' />
                        <span className='text-xs font-medium text-purple-600'>{song.likes}</span>
                      </div>
                      <div className='text-purple-600 font-medium'>내 선택</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
