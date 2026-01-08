
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Entry from './entry';

export const metadata: Metadata = {
  title: 'Dept. of Pharmacology',
  description: 'A centralized portal for departmental management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <Entry>
          {children}
        </Entry>
      </body>
    </html>
  );
}
