'use client';

import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function GroupDetailLayout({ children }) {
    const { id } = useParams();
    const pathname = usePathname();

    const MENU: { href: string; label: string }[] = [
        {
            href: `/groups/${id}`,
            label: 'Home',
        },
        {
            href: `/groups/${id}/about`,
            label: 'About',
        },
        {
            href: `/groups/${id}/members`,
            label: 'Members',
        },
        {
            href: `/groups/${id}/photos`,
            label: 'Photos',
        },
    ];

    return (
        <div className="flex">
            <div className="w-60 p-4">
                <Image
                    className="rounded-lg w-40 h-40"
                    src={'/images/default-avatar.png'}
                    alt="avatar-group"
                    width={800}
                    height={800}
                />
                <div className="text-xl font-semibold">Name</div>

                <div className="mt-3">
                    {MENU.map((i) => (
                        <Link
                            href={i.href}
                            className={`block px-2 py-1 ${
                                pathname === i.href ? 'font-bold bg-foreground/10 border-l-4 border-primary' : ''
                            }`}
                        >
                            {i.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}
