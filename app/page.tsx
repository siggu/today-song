"use client"

import { MagnifyingGlassIcon, PlayIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import { useState } from "react";

const songs = [
  {
    id: 1,
    title: "노래 제목 노래 제목 노래 제목 노래 제목 노래 제목 노래 제목 노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
  {
    id: 2,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
  {
    id: 3,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
  {
    id: 4,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
  {
    id: 5,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
  {
    id: 6,
    title: "노래 제목",
    artist: "노래 가수",
    image: "https://picsum.photos/700/700",
  },
]

export default function Home() {
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [mainImageError, setMainImageError] = useState(false);

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleMainImageError = () => {
    setMainImageError(true);
  };

  return <main className="font-jua">
    <header className="bg-white max-w-[1440px] mx-auto py-4 px-10">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-bold">오늘의 노래</div>
        <div className="flex items-center gap-2 w-[60%]">
          <input type="text" placeholder="노래 검색" className="w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none" />
          <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">로그인</button>
          <button className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600">회원가입</button>
        </div>
      </div>
    </header>
    <section className="bg-white max-w-[1440px] mt-6 mx-auto py-4 px-10">
      <div className="flex items-start gap-10">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-[600px] h-[600px] rounded-2xl mb-10 overflow-hidden bg-gray-200 group">
            {!mainImageError ? (
              <>
                <Image
                  src="https://picsum.photos/700/700"
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <div className="text-gray-600 font-medium">이미지를 불러올 수 없습니다</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-3">노래 제목</div>
          <div className="text-sm text-gray-500">노래 가수</div>
        </div>
        <div className="flex-1 min-w-0 border-2 h-[700px] border-gray-300 rounded-2xl p-6 bg-gray-100 overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide gap-2">
            {/* TODO: 노래 목록 무한 스크롤 */}
            {songs.map((song) => (
              <div key={song.id} className="flex items-center gap-2 hover:bg-gray-200 hover:rounded-2xl p-2 rounded-xl cursor-pointer group">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </main>
}