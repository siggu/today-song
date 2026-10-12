import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

interface HeaderProps {
  query?: string;
  onQueryChange?: (query: string) => void;
}

export default function Header({ query = '', onQueryChange }: HeaderProps) {
  return (
    <header className='bg-white w-full py-4 px-4 sm:px-6 sticky top-0 z-30 shadow-sm'>
      <div className='max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center'>
        <Link href='/' className='text-3xl sm:text-4xl font-bold shrink-0'>
          오늘의 노래
        </Link>
        {onQueryChange && (
          <form
            role='search'
            onSubmit={(e) => e.preventDefault()}
            className='flex items-center gap-2 w-full sm:w-[60%]'
          >
            <div className='relative w-full'>
              <input
                type='search'
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder='곡명, 가수 검색'
                className='w-full border-2 border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:border-purple-400'
              />
              {query && (
                <button
                  type='button'
                  aria-label='검색어 지우기'
                  onClick={() => onQueryChange('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                >
                  <XMarkIcon className='w-5 h-5' />
                </button>
              )}
            </div>
            <button
              type='submit'
              aria-label='검색'
              className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'
            >
              <MagnifyingGlassIcon className='w-6 h-6' />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
