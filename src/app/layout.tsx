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
  title: 'Signal Relay Hub',
  description: 'Multi-source intel for fintech operators and traders. Live SEC filings, AI lab updates, economic calendar events and market pair impact analysis.',
  openGraph: {
    title: 'Signal Relay Hub',
    description: 'Flash SEC alerts, AI lab signals, and economic calendar events — pushed to Telegram, email, and your API stack.',
    url: 'https://www.signalrelayhub.io',
    siteName: 'Signal Relay Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signal Relay Hub',
    description: 'Flash SEC alerts, AI lab signals, and economic calendar events — pushed to Telegram, email, and your API stack.',
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
