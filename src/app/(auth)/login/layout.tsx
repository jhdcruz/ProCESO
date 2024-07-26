import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootLayout, defaultMetadata } from '@/components/RootLayout';

/**
 * Site metadata
 */
export const metadata: Metadata = {
  title: 'Login - ' + defaultMetadata.title,
  description: defaultMetadata.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <RootLayout>{children}</RootLayout>;
}
