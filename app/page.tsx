import Home from '@/components/home/Home';
import type { SiteData } from '@/lib/types';
import siteData from '@/data/site.json';

// data/site.json은 매일 GitHub Actions의 수집 스크립트(scripts/collect.ts)가 갱신
export default function Page() {
  return <Home data={siteData as SiteData} />;
}
