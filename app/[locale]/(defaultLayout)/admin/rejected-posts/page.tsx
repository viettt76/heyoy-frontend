'use client';

import PostManagement from '@/app/components/PostManagement';
import { PostManagementType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { approvePostService, getRejectedPostsService } from '@/lib/services/adminService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminRejectedPost() {
    const { data, loading, fetchNext } = useFetch<PostManagementType>(getRejectedPostsService, {
        paginated: true,
    });

    const [posts, setPosts] = useState<PostManagementType[]>([]);

    // Hook for infinite scrolling: Calls `increasePage` when the user scrolls near the bottom
    const { observerTarget } = useInfiniteScroll({
        callback: fetchNext!,
        threshold: 0.5,
        loading,
    });

    // Get more posts when change page
    useEffect(() => {
        setPosts((prev) => [
            ...prev,
            ...data
                .filter((post: any) => !prev.find((p) => p.postId === post.postId))
                .map((post: any) => ({
                    postId: post.postId,
                    creatorInfo: post.posterInfo,
                    content: post.content,
                    images: post.images.map((image: any) => image.imageUrl),
                    createdAt: post.createdAt,
                })),
        ]);
    }, [data]);

    const handleApprovePost = async (postId: string) => {
        try {
            await approvePostService(postId);
            toast.success('Phê duyệt thành công', {
                duration: 2500,
            });
            setPosts((prev) => prev.filter((p) => p.postId !== postId));
        } catch (error) {
            console.error(error);
            toast.error('Phê duyệt thất bại', {
                duration: 2500,
            });
        }
    };

    return (
        <>
            {posts.length > 0 ? (
                <div>
                    {posts.map((post) => (
                        <PostManagement
                            postInfo={post}
                            key={`post-${post.postId}`}
                            handleApprovePost={handleApprovePost}
                        />
                    ))}
                    <div ref={observerTarget} className="h-20"></div>
                </div>
            ) : (
                <div className="text-center text-primary">Không có bài viết từ chối nào</div>
            )}
        </>
    );
}
