import { ReactionNameType } from '@/lib/constants';
import { MessageType } from '@/lib/enums';
import { ConversationType } from '@/redux/slices/conversationSlice';

export type MessageData = {
    messageId: string;
    conversationId: string;
    content: string;
    fileName?: string;
    messageType: MessageType;
    sender: UserInfoType;
    currentReaction: ReactionNameType | null;
    reactions: ReactionTypeBase[];
    createdAt: Date | string;
};

export type GroupConversationType = {
    conversationId: string;
    type: ConversationType;
    name: string;
    avatar?: string;
};

export type MessengerType = {
    conversationId: string;
    conversationName: string;
    conversationType: ConversationType;
    conversationAvatar?: string;
    lastMessage: MessageData;
    lastUpdated: string;
    friendId?: string;
};
