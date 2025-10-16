import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif'
});

export const metadata: Metadata = {
  title: 'BlazeSportsIntel · College Baseball Intelligence',
  description:
    'Mobile-first college baseball intelligence with real-time scores, advanced box scores, and conference dashboards built on Next.js 15.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSerif.variable} bg-background text-text antialiased`}>{children}</body>
    </html>
  );
}
