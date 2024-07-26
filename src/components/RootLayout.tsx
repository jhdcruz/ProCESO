import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

import Head from 'next/head';

import '@/app/globals.css';
import '@mantine/core/styles.layer.css';

import {
  ColorSchemeScript,
  type MantineColorsTuple,
  MantineProvider,
  createTheme,
} from '@mantine/core';

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
export const defaultMetadata: Metadata = {
  title: 'ProCESO | Technological Institute of the Philippines',
  description:
    'Community Outreach Management System for Technological Institute of the Philippines - CESO Department.',
};

export const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html className={font.variable} lang="en">
      <Head key="mantine-provider">
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>

      <body>
        <MantineProvider
          deduplicateCssVariables
          defaultColorScheme="auto"
          theme={theme}
          withCssVariables
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
};
