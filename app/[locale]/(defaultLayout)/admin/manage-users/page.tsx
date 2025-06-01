'use client';

import { createUserService, getUsersService, lockUserService, unlockUserService } from '@/lib/services/adminService';
import { Role } from '@/lib/slices/userSlice';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { Pagination } from 'flowbite-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { AxiosError } from 'axios';
import { UserGear, LockKey, User, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import useFetch from '@/hooks/useFetch';

const formSchema = z
    .object({
        username: z
            .string()
            .min(6, {
                message: 'Username must be at least 6 characters.',
            })
            .max(30, {
                message: 'Username must not exceed 30 characters.',
            }),
        password: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters.',
            })
            .max(32, {
                message: 'Password must not exceed 32 characters.',
            })
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
            .regex(/\d/, 'Password must contain at least one number.')
            .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&).'),
        confirmPassword: z.string(),
        firstName: z.string().min(1, {
            message: 'Please enter your first name.',
        }),
        lastName: z.string().min(1, {
            message: 'Please enter your last name.',
        }),
        role: z.nativeEnum(Role),
    })
    .refine(
        ({ password, confirmPassword }) => {
            return password === confirmPassword;
        },
        {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        },
    );

type TUserInfo = {
    id: string;
    username: string;
    lastName: string;
    firstName: string;
    role: Role;
    isActive: boolean;
};

export default function ManageUsers() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            role: Role.USER,
        },
    });

    const [users, setUsers] = useState<TUserInfo[]>([]);

    const { data, page, totalPages, keyword, setKeyword, setPage } = useFetch<TUserInfo>(getUsersService, {
        paginated: true,
    });

    useEffect(() => {
        setUsers(
            data.map((u) => ({
                id: u.id,
                username: u.username,
                lastName: u.lastName,
                firstName: u.firstName,
                role: u.role,
                isActive: u.isActive,
            })),
        );
    }, [data]);

    const [showDialogLockUser, setShowDialogLockUser] = useState(false);
    const [userInfoToLock, setUserInfoToLock] = useState<{
        id: string;
        name: string;
    }>();

    const [showDialogCreateAccount, setShowDialogCreateAccount] = useState(false);

    const handleLockUser = async (userId: string) => {
        try {
            await lockUserService(userId);
            setUsers((prev) =>
                prev.map((u) => ({
                    ...u,
                    isActive: u.id === userId ? false : u.isActive,
                })),
            );
            setShowDialogLockUser(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUnlockUser = async (userId: string) => {
        try {
            await unlockUserService(userId);
            setUsers((prev) =>
                prev.map((u) => ({
                    ...u,
                    isActive: u.id === userId ? true : u.isActive,
                })),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createUserService(values);
            setShowDialogCreateAccount(false);
            toast.success('Tạo tài khoản thành công');
        } catch (error) {
            if (error instanceof AxiosError && error?.response?.data.message === 'Username already exists') {
                form.setError('username', {
                    type: 'manual',
                    message: 'Username already exists',
                });
            }
            console.error(error);
        } finally {
        }
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-between gap-x-20">
                <input
                    className="outline-none px-3 py-1 rounded-2xl flex-1"
                    value={keyword}
                    placeholder="Tìm kiếm tên người dùng"
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <Dialog open={showDialogCreateAccount} onOpenChange={setShowDialogCreateAccount}>
                    <DialogTrigger asChild>
                        <Button>Tạo tài khoản</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Tạo tài khoản</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                method="post"
                                className="w-full space-y-1 flex flex-col items-center"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="flex w-full">
                                    <div className="flex-1 flex flex-col items-center">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-4">
                                                            <User className="w-5 h-5 me-2" />
                                                            <input
                                                                className="w-4/5 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your username"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="!mt-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <LockKey className="w-5 h-5 me-2" />
                                                            <input
                                                                className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your password"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="!mt-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <LockKey className="w-5 h-5 me-2" />
                                                            <input
                                                                className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your confirm password"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-4">
                                                            <UserCircle className="w-5 h-5 me-2" />
                                                            <input
                                                                className="w-4/5 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your first name"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="!mt-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <UserCircle className="w-5 h-5 me-2" />
                                                            <input
                                                                className="w-4/5 p-0 border-none outline-none focus:shadow-none focus:ring-transparent"
                                                                placeholder="Type your last name"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="!mt-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="w-4/5">
                                                    <FormControl className="w-4/5">
                                                        <div className="w-full border-b pb-2 flex items-center mt-3">
                                                            <UserGear className="w-5 h-5 me-2" />
                                                            <div className="flex justify-around flex-1 items-center">
                                                                {Object.values(Role).map((role) => (
                                                                    <span
                                                                        className="flex items-center"
                                                                        key={`role-${role}`}
                                                                    >
                                                                        <input
                                                                            className="me-1"
                                                                            type="radio"
                                                                            {...field}
                                                                            value={role}
                                                                        />{' '}
                                                                        {role}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-40 !mt-6 py-2 bg-primary text-background rounded-full text-lg"
                                    type="submit"
                                >
                                    Signup
                                </Button>
                            </form>
                        </Form>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="mt-3">
                <TableHead className="bg-background border-b">
                    <TableHeadCell>Username</TableHeadCell>
                    <TableHeadCell>Tên</TableHeadCell>
                    <TableHeadCell>Vai trò</TableHeadCell>
                    <TableHeadCell>Trạng thái</TableHeadCell>
                    <TableHeadCell></TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                    {users.map((u) => (
                        <TableRow
                            className={`${u.role === Role.ADMIN ? 'bg-primary/50' : 'bg-background'}`}
                            key={`user-${u.id}`}
                        >
                            <TableCell className="!table-cell line-clamp-1 break-all">{u.username}</TableCell>
                            <TableCell>
                                {u.lastName} {u.firstName}
                            </TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                                <Checkbox checked={u.isActive} />
                            </TableCell>
                            <TableCell>
                                {u.isActive ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setUserInfoToLock({
                                                id: u.id,
                                                name: `${u.lastName} ${u.firstName}`,
                                            });
                                            setShowDialogLockUser(true);
                                        }}
                                    >
                                        <Lock className="w-5" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleUnlockUser(u.id)}>
                                        <Unlock className="w-5" />
                                    </Button>
                                )}
                                <Dialog open={showDialogLockUser} onOpenChange={setShowDialogLockUser}>
                                    <DialogContent className="sm:max-w-[550px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Bạn có chắc chắn muốn khoá tài khoản của {userInfoToLock?.name}?
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setShowDialogLockUser(false)}>
                                                Huỷ
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => userInfoToLock?.id && handleLockUser(userInfoToLock.id)}
                                            >
                                                Khoá
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex overflow-x-auto sm:justify-center">
                <Pagination currentPage={page!} totalPages={totalPages!} onPageChange={setPage!} />
            </div>
        </div>
    );
}
