import { MagnifyingGlassIcon, UserIcon, ClockIcon, XMarkIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSearchHistory, addToSearchHistory, removeFromSearchHistory, formatTimeAgo, SearchHistoryItem } from '@/app/lib/searchHistory';

export default function Header({ isLogin }: { isLogin: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (searchTerm) {
      addToSearchHistory(searchTerm);
      setSearchHistory(getSearchHistory());
      setShowHistory(false);
      setSearchQuery('');
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleHistoryItemClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromSearchHistory(id);
    setSearchHistory(getSearchHistory());
  };

  const handleInputFocus = () => {
    setShowHistory(true);
  };

  return (
    <header className='bg-white w-full py-5 px-6'>
      <div className='max-w-[1440px] mx-auto'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='text-4xl font-bold'>오늘의 노래</div>
          </Link>
          <div ref={searchRef} className='relative w-[60%]'>
            <form onSubmit={handleFormSubmit} className='flex items-center gap-2'>
              <input
                type='text'
                placeholder='노래 검색'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleInputFocus}
                className='w-full border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-purple-500'
              />
              <button 
                type='submit'
                className='bg-purple-500 text-white rounded-full px-4 py-2 hover:bg-purple-600 cursor-pointer'
              >
                <MagnifyingGlassIcon className='w-6 h-6' />
              </button>
            </form>
            
            {showHistory && searchHistory.length > 0 && (
              <div className='absolute top-full left-0 right-12 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50'>
                <div className='p-3 border-b border-gray-100'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <ClockIcon className='w-4 h-4' />
                    <span>최근 검색어</span>
                  </div>
                </div>
                <div className='max-h-60 overflow-y-auto'>
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer'
                      onClick={() => handleHistoryItemClick(item.query)}
                    >
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {item.query}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {formatTimeAgo(item.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                        className='ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors'
                      >
                        <XMarkIcon className='w-4 h-4 text-gray-400' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
