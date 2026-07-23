import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import { Providers } from './providers';
import '../index.css';

export const metadata: Metadata = {
  title: 'Invoicer',
  description: 'Gestiona facturas, clientes y gastos desde un solo lugar.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Invoicer',
    description: 'Gestiona facturas, clientes y gastos desde un solo lugar.',
    images: [
      {
        url: '/logo.png',
        width: 500,
        height: 500,
        alt: 'Invoicer',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Invoicer',
    description: 'Gestiona facturas, clientes y gastos desde un solo lugar.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ClerkProvider
          dynamic
          afterSignOutUrl="/login"
          appearance={{ theme: shadcn }}
        >
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
