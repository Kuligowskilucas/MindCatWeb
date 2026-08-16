import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import { THEME_COOKIE, type Theme } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mindcat.com.br'),
  title: 'MindCat',
  description: 'Cuidado contínuo entre uma sessão e outra.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const theme: Theme | undefined = themeCookie === 'light' || themeCookie === 'dark' ? themeCookie : undefined;

  return (
    <html lang="pt-BR" data-theme={theme}>
      <body className="min-h-dvh antialiased">
        <Providers initialTheme={theme}>{children}</Providers>
      </body>
    </html>
  );
}