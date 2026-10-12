# 🎵 오늘의 노래

한국 차트 80% · 글로벌 차트 20% 인기곡 중에서 매일 새로운 노래를 골라주는 사이트입니다.

- **오늘의 추천**: 인기곡 상위권에서 인기도 가중 랜덤으로 10곡 (최근 30일 안에 추천한 곡은 제외)
- **내 취향 장르**: 장르를 고르면 그 장르의 추천곡으로 바뀜 (브라우저에 저장, 로그인 불필요)
- **인기 차트**: 오늘 / 이번 주 / 이번 달 / 🔥 급상승, 장르 필터
- **재생**: YouTube 전곡 재생 → 안 되면 30초 미리듣기 → 외부 링크 (YouTube Music, Apple Music, Spotify, 멜론)

## 동작 방식

```
[GitHub Actions: 매일 06:07 (한국 시간)]
  ├─ 차트 수집: Apple Music KR/US/GB Top 100, iTunes 한국 장르별 차트, Deezer 글로벌 차트
  ├─ iTunes Lookup으로 곡 정보 보강 (장르, 앨범아트, 30초 미리듣기, Apple Music 링크)
  ├─ YouTube Data API로 전곡 재생용 영상 ID 검색 (찾은 곡은 저장해 두고 다시 검색하지 않음)
  ├─ data/ 폴더 갱신 후 커밋
  └─ 정적 사이트 빌드 → GitHub Pages 배포
```

| 파일 | 내용 |
|---|---|
| `data/site.json` | 사이트가 읽는 최종 데이터 (추천곡, 차트) |
| `data/catalog.json` | 최근 40일 동안 차트에 오른 곡 정보 + YouTube 영상 ID 캐시 |
| `data/snapshots/날짜.json` | 그날의 곡별 인기 점수와 추천곡 (기간 차트, 급상승 계산용) |

## 처음 설정 (한 번만)

1. **YouTube API 키 등록**: 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `YOUTUBE_API_KEY`
   - Secret: Google Cloud Console에서 발급한 키
   - 키가 없어도 동작하지만 30초 미리듣기만 제공됩니다.
2. **GitHub Pages 켜기**: **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택
3. **첫 실행**: **Actions → 오늘의 노래 수집 & 배포 → Run workflow**
   - 이후로는 매일 아침 자동으로 실행되고, `main`에 push할 때도 실행됩니다.
4. 사이트 주소: https://siggu.github.io/today-song/

> YouTube API 무료 할당량은 하루 10,000 유닛이고 검색 1회에 100 유닛이 듭니다.
> 하루 최대 80회(8,000 유닛)까지만 검색하고, 이미 찾은 곡은 다시 검색하지 않습니다.

## 로컬에서 실행

```bash
npm install
YOUTUBE_API_KEY=발급받은키 npm run collect   # 차트 수집 (키는 생략 가능)
npm run dev                                 # http://localhost:3000
```

## 기술 스택

- Next.js 15 (정적 내보내기) + Tailwind CSS 4
- GitHub Actions (매일 수집) + GitHub Pages (배포)
- Apple Music RSS / iTunes Search API / Deezer API (키 불필요), YouTube Data API v3
