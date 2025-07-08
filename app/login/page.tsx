'use client';

import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';
import { useState } from 'react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <main className='font-jua'>
      <header className='bg-white max-w-[1440px] mx-auto py-10 px-10'>
        <div className='flex justify-between items-center'>
          <div className='text-4xl font-bold'>오늘의 노래</div>
          <div className='flex items-center gap-2 w-[60%]'>
            <input
              type='text'
              placeholder='노래 검색'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none'
            />
            <button className='bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600'>
              <MagnifyingGlassIcon className='w-6 h-6' />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            {isLogin ? (
              <button className='bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600'>
                <UserIcon className='w-6 h-6' />
              </button>
            ) : (
              <button className='bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600'>로그인</button>
            )}
          </div>
        </div>
      </header>
      <section className='bg-white max-w-[1440px] mx-auto h-[60vh] flex flex-col items-center justify-center gap-6'>
        <div className='flex flex-col items-center justify-center gap-10'>
          <div className='text-4xl font-bold'>로그인</div>
          <div className='flex flex-col items-center justify-center gap-2'>
            <input
              type='text'
              placeholder='아이디'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
            <input
              type='password'
              placeholder='비밀번호'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
          </div>
        </div>
        <div className='flex items-center justify-center gap-3 w-full max-w-[500px]'>
          <button
            className='bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 w-full hover:cursor-pointer'
            disabled
          >
            로그인
          </button>
          <Link
            href='/signup'
            className='bg-black text-white text-center rounded-full px-4 py-2 hover:bg-black/80  w-full hover:cursor-pointer'
          >
            <button>회원가입</button>
          </Link>
        </div>
      </section>
    </main>
  );
}
