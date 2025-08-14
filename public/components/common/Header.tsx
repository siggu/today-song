import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

export default function Header({ isLogin }: { isLogin: boolean }) {
  return (
    <header className='bg-white w-full py-5 px-6'>
      <div className='max-w-[1440px] mx-auto'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='text-4xl font-bold'>오늘의 노래</div>
          </Link>
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
              <Link href='/login'>
                <button className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'>
                  로그인
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
