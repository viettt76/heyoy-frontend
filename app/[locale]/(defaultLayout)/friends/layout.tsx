'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/shadcn/accordion';
import { Link, usePathname } from '@/i18n/routing';
import { useAppSelector } from '@/redux/hooks';
import { selectUserInfo } from '@/redux/slices/userSlice';

export default function FriendsLayout({ children }) {
    const pathname = usePathname();

    const friendRequestCount = useAppSelector(selectUserInfo).friendRequestCount;

    return (
        <div className="flex gap-x-10 max-w-[1024px] mx-auto relative">
            <div className="w-80 bg-background h-fit sticky top-10">
                <Accordion type="single" defaultValue={pathname.split('/')[1]} collapsible className="w-full">
                    <AccordionItem value="friends">
                        <AccordionTrigger className={`${pathname.includes('/friends') && 'text-primary'}`}>
                            Bạn bè
                        </AccordionTrigger>
                        <AccordionContent className="-mt-2 ps-2">
                            <Link
                                className={`block py-1 hover:text-primary ${
                                    pathname === '/friends/suggestions' && 'text-primary'
                                }`}
                                href="/friends/suggestions"
                            >
                                Gợi ý
                            </Link>
                            <Link
                                className={`block py-1 hover:text-primary ${
                                    pathname === '/friends/friend-requests' && 'text-primary'
                                }`}
                                href="/friends/friend-requests"
                            >
                                <span className="relative">
                                    Lời mời kết bạn
                                    {friendRequestCount > 0 && (
                                        <span className="absolute top-0 -right-3 text-destructive text-xs">
                                            {friendRequestCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                            <Link
                                className={`block py-1 hover:text-primary ${
                                    pathname === '/friends/sent-requests' && 'text-primary'
                                }`}
                                href="/friends/sent-requests"
                            >
                                Lời mời đã gửi
                            </Link>
                            <Link
                                className={`block py-1 hover:text-primary ${pathname === '/friends' && 'text-primary'}`}
                                href="/friends"
                            >
                                Bạn bè
                            </Link>
                        </AccordionContent>
                    </AccordionItem>
                    {/* <AccordionItem value="groups">
                        <AccordionTrigger className={`${pathname.includes('/groups') && 'text-primary'}`}>
                            Nhóm
                        </AccordionTrigger>
                        <AccordionContent className="-mt-2 ps-2">
                            <Link className="block py-1 hover:text-primary" href="/groups/suggestions">
                                Gợi ý
                            </Link>
                        </AccordionContent>
                    </AccordionItem> */}
                </Accordion>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}
