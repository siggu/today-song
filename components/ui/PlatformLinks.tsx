import { platformLinks } from '@/lib/links';
import type { Song } from '@/lib/types';
import { clsx } from 'clsx';

export default function PlatformLinks({ song, className }: { song: Song; className?: string }) {
  return (
    <div className={clsx('flex flex-wrap gap-1', className)}>
      {platformLinks(song).map((link) => (
        <a
          key={link.name}
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => e.stopPropagation()}
          className={clsx('px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors', link.className)}
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
