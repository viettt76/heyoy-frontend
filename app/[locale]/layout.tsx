import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper';
import { getMessages } from 'next-intl/server';
import { Locale } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/shadcn/sonner';

import 'react-photo-view/dist/react-photo-view.css';
import 'draft-js/dist/Draft.css';
import '@livekit/components-styles';
import '@/app/[locale]/globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Heyoy',
    description: 'Heyoy',
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: { locale: Locale };
}>) {
    const { locale } = await params;
    const messages = await getMessages();
    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProviderWrapper>
                    <NextIntlClientProvider messages={messages}>
                        <Toaster position="top-right" richColors />
                        <div>{children}</div>
                    </NextIntlClientProvider>
                </ThemeProviderWrapper>
            </body>
        </html>
    );
}
