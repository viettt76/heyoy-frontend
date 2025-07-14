import { Minus, Phone, X } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import MessengerPopupSettings from '@/components/MessengerPopupSettings';
import Image from 'next/image';
import {
    CallType,
    closeConversation,
    ConversationType,
    minimizeConversation,
    setCallData,
} from '@/redux/slices/conversationSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectUserInfo } from '@/redux/slices/userSlice';
import { useSocket } from '@/components/SocketProvider';

interface MessengerPopupHeaderProps {
    name: string;
    avatar?: string;
    isFocus: boolean;
    conversationId: string;
    friendId?: string;
    type: ConversationType;
}

export default function MessengerPopupHeader({
    name,
    avatar,
    isFocus,
    conversationId,
    friendId,
    type,
}: MessengerPopupHeaderProps) {
    const socket = useSocket();
    const dispatch = useAppDispatch();

    const userInfo = useAppSelector(selectUserInfo);

    const handleClosePopup = useCallback(() => {
        dispatch(closeConversation(conversationId || friendId || ''));
    }, [conversationId, friendId, dispatch]);

    // Close popup when press the 'Esc' key and popup is being focused
    useEffect(() => {
        const handleEscKeydown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape' && isFocus) {
                handleClosePopup();
            }
        };

        document.addEventListener('keydown', handleEscKeydown);

        return () => {
            document.removeEventListener('keydown', handleEscKeydown);
        };
    }, [isFocus, handleClosePopup]);

    const handleMinimizePopup = () => {
        dispatch(minimizeConversation(conversationId || friendId || ''));
    };

    const handleCallRequest = () => {
        const { id, firstName, lastName, avatar } = userInfo;
        dispatch(
            setCallData({
                conversationType: type,
                conversationName: name,
                callType: CallType.REQUEST,
            }),
        );
        socket.emit('call:start', {
            conversationId,
            conversationType: type,
            callerInfo: { userId: id, firstName, lastName, avatar },
            friendId,
            conversationName: name,
        });
    };

    return (
        <div
            className={`flex justify-between items-center bg-primary text-background rounded-t-xl py-1 px-2 shadow-md ${
                isFocus ? 'bg-background' : 'bg-white'
            }`}
        >
            <div className="flex items-center gap-x-1">
                <Image
                    className="w-9 h-9 rounded-full border"
                    src={avatar || '/images/default-avatar.png'}
                    alt="avatar"
                    width={800}
                    height={800}
                />
                <span className={`font-semibold ${isFocus ? 'text-background' : 'text-foreground'}`}>
                    {/* {(type === ConversationType.PRIVATE &&
                            groupMembers.find((m) => m.userId !== userInfo.id)?.nickname) ||
                            name} */}
                    {name}
                </span>

                <MessengerPopupSettings
                    isFocus={isFocus}
                    conversationId={conversationId}
                    friendId={friendId}
                    type={type}
                />
                <Phone
                    className={`${isFocus ? 'text-background' : 'text-foreground'} w-4 h-4`}
                    onClick={handleCallRequest}
                />
            </div>
            <div className="flex items-center gap-x-1">
                <Minus
                    className={`${isFocus ? 'text-background' : 'text-foreground'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMinimizePopup();
                    }}
                />
                <X className={`${isFocus ? 'text-background' : 'text-foreground'}`} onClick={handleClosePopup} />
            </div>
        </div>
    );
}
