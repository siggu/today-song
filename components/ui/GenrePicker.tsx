import { clsx } from 'clsx';
import { GENRES, type GenreId } from '@/lib/genres';

interface GenrePickerProps {
  selected: GenreId[];
  available?: GenreId[];
  multiple?: boolean;
  allLabel?: string;
  onChange: (genres: GenreId[]) => void;
}

export default function GenrePicker({ selected, available, multiple = true, allLabel = '전체', onChange }: GenrePickerProps) {
  const genres = available ? GENRES.filter((g) => available.includes(g.id)) : GENRES;

  const toggle = (id: GenreId) => {
    if (!multiple) return onChange(selected.includes(id) ? [] : [id]);
    onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Chip active={selected.length === 0} onClick={() => onChange([])}>
        {allLabel}
      </Chip>
      {genres.map((g) => (
        <Chip key={g.id} active={selected.includes(g.id)} onClick={() => toggle(g.id)}>
          {g.emoji} {g.label}
        </Chip>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'px-3 py-1.5 rounded-full text-sm border-2 transition-colors cursor-pointer',
        active ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-purple-200 text-purple-600 hover:border-purple-400',
      )}
    >
      {children}
    </button>
  );
}
