import Link from 'next/link';
import Button from '@/components/common/Button';
import AuthLayout, { AuthInput } from '@/components/common/AuthLayout';

export default function Login() {
  return (
    <AuthLayout title='로그인'>
      <div className='w-full flex flex-col gap-3'>
        <AuthInput type='text' placeholder='아이디' />
        <AuthInput type='password' placeholder='비밀번호' />
      </div>
      <div className='w-full flex flex-col gap-3'>
        <Button fullWidth size='lg' disabled>
          로그인
        </Button>
        <Link href='/signup' className='w-full'>
          <Button variant='secondary' fullWidth size='lg'>
            회원가입
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
