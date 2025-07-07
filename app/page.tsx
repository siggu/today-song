"use client"

import { HeartIcon, MagnifyingGlassIcon, PlayIcon, UserIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  image: string;
  username: string;
  userImage: string;
}

const songs: Song[] = [
  {
    id: 1,
    title: "노래 제목 노래 제목 노래 제목 노래 제목 노래 제목 노래 제목 노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user1",
    userImage: "https://picsum.photos/700/700",
  },
  {
    id: 2,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user2",
    userImage: "https://picsum.photos/700/700",
  },
  {
    id: 3,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user3",
    userImage: "https://picsum.photos/700/700",
  },
  {
    id: 4,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user4",
    userImage: "https://picsum.photos/700/700",
  },
  {
    id: 5,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user5",
    userImage: "https://picsum.photos/700/700",
  },
  {
    id: 6,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
    username: "user6",
    userImage: "https://picsum.photos/700/700",
  },
]

export default function Home() {
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [mainImageError, setMainImageError] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isLiked, setIsLiked] = useState<{[key: number]: boolean}>({});
  const [todaySong, setTodaySong] = useState<Song | null>(null);

  // todaySong이 없으면 첫 곡으로 초기화
  useEffect(() => {
    if (!todaySong && songs.length > 0) {
      setTodaySong(songs[0]);
    }
  }, [todaySong]);

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleMainImageError = () => {
    setMainImageError(true);
  };

  return <main className="font-jua">
    <header className="bg-white max-w-[1440px] mx-auto py-10 px-10">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-bold">오늘의 노래</div>
        <div className="flex items-center gap-2 w-[60%]">
          <input type="text" placeholder="노래 검색" className="w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none" />
          <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isLogin ? (
            <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">
              <UserIcon className="w-6 h-6" />
            </button>
          ) : (
            <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">로그인</button>
          )}
        </div>
      </div>
    </header>
    <section className="bg-white max-w-[1440px] mt-6 mx-auto py-4 px-10">
      <div className="flex items-start gap-10">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-[600px] h-[600px] rounded-2xl mb-10 overflow-hidden bg-gray-200 group hover:cursor-pointer">
            {!mainImageError && todaySong ? (
              <>
                <Image
                  src={todaySong.image}
                  alt="노래 이미지"
                  fill
                  className="object-cover group-hover:bg-gray-900"
                  onError={handleMainImageError}
                  priority
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/60 flex items-center justify-center">
                  <PlayIcon className="w-20 h-20 text-white opacity-0 group-hover:opacity-100" />
                </div>
                <div className="absolute top-0 right-0 p-4 z-10">
                  <button className="hover:cursor-pointer" onClick={() => setIsLiked(prev => ({ ...prev, [todaySong?.id]: !prev[todaySong?.id] }))}>
                    <HeartIcon className={`w-10 h-10 ${isLiked[todaySong?.id] ? 'text-red-500' : 'text-gray-500'}`} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Image
                  src={songs[0].image}
                  alt="노래 이미지"
                  fill
                  className="object-cover group-hover:bg-gray-900"
                  onError={handleMainImageError}
                  priority
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/60 flex items-center justify-center">
                  <PlayIcon className="w-20 h-20 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </>
            )}
          </div>
          <div className="text-2xl font-bold mb-3 max-w-[600px] text-ellipsis line-clamp-1">{todaySong?.title}</div>
          <div className="text-sm text-gray-500 max-w-[600px] text-ellipsis line-clamp-1">{todaySong?.artist}</div>
        </div>
        <div className="flex-1 min-w-0 border-2 h-[700px] border-none rounded-2xl p-6 bg-gray-100 overflow-hidden shadow-xl">
          <div className="text-3xl mb-3">오늘의 노래 목록</div>
          <div className="flex flex-col h-[600px] overflow-y-auto pr-2 scrollbar-hide gap-2">
            {/* TODO: 노래 목록 무한 스크롤 */}
            {songs.map((song) => (
              <div
                key={song.id}
                className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer group transition
                  ${todaySong?.id === song.id ? 'bg-gray-200 shadow-md' : 'hover:bg-gray-200 hover:rounded-2xl'}`}
                onClick={() => setTodaySong(song)}
              >
                <div className="relative flex-shrink-0 w-[100px] h-[100px] rounded-xl overflow-hidden bg-gray-200 mr-3">
                  {!imageErrors[song.id] ? (
                    <>
                      <Image
                        src={song.image}
                        alt={song.title}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(song.id)}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/60 flex items-center justify-center">
                        <PlayIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 " />
                      </div>
                      <div className="absolute top-0 right-0 p-1 z-10">
                        <button className="hover:cursor-pointer" onClick={() => setIsLiked(prev => ({ ...prev, [song.id]: !prev[song.id] }))}>
                          <HeartIcon className={`w-5 h-5 ${isLiked[song.id] ? 'text-red-500' : 'text-gray-500'}`} />
                        </button>
                      </div>
                    </>
                    
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎵</div>
                        <div className="text-xs text-gray-600">이미지 없음</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-2xl font-bold leading-10 text-ellipsis line-clamp-1">{song.title}</div>
                  <div className="text-lg text-gray-500 text-ellipsis line-clamp-1">{song.artist}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Image src={song.userImage} alt={song.username} className="w-10 h-10 rounded-full" width={40} height={40} />
                  <div className="text-sm text-gray-500 text-ellipsis line-clamp-1">{song.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </main>
}