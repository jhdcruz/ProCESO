/*
 * Layout wrapper for Providers and Site metadata.
 *
 * For main app layout, see `src/app/page.tsx`.
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Inter } from 'next/font/google'
import './globals.css'
import '@mantine/core/styles.css'

import {
  ColorSchemeScript,
  type MantineColorsTuple,
  MantineProvider,
  createTheme,
} from '@mantine/core'

const inter = Inter({ subsets: ['latin'] })

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
]

const theme = createTheme({
  colors: {
    brandColor,
  },
  defaultRadius: 'md',
})

export const metadata: Metadata = {
  title: 'ProCESO Portal | Technological Institute of the Philippines – Manila',
  description:
    'Community Outreach Internal Management System for TIP Manila - CESO Department.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>

      <body className={inter.className}>
        <MantineProvider
          theme={theme}
          defaultColorScheme="auto"
          withCssVariables
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
