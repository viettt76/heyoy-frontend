import { Role } from '../redux/slices/userSlice';
import axios from './api';

export const getPostsNotCensoredService = ({ page }: { page: number }) => {
    return axios.get(`/admin/posts-not-censored?page=${page}`);
};

export const getRejectedPostsService = ({ page }: { page: number }) => {
    return axios.get(`/admin/rejected-posts?page=${page}`);
};

export const approvePostService = (postId: string) => {
    return axios.patch(`/admin/approve-post/${postId}`);
};

export const rejectPostService = (postId: string) => {
    return axios.patch(`/admin/reject-post/${postId}`);
};

export const getUsersService = ({ page, keyword }: { page: number; keyword: string }) => {
    return axios.get('/admin/users', {
        params: { page, keyword },
    });
};

export const lockUserService = (userId: string) => {
    return axios.patch(`/admin/users/${userId}/lock`);
};

export const unlockUserService = (userId: string) => {
    return axios.patch(`/admin/users/${userId}/unlock`);
};

export const createUserService = ({
    username,
    password,
    firstName,
    lastName,
    role,
}: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
}) => {
    return axios.post('/admin/users', {
        username,
        password,
        firstName,
        lastName,
        role,
    });
};
