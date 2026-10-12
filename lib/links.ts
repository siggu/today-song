import type { Song } from './types';

export interface PlatformLink {
  name: string;
  // 좁은 곳(트랙 리스트)에서 쓰는 짧은 이름
  shortName: string;
  href: string;
  // 플랫폼을 구분하는 점 색상
  color: string;
}

export function platformLinks(song: Song): PlatformLink[] {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  const links: PlatformLink[] = [
    {
      name: 'YouTube Music',
      shortName: 'YouTube',
      href: song.youtubeId
        ? `https://music.youtube.com/watch?v=${song.youtubeId}`
        : `https://music.youtube.com/search?q=${q}`,
      color: 'bg-[#ff0033]',
    },
  ];
  if (song.appleUrl) {
    links.push({ name: 'Apple Music', shortName: 'Apple', href: song.appleUrl, color: 'bg-[#fa2d48]' });
  }
  links.push(
    {
      name: 'Spotify',
      shortName: 'Spotify',
      href: `https://open.spotify.com/search/${q}`,
      color: 'bg-[#1ed760]',
    },
    {
      name: '멜론',
      shortName: '멜론',
      href: `https://www.melon.com/search/total/index.htm?q=${q}`,
      color: 'bg-[#00cd3c]',
    },
  );
  return links;
}
