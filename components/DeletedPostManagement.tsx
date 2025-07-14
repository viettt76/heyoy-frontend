import { PostManagementType } from '@/types';
import { Button } from '@/components/shadcn/button';
import PostManagementBase from './PostMangementBase';

export default function DeletedPostManagement({
    postInfo,
    handleRecoverPost,
}: {
    postInfo: PostManagementType;
    handleRecoverPost: (postId: string) => void;
}) {
    return (
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <PostManagementBase postInfo={postInfo} />
            <div className="flex gap-x-4 mt-6 pt-2 border-t">
                <Button className="flex-1" onClick={() => handleRecoverPost(postInfo.postId)}>
                    Khôi phục
                </Button>
            </div>
        </div>
    );
}
