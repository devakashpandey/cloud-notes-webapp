'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useQueryParams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getParam = useCallback(
        (key: string, defaultValue = '') =>
            searchParams.get(key) || defaultValue,
        [searchParams]
    );

    const setParams = useCallback(
        (params: Record<string, string | number | null | undefined>) => {
            const query = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value == null || value === '' || value === 'all') {
                    query.delete(key);
                } else {
                    query.set(key, String(value));
                }
            });

            const search = query.toString();
            router.replace(`${pathname}${search ? `?${search}` : ''}`, {
                scroll: false,
            });
        },
        [searchParams, pathname, router]
    );

    return { getParam, setParams };
}