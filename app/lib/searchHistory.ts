export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  id: string;
}

const SEARCH_HISTORY_KEY = 'today-song-search-history';
const MAX_HISTORY_ITEMS = 10;

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as SearchHistoryItem[];
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  if (!query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim();
    
    // 중복 제거
    const filteredHistory = history.filter(item => 
      item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    );
    
    // 새 항목 추가
    const newItem: SearchHistoryItem = {
      query: trimmedQuery,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // 최대 개수 제한
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

export function removeFromSearchHistory(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getSearchHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return new Date(timestamp).toLocaleDateString('ko-KR');
}