import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/components/Icons';

export const MOVIES_LIMIT_IN_ROW = 24;
export const HOME_GENRE_DISPLAY_LIMIT = 4;

export const ReactionTypeIcon = {
    LIKE: LikeIcon,
    LOVE: LoveIcon,
    LOVE_LOVE: LoveLoveIcon,
    HAHA: HaHaIcon,
    WOW: WowIcon,
    SAD: SadIcon,
    ANGRY: AngryIcon,
} as const;

export type ReactionNameType = keyof typeof ReactionTypeIcon;

export const ReactionTypeName = {
    LIKE: 'Thích',
    LOVE: 'Yêu thích',
    LOVE_LOVE: 'Thương thương',
    HAHA: 'Haha',
    WOW: 'Wow',
    SAD: 'Buồn',
    ANGRY: 'Phẫn nộ',
} as const;

export const ReactionTypeColor = {
    LIKE: '#0677fe',
    LOVE: '#fe484f',
    LOVE_LOVE: '#fed674',
    HAHA: '#fed674',
    WOW: '#fed674',
    SAD: '#fed674',
    ANGRY: '#ee6451',
} as const;
