'use client';

import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { ComponentProps, ReactNode } from 'react';

interface MovieLinkProps extends ComponentProps<typeof Link> {
    href: string;
    children: ReactNode;
}

export default function MovieLink({ href, children, ...props }: MovieLinkProps) {
    const searchParams = useSearchParams();
    const source = searchParams.get('source');

    if (href.includes('?')) {
        return (
            <Link href={`${href}&source=${source}`} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <Link href={`${href}?source=${source}`} {...props}>
            {children}
        </Link>
    );
}
