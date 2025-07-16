import Input from '@/components/Input';
import SidebarGroups from '@/components/SidebarGroups';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function GroupsExplorePage() {
    const groups = [1, 2, 3, 4, 5, 6, 1, 1, 1, 1, 1, 1, 1, 11, 1, , 1, 1, 1, 1, 1, 1];

    return (
        <div className="flex gap-x-6">
            <SidebarGroups />
            <div className='flex-1 mt-2'>
                <Input placeholder="Tìm kiếm" className="w-full" />
                <div className="grid grid-cols-4 gap-4 mt-3">
                    {groups.map((g) => (
                        <Link className="px-2 pt-2 pb-3 border rounded-lg" href={`/groups/${g}`}>
                            <Image
                                className="rounded-lg w-full"
                                src={'/images/default-avatar.png'}
                                alt="avatar-group"
                                width={800}
                                height={800}
                            />
                            <div>Name</div>
                            <div>8 members</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
