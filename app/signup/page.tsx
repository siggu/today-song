'use client';

import Header from '@/public/components/common/Header';
import Button from '@/public/components/common/Button';
import Link from 'next/link';
import { useState } from 'react';

export default function Signup() {
  const [isLogin] = useState(false);

  return (
    <main className='font-jua bg-purple-50 min-h-screen'>
      <Header isLogin={isLogin} />
      <section className='max-w-[1440px] mx-auto h-[60vh] flex flex-col items-center justify-center gap-6'>
        <div className='flex flex-col items-center justify-center gap-10'>
          <div className='text-4xl font-bold'>회원가입</div>
          <div className='flex flex-col items-center justify-center gap-2'>
            <input
              type='text'
              placeholder='아이디'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
            <input
              type='text'
              placeholder='닉네임'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
            <input
              type='password'
              placeholder='비밀번호'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
            <input
              type='password'
              placeholder='비밀번호 확인'
              className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none min-w-[500px]'
            />
          </div>
        </div>
        <div className='flex items-center justify-center gap-3 w-full max-w-[500px]'>
          <Link href='/login' className='w-full'>
            <Button fullWidth>
              회원가입
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
