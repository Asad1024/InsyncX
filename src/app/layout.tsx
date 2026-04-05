import type { Metadata } from 'next';
import { Unbounded, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GlobalCursor } from '@/components/ui/GlobalCursor';
import { Providers } from '@/components/providers';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'INSYNC — Multi-Vendor E-Commerce',
  description: 'Luxury multi-vendor marketplace. Shop from curated stores and official picks.',
  icons: {
    icon: [
      { url: '/InsyncX%20logo.avif', type: 'image/avif' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'InsyncX — Multi-Vendor E-Commerce',
    description: 'Luxury multi-vendor marketplace.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${unbounded.variable} dark`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <GlobalCursor />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
