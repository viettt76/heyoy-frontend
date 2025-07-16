'use client';

import { Bookmark, Newspaper } from 'lucide-react';
import { Link } from '@/i18n/routing';

const MENU_ITEMS = [
    { href: '/groups/explore', icon: Newspaper, label: 'Khám phá' },
    { href: '/groups/manage', icon: Bookmark, label: 'Quản lý nhóm' },
];

export default function SidebarGroups() {
    return (
        <div className="max-xs:hidden bg-background h-fit sticky top-[72px] px-2 py-2 rounded-lg w-64 max-sm:w-48">
            {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        href={item.href}
                        className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
                        key={`menu-item-${item.label}`}
                    >
                        <Icon className="me-3 w-6 h-6 text-primary" />
                        <div>{item.label}</div>
                    </Link>
                );
            })}
        </div>
    );
}
