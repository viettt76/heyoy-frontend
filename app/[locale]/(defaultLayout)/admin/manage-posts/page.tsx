'use client';

import PostManagement from '@/app/components/PostManagement';
import { PostManagementType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { approvePostService, getPostsNotCensoredService, rejectPostService } from '@/lib/services/adminService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminManagePost() {
    const { data, loading, fetchNext } = useFetch<PostManagementType>(getPostsNotCensoredService, {
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
        if (data?.length > 0) {
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
        }
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

    const handleRejectPost = async (postId: string) => {
        try {
            await rejectPostService(postId);
            toast.success('Từ chối phê duyệt thành công', {
                duration: 2500,
            });
            setPosts((prev) => prev.filter((p) => p.postId !== postId));
        } catch (error) {
            console.error(error);
            toast.error('Từ chối phê duyệt thất bại', {
                duration: 2500,
            });
        }
    };

    return (
        <div>
            {posts.map((post) => (
                <PostManagement
                    postInfo={post}
                    key={`post-${post.postId}`}
                    handleApprovePost={handleApprovePost}
                    handleRejectPost={handleRejectPost}
                />
            ))}
            <div ref={observerTarget} className="h-20"></div>
        </div>
    );
}
