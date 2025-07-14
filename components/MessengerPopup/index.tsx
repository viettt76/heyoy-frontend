'use client';

import { useRef } from 'react';

import {
    ConversationType,
    focusConversationPopup,
    unfocusConversationPopup,
    removeConversationsUnread,
} from '@/redux/slices/conversationSlice';
import { readMessageService } from '@/services/conversationService';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/redux/hooks';
import useClickOutside from '@/hooks/useClickOutside';
import React from 'react';
import MessengerPopupHeader from './MessengerPopupHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface MessengerPopupProps {
    index: number;
    conversationId: string;
    type: ConversationType;
    friendId?: string;
    name: string;
    avatar?: string;
    isMinimized: boolean;
    isFocus: boolean;
    unreadCount: number;
    className?: string;
}

export default function MessengerPopup({
    index,
    conversationId,
    type,
    friendId,
    name,
    avatar,
    isMinimized,
    isFocus,
    unreadCount,
    className,
}: MessengerPopupProps) {
    const dispatch = useAppDispatch();

    const messengerPopupRef = useRef<HTMLDivElement>(null);
    useClickOutside(messengerPopupRef, () => dispatch(unfocusConversationPopup(conversationId || friendId || '')));

    const handleFocusMessengerPopup = async () => {
        dispatch(focusConversationPopup(conversationId || friendId || ''));
        dispatch(removeConversationsUnread(conversationId));

        if (conversationId && unreadCount > 0) {
            await readMessageService(conversationId);
        }
    };

    return (
        <div
            ref={messengerPopupRef}
            className={cn(
                'fixed flex flex-col bottom-0 bg-background w-[18rem] h-[26rem] rounded-t-xl border border-b-0',
                className,
            )}
            style={{ right: `${3.5 + index * 18.5}rem`, zIndex: 10 - index }}
            onClick={handleFocusMessengerPopup}
        >
            <MessengerPopupHeader
                name={name}
                avatar={avatar}
                isFocus={isFocus}
                conversationId={conversationId}
                friendId={friendId}
                type={type}
            />
            <MessageList
                conversationId={conversationId}
                type={type}
                name={name}
                avatar={avatar}
                isMinimized={isMinimized}
            />
            <MessageInput
                conversationId={conversationId}
                isFocus={isFocus}
                friendId={friendId}
                type={type}
                avatar={avatar}
            />
        </div>
    );
}
