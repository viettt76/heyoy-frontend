import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getTimeFromISO, padNumber } from '@/lib/utils';
import Message from '@/components/Message';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
    addNewMessage,
    addOldMessages,
    selectMessagesByConversationId,
    selectOpenConversations,
    updateMessageReactions,
} from '@/redux/slices/conversationSlice';
import { useEffect, useRef, useState } from 'react';
import { getMessagesService } from '@/services/conversationService';
import { useSocket } from '@/components/SocketProvider';

export default function MessageList({ conversationId, type, name, avatar, isMinimized }) {
    const socket = useSocket();
    const dispatch = useAppDispatch();

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const messages = useAppSelector(selectMessagesByConversationId(conversationId));
    const openConversations = useAppSelector(selectOpenConversations);

    const [messagesPage, setMessagesPage] = useState(1);
    const [messageLoading, setMessageLoading] = useState(false);

    const [isAtBottom, setIsAtBottom] = useState(true);

    const { observerTarget: observerMessagesTarget } = useInfiniteScroll({
        callback: () => setMessagesPage((prev) => prev + 1),
        threshold: 0.5,
        loading: messageLoading,
    });

    // Get messages
    useEffect(() => {
        if (conversationId) {
            (async () => {
                setMessageLoading(true);
                try {
                    // Save the position before calling API
                    const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;

                    const res = await getMessagesService({ conversationId, page: messagesPage });
                    if (res.data.length > 0) {
                        dispatch(
                            addOldMessages(
                                res.data.map((message: any) => ({
                                    messageId: message.id,
                                    conversationId: message.conversationId,
                                    content: message.content,
                                    fileName: message.fileName,
                                    messageType: message.messageType,
                                    sender: {
                                        userId: message.sender.id,
                                        firstName: message.sender.firstName,
                                        lastName: message.sender.lastName,
                                        avatar: message.sender.avatar,
                                    },
                                    currentReaction: message.currentReaction,
                                    reactions: message.reactions.map((r) => ({
                                        reactionType: r.reactionType,
                                        user: {
                                            userId: r.user.id,
                                            firstName: r.user.firstName,
                                            lastName: r.user.lastName,
                                            avatar: r.user.avatar,
                                        },
                                    })),
                                    createdAt: message.createdAt,
                                })),
                            ),
                        );
                        setMessageLoading(false);

                        // Maintain the coil position after adding the message
                        setTimeout(() => {
                            if (chatContainerRef.current) {
                                const newScrollHeight = chatContainerRef.current.scrollHeight;
                                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                            }
                        }, 0);
                    }
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [conversationId, dispatch, messagesPage]);

    // Socket handle new message and react to message
    useEffect(() => {
        const handleNewMessage = (newMessage: any) => {
            if (conversationId === newMessage.conversationId) {
                dispatch(
                    addNewMessage({
                        messageId: newMessage.messageId,
                        conversationId: newMessage.conversationId,
                        content: newMessage.content,
                        messageType: newMessage.messageType,
                        sender: {
                            userId: newMessage.sender.userId,
                            firstName: newMessage.sender.firstName,
                            lastName: newMessage.sender.lastName,
                            avatar: newMessage.sender.avatar,
                        },
                        currentReaction: null,
                        reactions: [],
                        createdAt: newMessage.lastUpdated,
                    }),
                );
            }
        };

        const handleReactMessage = (messageReaction) => {
            const {
                messageId,
                reactionType,
                sender: { userId, firstName, lastName, avatar },
            } = messageReaction;

            dispatch(
                updateMessageReactions({
                    conversationId,
                    messageId,
                    user: {
                        userId,
                        firstName,
                        lastName,
                        avatar,
                    },
                    reactionType,
                }),
            );
        };

        const handleRemoveReactMessage = ({ messageId, userId }: { messageId: string; userId: string }) => {
            dispatch(
                updateMessageReactions({
                    conversationId,
                    messageId,
                    user: {
                        userId,
                        firstName: '',
                        lastName: '',
                        avatar: null,
                    },
                    reactionType: null,
                }),
            );
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('reactToMessage', handleReactMessage);
        socket.on('removeReactToMessage', handleRemoveReactMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('reactToMessage', handleReactMessage);
            socket.off('removeReactToMessage', handleRemoveReactMessage);
        };
    }, [socket, messages, name, conversationId, dispatch, openConversations]);

    // Scroll bottom of conversation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (chatContainerRef.current && isAtBottom) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isMinimized, isAtBottom, messages.length]);

    // Listens for the scroll event on the chat container
    // Updates the `isAtBottom` state if the user is within 60px of the bottom.
    useEffect(() => {
        if (!chatContainerRef.current) return;

        const handleScroll = () => {
            const container = chatContainerRef.current!;
            const isBottom = container.scrollTop + container.offsetHeight >= container.scrollHeight - 60;
            setIsAtBottom(isBottom);
        };

        const chatContainer = chatContainerRef.current;
        chatContainer?.addEventListener('scroll', handleScroll);

        return () => {
            chatContainer?.removeEventListener('scroll', handleScroll);
        };
    }, [messages.length]);

    const isDifferentTime = (current: number, previous: number) => {
        return !previous || current - previous > 10 * 60 * 1000; // More than 10 minutes apart
    };

    const formatTimeDisplay = (time: any) => {
        const now = new Date();
        if (time.day === now.getDate() && time.month === now.getMonth() + 1) {
            return `${padNumber(time.hours)}:${padNumber(time.minutes)}`;
        }
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (time.day === yesterday.getDate() && time.month === yesterday.getMonth() + 1) {
            return `Hôm qua ${padNumber(time.hours)}:${padNumber(time.minutes)}`;
        }
        return `${padNumber(time.day)}/${padNumber(time.month)}${
            time.year !== now.getFullYear() ? `/${time.year}` : ''
        } ${padNumber(time.hours)}:${padNumber(time.minutes)}`;
    };

    return (
        <div ref={chatContainerRef} className="flex-1 flex flex-col gap-y-1 overflow-y-auto py-2 px-2">
            <div ref={observerMessagesTarget} className="h-1"></div>
            {messages.length > 0 ? (
                <>
                    {messages.map((message, index) => {
                        const time = getTimeFromISO(message.createdAt);
                        const prevMessage = messages[index - 1];
                        const isShowTime = isDifferentTime(
                            new Date(message.createdAt).getTime(),
                            new Date(prevMessage?.createdAt).getTime(),
                        );

                        return (
                            <div key={`message-${message.messageId}`}>
                                {isShowTime && (
                                    <div className="text-xs text-gray font-semibold text-center my-1">
                                        {formatTimeDisplay(time)}
                                    </div>
                                )}
                                <Message
                                    message={message}
                                    conversationId={conversationId}
                                    conversationType={type}
                                    currentReaction={message.currentReaction}
                                    prevSenderId={prevMessage?.sender.userId ?? ''}
                                    prevMessageType={prevMessage?.messageType}
                                    index={index}
                                />
                            </div>
                        );
                    })}
                </>
            ) : (
                <div className="flex flex-col items-center mt-6">
                    <Image
                        className="w-20 h-20 rounded-full border"
                        src={avatar || '/images/default-avatar.png'}
                        alt="avatar"
                        width={800}
                        height={800}
                    />
                    <div className="mt-2">{name}</div>
                    <div className="text-sm mt-4">Hãy bắt đầu trò chuyện</div>
                </div>
            )}
        </div>
    );
}
