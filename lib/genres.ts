export const GENRES = [
  { id: 'kpop', label: 'K-POP', emoji: '🇰🇷', appleGenreIds: [51] },
  { id: 'pop', label: '팝', emoji: '🎤', appleGenreIds: [14] },
  { id: 'hiphop', label: '힙합', emoji: '🎧', appleGenreIds: [18] },
  { id: 'rnb', label: 'R&B/소울', emoji: '🎷', appleGenreIds: [15] },
  { id: 'rock', label: '록/인디', emoji: '🎸', appleGenreIds: [21, 20] },
  { id: 'dance', label: '댄스/일렉트로닉', emoji: '🪩', appleGenreIds: [17, 7] },
  { id: 'ost', label: 'OST', emoji: '🎬', appleGenreIds: [16] },
  { id: 'jpop', label: 'J-POP', emoji: '🗾', appleGenreIds: [27] },
  { id: 'etc', label: '그 외', emoji: '🎼', appleGenreIds: [] },
] as const;

export type GenreId = (typeof GENRES)[number]['id'];

export const GENRE_IDS = GENRES.map((g) => g.id) as GenreId[];

export function genreLabel(id: GenreId): string {
  return GENRES.find((g) => g.id === id)?.label ?? id;
}

// Apple(iTunes)의 primaryGenreName(영문)을 사이트 장르로 변환
export function toGenreId(appleGenreName: string | undefined): GenreId {
  const name = (appleGenreName ?? '').toLowerCase();
  if (/k-pop|korean/.test(name)) return 'kpop';
  if (/j-pop|japan|anime/.test(name)) return 'jpop';
  if (/hip-hop|hip hop|rap/.test(name)) return 'hiphop';
  if (/r&b|soul|funk/.test(name)) return 'rnb';
  if (/rock|alternative|indie|metal|punk/.test(name)) return 'rock';
  if (/dance|electronic|house|techno|edm/.test(name)) return 'dance';
  if (/soundtrack|ost/.test(name)) return 'ost';
  if (/pop/.test(name)) return 'pop';
  return 'etc';
}
