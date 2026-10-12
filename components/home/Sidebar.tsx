import { clsx } from 'clsx';
import { CheckCircleIcon, HomeIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';
import { GENRES, type GenreId } from '@/lib/genres';
import type { SiteData } from '@/lib/types';

// 장르 타일 배경색 (스포티파이 장르 카드처럼 채도 높은 색)
const TILE_COLORS: Record<GenreId, string> = {
  kpop: 'bg-[#e8115b]',
  pop: 'bg-[#148a08]',
  hiphop: 'bg-[#bc5900]',
  rnb: 'bg-[#dc148c]',
  rock: 'bg-[#e91429]',
  dance: 'bg-[#0d73ec]',
  ost: 'bg-[#8400e7]',
  jpop: 'bg-[#e1118c]',
  etc: 'bg-[#477d95]',
};

export function Logo({ className }: { className?: string }) {
  return (
    <a href='#top' className={clsx('flex items-center gap-2 font-black tracking-tight', className)}>
      <span className='w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center'>
        <MusicalNoteIcon className='w-5 h-5' />
      </span>
      오늘의 노래
    </a>
  );
}

interface SidebarProps {
  data: SiteData;
  prefs: GenreId[];
  onPrefsChange: (genres: GenreId[]) => void;
  onHome: () => void;
}

export default function Sidebar({ data, prefs, onPrefsChange, onHome }: SidebarProps) {
  const genres = GENRES.filter((g) => (data.picks.byGenre[g.id]?.length ?? 0) > 0);
  const toggle = (id: GenreId) =>
    onPrefsChange(prefs.includes(id) ? prefs.filter((g) => g !== id) : [...prefs, id]);

  return (
    <nav className='hidden lg:flex flex-col gap-2 w-[280px] shrink-0'>
      <div className='bg-base rounded-lg px-5 py-4 flex flex-col gap-4'>
        <Logo className='text-xl' />
        <button onClick={onHome} className='flex items-center gap-4 font-bold text-white cursor-pointer'>
          <HomeIcon className='w-6 h-6' />홈
        </button>
      </div>

      <div className='bg-base rounded-lg flex-1 min-h-0 flex flex-col'>
        <div className='px-5 pt-4 pb-2'>
          <div className='font-bold text-white'>내 취향 장르</div>
          <p className='text-xs text-subtle mt-1'>고른 장르로 오늘의 추천이 바뀌어요. 이 브라우저에 저장돼요.</p>
        </div>
        <ul className='flex-1 overflow-y-auto px-2 pb-2'>
          <GenreItem
            label='전체 장르'
            sub='모든 장르에서 골라요'
            tile='bg-gradient-to-br from-[#450af5] to-[#c4efd9]'
            emoji='✨'
            active={prefs.length === 0}
            onClick={() => onPrefsChange([])}
          />
          {genres.map((g) => (
            <GenreItem
              key={g.id}
              label={g.label}
              sub={`장르 · 추천 ${data.picks.byGenre[g.id]?.length ?? 0}곡`}
              tile={TILE_COLORS[g.id]}
              emoji={g.emoji}
              active={prefs.includes(g.id)}
              onClick={() => toggle(g.id)}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

function GenreItem({
  label,
  sub,
  tile,
  emoji,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  tile: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-pressed={active}
        className='w-full flex items-center gap-3 p-2 rounded-md hover:bg-highlight text-left cursor-pointer'
      >
        <span className={clsx('w-12 h-12 rounded-md flex items-center justify-center text-xl shrink-0', tile)}>{emoji}</span>
        <span className='flex-1 min-w-0'>
          <span className={clsx('block line-clamp-1', active ? 'text-accent' : 'text-white')}>{label}</span>
          <span className='block text-sm text-subtle line-clamp-1'>{sub}</span>
        </span>
        {active && <CheckCircleIcon className='w-5 h-5 text-accent shrink-0' />}
      </button>
    </li>
  );
}
