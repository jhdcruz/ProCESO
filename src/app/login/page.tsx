import { lazy, Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { metadata as defaultMetadata } from '@/app/layout';
import { JitbitScript } from '@/components/Integrations/JitbitScript';
import loginBg from '@/components/_assets/img/login-bg.webp';
import '@/styles/jitbit.css';

const LoginForm = lazy(() =>
  import('@/app/login/_components/LoginForm').then((mod) => ({
    default: mod.LoginForm,
  })),
);

export const metadata: Metadata = {
  title: 'Login - ' + defaultMetadata.title,
  description: defaultMetadata.description,
};

export default function Login() {
  return (
    <div className="z-10 min-h-screen max-w-full md:flex">
      <Suspense>
        <LoginForm />
      </Suspense>

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
