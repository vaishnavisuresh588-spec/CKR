import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BackgroundParticles from '@/components/BackgroundParticles';
import ThemeInitializer from '@/components/ThemeInitializer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ResolverAI — Contradictory Knowledge Resolver',
  description: 'Detect and resolve conflicting claims across sources using semantic AI, NLI contradiction detection, and NVIDIA-powered reasoning.',
  keywords: ['AI', 'contradiction detection', 'NLP', 'fact checking', 'knowledge resolver'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-white antialiased" style={{ background: 'var(--bg)' }}>
        <ThemeInitializer />
        <BackgroundParticles />
        <Navbar />
        <div className="pt-16 relative z-[2]">
          {children}
        </div>
      </body>
    </html>
  );
}
