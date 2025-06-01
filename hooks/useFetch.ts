import { useEffect, useState, useCallback } from 'react';
import useDebounced from '@/hooks/useDebounced';

type FetchFunction<T> = (params?: any) => Promise<{
    data: {
        [key: string]: T[] | number;
        totalPages: number;
    };
}>;

type UseFetchOptions = {
    paginated?: boolean;
    initialPage?: number;
    pageSize?: number;
    initialKeyword?: string;
    debounceTime?: number;
};

export default function useFetch<T>(fetchFunction: FetchFunction<T>, options: UseFetchOptions = {}) {
    const { paginated = false, initialPage = 1, pageSize = 10, initialKeyword = '', debounceTime = 1000 } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState(initialKeyword);

    const debouncedKeyword = useDebounced(keyword, debounceTime);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params: any = {};
            if (paginated) {
                params.page = page;
                params.pageSize = pageSize;
            }
            if (debouncedKeyword.trim().length > 0) {
                params.keyword = debouncedKeyword.trim();
            }

            const res = await fetchFunction(params);
            const list = Object.values(res.data).find((v) => Array.isArray(v)) as T[];

            setData(list);

            setTotalPages(res.data.totalPages);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, page, pageSize, paginated, debouncedKeyword]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [debouncedKeyword]);

    const fetchNext = () => {
        if (page < totalPages) setPage((p) => p + 1);
    };

    const fetchPrev = () => {
        if (page > 1) setPage((p) => p - 1);
    };

    const refetch = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        refetch,
        keyword,
        setKeyword,
        debouncedKeyword,
        ...(paginated && {
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            fetchNext,
            fetchPrev,
            setPage,
        }),
    };
}
