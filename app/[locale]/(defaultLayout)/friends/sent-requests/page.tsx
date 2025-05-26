'use client';

import { UserInfoType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getSentFriendRequestsService, deleteFriendRequestService } from '@/lib/services/relationshipService';
import { AxiosError } from 'axios';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SentFriendRequestType = UserInfoType & {
    friendRequestId: string;
};

export default function SentRequests() {
    const [sentFriendRequests, setSentFriendRequests] = useState<SentFriendRequestType[]>([]);

    const { data, loading, fetchNext } = useFetch<SentFriendRequestType>(getSentFriendRequestsService, {
        paginated: true,
    });

    const { observerTarget } = useInfiniteScroll({
        callback: fetchNext!,
        threshold: 0.5,
        loading,
    });

    useEffect(() => {
        if (data?.length > 0)
            setSentFriendRequests((prev) => [
                ...prev,
                ...data.map((i) => ({
                    userId: i.userId,
                    firstName: i.firstName,
                    lastName: i.lastName,
                    avatar: i.avatar,
                    friendRequestId: i.friendRequestId,
                })),
            ]);
    }, [data]);

    const handleRevokeRequest = async (friendRequestId: string) => {
        try {
            setSentFriendRequests((prev) =>
                prev.filter((sentRequest) => sentRequest.friendRequestId != friendRequestId),
            );
            await deleteFriendRequestService(friendRequestId);
        } catch (error) {
            if (error instanceof AxiosError && error.status === 404) {
                toast.info(error.response?.data.message, {
                    duration: 2500,
                });
            }
            console.error(error);
        }
    };

    if (loading) return null;

    return (
        <>
            {sentFriendRequests.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 max-sm:grid-cols-1 max-md:pe-3 max-md:gap-x-3 gap-x-10 gap-y-2">
                    {sentFriendRequests.map((friendRequest: SentFriendRequestType) => {
                        return (
                            <div
                                className="flex shadow-sm p-2 border-t rounded-lg"
                                key={`friend-request-${friendRequest.userId}`}
                            >
                                <Image
                                    className="rounded-full w-10 h-10 border"
                                    src={friendRequest.avatar || '/images/default-avatar.png'}
                                    alt="avatar"
                                    width={800}
                                    height={800}
                                />
                                <div className="ms-2 font-semibold flex-1">
                                    {friendRequest.lastName} {friendRequest.firstName}
                                </div>
                                <X
                                    className="ms-2 float-end w-5 h-5 text-destructive cursor-pointer"
                                    onClick={() => handleRevokeRequest(friendRequest.friendRequestId)}
                                />
                            </div>
                        );
                    })}
                    <div ref={observerTarget} className="h-20"></div>
                </div>
            ) : (
                <div className="text-center text-primary text-sm mt-4 w-full">Bạn chưa gửi lời mời kết bạn nào</div>
            )}
        </>
    );
}
