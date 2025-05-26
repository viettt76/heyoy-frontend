'use client';

import { UserInfoType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getSuggestionsService, sendFriendRequestService } from '@/lib/services/relationshipService';
import { UserRoundPlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function FriendSuggestions() {
    const [suggestions, setSuggestions] = useState<UserInfoType[]>([]);

    const { data, loading, keyword, debouncedKeyword, fetchNext, setKeyword } = useFetch<UserInfoType>(
        getSuggestionsService,
        {
            paginated: true,
        },
    );

    const { observerTarget } = useInfiniteScroll({
        callback: fetchNext!,
        threshold: 0.5,
        loading,
    });

    useEffect(() => {
        if (data?.length > 0)
            setSuggestions((prev) => [
                ...prev,
                ...data.map((s) => ({
                    userId: s.userId,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    avatar: s.avatar,
                })),
            ]);
    }, [data]);

    useEffect(() => {
        setSuggestions([]);
    }, [debouncedKeyword]);

    const handleSendFriendRequest = async (receiverId: string) => {
        try {
            setSuggestions((prev) => prev.filter((s) => s.userId != receiverId));
            await sendFriendRequestService(receiverId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e) => {
        setKeyword(e.target.value);
    };

    return (
        <div className="mt-4">
            <div className="flex items-stretch">
                <input
                    value={keyword}
                    onChange={handleSearch}
                    className="bg-input/50 border-none outline-none py-2 px-4 rounded-lg"
                    placeholder="Tìm kiếm"
                />
            </div>
            <div className="mt-4">
                <div className="font-semibold">Gợi ý</div>
                {suggestions.length > 0 ? (
                    <>
                        <div className="mt-2 grid grid-cols-2 max-sm:grid-cols-1 max-md:pe-3 max-md:gap-x-3 gap-x-10 gap-y-2">
                            {suggestions.map((suggestion: UserInfoType) => {
                                return (
                                    <div
                                        className="flex shadow-sm p-2 border-t rounded-lg"
                                        key={`suggestion-${suggestion.userId}`}
                                    >
                                        <Image
                                            className="rounded-full w-10 h-10 border"
                                            src={suggestion.avatar || '/images/default-avatar.png'}
                                            alt="avatar"
                                            width={800}
                                            height={800}
                                        />
                                        <div className="ms-2 font-semibold flex-1">
                                            {suggestion.lastName} {suggestion.firstName}
                                        </div>
                                        <UserRoundPlus
                                            className="float-end w-4 h-4 text-primary cursor-pointer"
                                            onClick={() => handleSendFriendRequest(suggestion.userId)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div ref={observerTarget} className="h-20"></div>
                    </>
                ) : (
                    !loading && <div className="text-center text-primary text-sm mt-2">Không tìm thấy gợi ý nào</div>
                )}
            </div>
        </div>
    );
}
