import { ReactionNameType } from '@/lib/constants';

export type PostReactionType = ReactionTypeBase & {
    postReactionId: string;
};

export type CommentReactionType = ReactionTypeBase & {
    commentReactionId: string;
};

export type PostInfoType = {
    postId: string;
    creatorInfo: UserInfoType;
    isBookmarked?: boolean;
    content?: string;
    currentReactionType?: ReactionNameType | null;
    images?: string[];
    reactions: PostReactionType[];
    commentsCount: number;
    createdAt: Date | string;
};

export type PostManagementType = {
    postId: string;
    creatorInfo: UserInfoType;
    content?: string;
    images?: string[];
    createdAt: Date | string;
};

export type CommentType = {
    commentId: string;
    parentCommentId?: string;
    commentatorInfo: UserInfoType;
    content?: string;
    image?: string;
    commentChild?: CommentType[];
    currentReactionType?: ReactionNameType;
    repliesCount: number;
    reactions: CommentReactionType[];
};
