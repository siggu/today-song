import Link from 'next/link';
import { MusicalNoteIcon } from '@heroicons/react/24/solid';

// 로그인/회원가입 공통 레이아웃 (로그인 기능은 추후 연결 예정)
export default function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className='min-h-dvh bg-gradient-to-b from-highlight to-black flex items-center justify-center px-4 py-10'>
      <section className='w-full max-w-[460px] bg-base rounded-lg px-6 sm:px-12 py-10 flex flex-col items-center gap-8'>
        <Link href='/' className='flex items-center gap-2 font-black text-xl'>
          <span className='w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center'>
            <MusicalNoteIcon className='w-5 h-5' />
          </span>
          오늘의 노래
        </Link>
        <h1 className='text-3xl font-bold'>{title}</h1>
        {children}
      </section>
    </main>
  );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className='w-full h-12 rounded-md bg-elevated border border-muted px-4 text-sm placeholder:text-subtle hover:border-white focus:outline-none focus:ring-2 focus:ring-white'
    />
  );
}
