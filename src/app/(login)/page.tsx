import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { metadata as defaultMetadata } from '@/app/layout';
import { JitbitScript } from '@/components/Integrations/JitbitScript';
import loginBg from '@/components/_assets/img/login-bg.webp';
import { getCurrentUser } from '../actions';
import '@/styles/jitbit.css';

const LoginForm = dynamic(() =>
  import('@/app/(login)/_components/LoginForm').then((mod) => ({
    default: mod.LoginForm,
  })),
);

export const metadata: Metadata = {
  title: 'Login - ' + defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Login() {
  // skip login page for logged-in users
  const user = await getCurrentUser();

  if (user?.data) {
    redirect('/portal');
  }

  return (
    <div className="z-10 min-h-screen max-w-full md:flex">
      <LoginForm />

      {/* Image Wall */}
      <Image
        alt=""
        className="hidden overflow-hidden bg-no-repeat object-cover md:block"
        fill
        placeholder="blur"
        priority={false}
        src={loginBg}
      />

      <JitbitScript />
    </div>
  );
}
