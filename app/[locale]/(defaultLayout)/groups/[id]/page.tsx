'use client';

import Post from '@/components/Post';
import { Button } from '@/components/shadcn/button';
import WritePost from '@/components/WritePost';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function GroupDetailPage() {
    return (
        <div>
            <Image
                className="w-full h-48 border-b"
                src={'/images/default-avatar.png'}
                alt="avatar-group"
                width={800}
                height={800}
            />
            <div className="bg-background p-3 flex justify-between">
                <div>
                    <Button variant="secondary" className="border">
                        Like
                    </Button>
                    <Button variant="secondary" className="border">
                        Follow
                    </Button>
                    <Button variant="secondary" className="border">
                        More
                    </Button>
                </div>
                <div>
                    <Button variant="secondary" className="border">
                        Message
                    </Button>
                </div>
            </div>

            <div className="mt-3">
                <WritePost />
            </div>

            <div className="mt-3">
                <Post
                    postInfo={{
                        postId: '1',
                        creatorInfo: {
                            userId: 'a',
                            firstName: 'a',
                            lastName: 'a',
                        },
                        isBookmarked: false,
                        content: '1',
                        currentReactionType: 'LIKE',
                        images: [],
                        reactions: [],
                        commentsCount: 1,
                        createdAt: '1',
                    }}
                />
            </div>
        </div>
    );
}
