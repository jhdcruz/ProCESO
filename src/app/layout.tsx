import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import {
  ColorSchemeScript,
  type MantineColorsTuple,
  MantineProvider,
  createTheme,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ProgressBar, ProgressBarProvider } from 'react-transition-progress';

import '@/app/globals.css';
import '@mantine/core/styles.layer.css';

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Brand colors generated using Mantine's color generator.
 * https://mantine.dev/colors-generator/
 */
const brandColor: MantineColorsTuple = [
  '#fffae1',
  '#fff3cc',
  '#ffe69b',
  '#ffd864',
  '#ffcc38',
  '#ffc51c',
  '#ffc109',
  '#e3aa00',
  '#ca9600',
  '#ae8200',
];

/**
 * Custom theming for Mantine UI
 */
const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'brand',
  colors: {
    brand: brandColor,
  },
  defaultRadius: 'md',
  components: {
    Title: {
      classNames: {
        root: 'font-extrabold',
      },
    },
  },
});

/**
 * Site metadata
 */
export const metadata: Metadata = {
  title: 'ProCESO | Technological Institute of the Philippines',
  description:
    'Community Outreach Management System for Technological Institute of the Philippines - CESO Department.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={font.variable} lang="en">
      {/* IMPORTANT: don't use next/head here, destroys initial UI loading */}
      <head key="mantine-provider">
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>

      <body>
        <MantineProvider
          deduplicateCssVariables
          defaultColorScheme="auto"
          theme={theme}
          withCssVariables
        >
          <ProgressBarProvider>
            <ProgressBar className="absolute top-0 z-50 h-1 bg-[--mantine-primary-color-filled] shadow-lg shadow-[--mantine-primary-color-hover]" />
            <ModalsProvider>{children}</ModalsProvider>
          </ProgressBarProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
