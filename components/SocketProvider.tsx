'use client';

import { useAppDispatch } from '@/redux/hooks';
import { socket } from '@/lib/socket';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import CallProvider from './CallProvider';
import { addNotification, NotificationType } from '@/redux/slices/notificationSlice';
import { addFriendRequestCount } from '@/redux/slices/userSlice';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

const SocketContext = createContext(socket);

export default function SocketProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        socket.connect();

        const handleNewFriendRequest = (newFriendRequest) => {
            const { friendRequestId, userId, firstName, lastName, avatar, notificationId, content, createdAt } =
                newFriendRequest;
            dispatch(addFriendRequestCount());
            dispatch(
                addNotification({
                    notificationId,
                    actorId: userId,
                    actorFirstName: firstName,
                    actorLastName: lastName,
                    actorAvatar: avatar,
                    type: NotificationType.FRIEND_REQUEST,
                    referenceId: friendRequestId,
                    content,
                    isRead: false,
                    createdAt,
                }),
            );
        };

        const handleAccountLocked = (message) => {
            router.push(`/login`);
            toast.error(message, {
                duration: 2500,
            });
        };

        socket.on('newFriendRequest', handleNewFriendRequest);

        socket.on('accountLocked', handleAccountLocked);

        return () => {
            socket.off('newFriendRequest', handleNewFriendRequest);
            socket.off('accountLocked', handleAccountLocked);
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            <CallProvider />
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
