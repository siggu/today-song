import { platformLinks } from '@/lib/links';
import type { Song } from '@/lib/types';
import { clsx } from 'clsx';

interface PlatformLinksProps {
  song: Song;
  size?: 'sm' | 'md';
  // false면 한 줄로 짧은 이름만 표시 (트랙 리스트용)
  wrap?: boolean;
  className?: string;
}

export default function PlatformLinks({ song, size = 'sm', wrap = true, className }: PlatformLinksProps) {
  return (
    <div className={clsx('flex gap-1.5', wrap ? 'flex-wrap' : 'flex-nowrap overflow-hidden', className)}>
      {platformLinks(song).map((link) => (
        <a
          key={link.name}
          title={link.name}
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full bg-chip text-subtle hover:text-white hover:bg-[#333] transition-colors whitespace-nowrap',
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-sm',
          )}
        >
          <span className={clsx('rounded-full shrink-0', link.color, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
          {wrap ? link.name : link.shortName}
        </a>
      ))}
    </div>
  );
}
