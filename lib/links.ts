import type { Song } from './types';

export interface PlatformLink {
  name: string;
  href: string;
  className: string;
}

export function platformLinks(song: Song): PlatformLink[] {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  const links: PlatformLink[] = [
    {
      name: 'YouTube Music',
      href: song.youtubeId
        ? `https://music.youtube.com/watch?v=${song.youtubeId}`
        : `https://music.youtube.com/search?q=${q}`,
      className: 'bg-red-50 text-red-600 hover:bg-red-100',
    },
  ];
  if (song.appleUrl) {
    links.push({ name: 'Apple Music', href: song.appleUrl, className: 'bg-pink-50 text-pink-600 hover:bg-pink-100' });
  }
  links.push(
    {
      name: 'Spotify',
      href: `https://open.spotify.com/search/${q}`,
      className: 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
      name: '멜론',
      href: `https://www.melon.com/search/total/index.htm?q=${q}`,
      className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    },
  );
  return links;
}
