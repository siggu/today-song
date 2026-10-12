import Link from 'next/link';
import Button from '@/components/common/Button';
import AuthLayout, { AuthInput } from '@/components/common/AuthLayout';

export default function Signup() {
  return (
    <AuthLayout title='회원가입'>
      <div className='w-full flex flex-col gap-3'>
        <AuthInput type='text' placeholder='아이디' />
        <AuthInput type='text' placeholder='닉네임' />
        <AuthInput type='password' placeholder='비밀번호' />
        <AuthInput type='password' placeholder='비밀번호 확인' />
      </div>
      <Link href='/login' className='w-full'>
        <Button fullWidth size='lg'>
          회원가입
        </Button>
      </Link>
    </AuthLayout>
  );
}
