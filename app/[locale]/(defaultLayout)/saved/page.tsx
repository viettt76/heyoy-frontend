'use client';

import Post from '@/app/components/Post';
import { PostInfoType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getBookmarkPostsService } from '@/lib/services/postService';
import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';

export default function Saved() {
    const { data, loading, fetchNext } = useFetch(getBookmarkPostsService, {
        paginated: true,
    });

    const [posts, setPosts] = useState<PostInfoType[]>([]);

    // Hook for infinite scrolling: Calls `increasePage` when the user scrolls near the bottom
    const { observerTarget } = useInfiniteScroll({
        callback: fetchNext!,
        threshold: 0.5,
        loading,
    });

    // Get more posts when change page
    useEffect(() => {
        if (data.length > 0) {
            setPosts((prev) => [
                ...prev,
                ...data
                    .filter((post: any) => !prev.find((p) => p.postId === post.postId))
                    .map((post: any) => ({
                        postId: post.postId,
                        creatorInfo: post.posterInfo,
                        isBookmarked: post.isBookmarked,
                        content: post.content,
                        currentReactionType: post.currentReactionType,
                        images: post.images.map((image: any) => image.imageUrl),
                        reactions: post.reactions.map((reaction: any) => ({
                            postReactionId: reaction.id,
                            reactionType: reaction.reactionType,
                            userInfo: {
                                userId: reaction.user.id,
                                firstName: reaction.user.firstName,
                                lastName: reaction.user.lastName,
                                avatar: reaction.user.avatar,
                            },
                        })),
                        commentsCount: Number(post.commentsCount),
                        createdAt: post.createdAt,
                    })),
            ]);
        }
    }, [data]);

    return (
        <div className="bg-secondary min-h-[calc(100vh-4rem)] bg-fixed">
            <div className="sm:flex max-w-[1024px] mx-auto relative gap-x-6 pt-4 px-3 max-lg:gap-x-3">
                <div className="w-96 max-md:w-60 text-xl font-semibold">Bài viết đã lưu</div>
                <div className="flex-1 max-sm:mt-3">
                    {loading ? (
                        <div className="text-center text-primary">
                            <Spinner />
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {posts.map((post) => (
                                <Post postInfo={post} key={`post-${post.postId}`} />
                            ))}
                            <div ref={observerTarget} className="h-20"></div>
                        </>
                    ) : (
                        <div className="text-center text-primary">Bạn chưa lưu bài viết nào</div>
                    )}
                </div>
            </div>
        </div>
    );
}
