'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/redux/store';
import { getMyInfoService } from '@/services/userService';
import { setInfo } from '@/redux/slices/userSlice';
import { getPostReactionTypesService } from '@/services/postService';
import { setPostReactionType } from '@/redux/slices/reactionTypeSlice';
import { getNotificationsService } from '@/services/notificationService';
import { addNotification } from '@/redux/slices/notificationSlice';
import { getFriendRequestCountService, getFriendsService } from '@/services/relationshipService';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectLoadingApp } from '@/redux/slices/loadingSlice';
import { Spinner } from 'flowbite-react';
import { addFriends } from '@/redux/slices/relationshipSlice';
import { getConversationsUnreadService } from '@/services/conversationService';
import { addConversationsUnread } from '@/redux/slices/conversationSlice';

const LoadingScreen = () => {
    const isLoadingApp = useAppSelector(selectLoadingApp);

    if (!isLoadingApp) return null;

    return (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-[999999]">
            <Spinner size="xl" />
        </div>
    );
};

const AppInitializer = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            try {
                const [
                    userInfoRes,
                    postReactionsRes,
                    notificationsRes,
                    friendRequestCountRes,
                    friendsRes,
                    conversationsUnreadRes,
                ] = await Promise.all([
                    getMyInfoService(),
                    getPostReactionTypesService(),
                    getNotificationsService(),
                    getFriendRequestCountService(),
                    getFriendsService(),
                    getConversationsUnreadService(),
                ]);

                dispatch(setInfo(userInfoRes.data));
                dispatch(setPostReactionType(postReactionsRes.data));

                dispatch(addNotification(notificationsRes.data));

                dispatch(
                    setInfo({
                        friendRequestCount: friendRequestCountRes.data,
                    }),
                );
                dispatch(
                    addFriends(
                        friendsRes.data.map((friend: any) => ({
                            userId: friend.id,
                            firstName: friend.firstName,
                            lastName: friend.lastName,
                            avatar: friend.avatar,
                        })),
                    ),
                );

                dispatch(addConversationsUnread(conversationsUnreadRes.data));
            } catch (error) {
                console.error(error);
            }
        })();
    }, [dispatch]);

    return null;
};

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return (
        <Provider store={storeRef.current}>
            <AppInitializer />
            <LoadingScreen />
            {children}
        </Provider>
    );
}
