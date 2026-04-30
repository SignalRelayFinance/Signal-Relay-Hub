import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Signal Relay Hub — AI-powered market intelligence',
  description: 'SEC filings, economic calendar and AI trade setups delivered to your Telegram in under 4 minutes.',
  openGraph: {
    title: 'Signal Relay Hub',
    description: 'Institutional intel. Retail price.',
    url: 'https://www.signalrelayhub.io',
    siteName: 'Signal Relay Hub',
    images: [
      {
        url: 'https://www.signalrelayhub.io/og-image.png', // Add a nice screenshot named og-image.png to your public folder!
        width: 1200,
        height: 630,
        alt: 'Signal Relay Hub Dashboard',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signal Relay Hub',
    description: 'Institutional intel. Retail price.',
    images: ['https://www.signalrelayhub.io/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
