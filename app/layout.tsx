// app/layout.tsx - Root layout, font, Tailwind globals
import type { Metadata } from 'next';
import './globals.css';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '../components/ThemeProvider';
import { SiteHeader } from '../components/SiteHeader';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Pity Tracker | Advanced Gacha Analytics',
  description: 'Purely client-side probability calculator for estimating your pulls.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-[100dvh]">
        <div className="bg-noise" aria-hidden="true" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Top Navigation */}
          <SiteHeader />
          
          <div className="pt-16">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}