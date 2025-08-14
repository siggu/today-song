import React from 'react';
import Image from 'next/image';
import Button from '../common/Button';
import { HeartIcon, PlayIcon } from '@heroicons/react/16/solid';

interface Song {
  id: number;
  title: string;
  artist: string;
  image: string;
  username: string;
  userImage: string;
  likes?: number;
}

interface SongCardProps {
  song: Song;
  variant?: 'top3' | 'list' | 'grid';
  rank?: number;
  isLiked?: boolean;
  onLikeToggle?: (songId: number) => void;
  showUserInfo?: boolean;
}

export default function SongCard({
  song,
  variant = 'grid',
  rank,
  isLiked = false,
  onLikeToggle,
  showUserInfo = true
}: SongCardProps) {
  if (variant === 'list') {
    return (
      <div className='flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100 cursor-pointer'>
        {rank && (
          <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-300 text-white rounded-full text-sm font-bold'>
            {rank}
          </div>
        )}
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
        {showUserInfo && (
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
        )}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full'>
            <HeartIcon className='w-3 h-3 text-purple-500' />
            <span className='text-xs font-medium text-purple-600'>{song.likes}</span>
          </div>
          {onLikeToggle && (
            <Button
              variant='icon'
              onClick={() => onLikeToggle(song.id)}
              className={isLiked
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
              }
            >
              <HeartIcon className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'top3') {
    return (
      <div className='relative'>
        <div className='flex flex-col rounded-3xl shadow-lg p-4 gap-3 hover:shadow-xl transition-shadow-lg duration-300 cursor-pointer group'>
          {rank && (
            <div className='absolute z-10 top-[10px] left-1 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
              {rank}
            </div>
          )}
          <div className='relative mb-3'>
            <Image
              src={song.image}
              alt={song.title}
              width={200}
              height={200}
              className='w-full aspect-square object-cover rounded-xl'
            />
            <div className='absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
              <Button variant='ghost' size='lg' className='transform scale-90 group-hover:scale-100'>
                <PlayIcon className='w-6 h-6 text-purple-600' />
              </Button>
            </div>
            {onLikeToggle && (
              <Button
                variant='icon'
                onClick={() => onLikeToggle(song.id)}
                className={`absolute top-2 right-2 ${
                  isLiked
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                    : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
                }`}
              >
                <HeartIcon className='w-4 h-4' />
              </Button>
            )}
          </div>
          <div className='flex flex-col gap-1 border-b-2 border-gray-200'>
            <div className='text-lg text-ellipsis line-clamp-1'>{song.title}</div>
            <div className='text-sm text-ellipsis line-clamp-1 text-gray-500 mb-3'>{song.artist}</div>
          </div>
          {showUserInfo && (
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
          )}
        </div>
      </div>
    );
  }

  // grid variant (내가 선정한 곡)
  return (
    <div className='group relative cursor-pointer'>
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
            <Button variant='ghost' size='lg' className='transform scale-90 group-hover:scale-100'>
              <PlayIcon className='w-6 h-6 text-purple-600' />
            </Button>
          </div>
          {onLikeToggle && (
            <Button
              variant='icon'
              onClick={() => onLikeToggle(song.id)}
              className={`absolute top-2 right-2 ${
                isLiked
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-110'
                  : 'bg-white/80 hover:bg-white text-gray-400 hover:text-purple-500 hover:scale-105'
              }`}
            >
              <HeartIcon className='w-4 h-4' />
            </Button>
          )}
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
  );
}