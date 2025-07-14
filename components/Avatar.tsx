'use client';

import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';

interface AvatarProps extends Omit<ImageProps, 'alt'> {
    width?: number;
    height?: number;
    alt?: string;
}

export default function Avatar({ src, className, width = 32, height = 32, alt = 'avatar' }: AvatarProps) {
    return (
        <Image
            className={cn('rounded-full border w-8 h-8 object-cover border', className)}
            style={{ width, height }}
            src={src || '/images/default-avatar.png'}
            alt={alt}
            width={800}
            height={800}
            onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')}
        />
    );
}
