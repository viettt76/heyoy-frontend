'use client';

import Header from '@/components/Header';
import AppProvider from '@/components/AppProvider';
import ScrollToTop from '@/components/ScrollToTop';
import SocketProvider from '@/components/SocketProvider';
import ConversationBubbles from '@/components/ConversationBubbles';
import { usePathname } from '@/i18n/routing';
import MovieHeader from '@/components/MovieHeader';

export default function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <AppProvider>
            <SocketProvider>
                <ConversationBubbles />
                <ScrollToTop />
                <div className="flex flex-col h-screen">
                    {pathname.includes('/movie') ? <MovieHeader /> : <Header />}
                    <div className="flex-1">{children}</div>
                </div>
            </SocketProvider>
        </AppProvider>
    );
}
