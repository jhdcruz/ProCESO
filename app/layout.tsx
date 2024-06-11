import type { ReactNode } from 'react';
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProCESO | TIP Manila - CESO Dept.",
  description: "Community Outreach Internal Management System for TIP Manila - CESO Department.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>

      <body className={inter.className}>
      	<MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
