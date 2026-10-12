// 플랫폼마다 표기가 다른 같은 곡을 하나로 묶기 위한 키
// 예) "Supernova (feat. X)" / "aespa, Y" → "supernova|aespa"
export function songKey(title: string, artist: string): string {
  return `${normalizeTitle(title)}|${normalizeArtist(artist)}`;
}

function clean(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function normalizeTitle(title: string): string {
  const stripped = title.replace(/\s*[(\[](feat|ft|with|prod)[^)\]]*[)\]]/gi, '').replace(/\s+-\s+.*$/, '');
  return clean(stripped) || clean(title);
}

function normalizeArtist(artist: string): string {
  const first = artist.split(/\s*(?:,|&|\sx\s|\sfeat\.?\s|\sft\.?\s|\swith\s)\s*/i)[0];
  return clean(first) || clean(artist);
}
