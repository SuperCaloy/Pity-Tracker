// app/layout.tsx - Root layout, font, Tailwind globals
import type { Metadata } from 'next';
import './globals.css';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';

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
          <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 border-b border-foreground/5 bg-background/20 backdrop-blur-xl transition-colors duration-700 ease-awwwards">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-foreground tracking-tight">PITY TRACKER</span>
            </div>
            <div className="flex items-center h-full">
              <ThemeToggle />
            </div>
          </nav>
          
          <div className="pt-16">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}