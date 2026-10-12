import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '오늘의 노래',
  description: '한국·글로벌 인기 차트에서 매일 골라주는 오늘의 노래',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={`${notoSansKr.variable} antialiased`}>{children}</body>
    </html>
  );
}
