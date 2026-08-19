import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/lib/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevLaunch AI — Developer Career OS',
  description: 'AI-powered platform for developers to build resumes, practice coding, prepare for interviews, and land their dream job.',
  openGraph: { title: 'DevLaunch AI', description: 'Your AI-powered developer career operating system' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary`}>
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
