'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';
import { AlignJustify, ChevronRight } from 'lucide-react';
import { Drawer } from 'flowbite-react';
import useDebounced from '@/hooks/useDebounced';
import { searchMovieService, Source } from '@/services/movieService';
import { BaseMovieData } from '@/types';
import useClickOutside from '@/hooks/useClickOutside';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import MovieLink from '@/components/MovieLink';
import { useSearchParams } from 'next/navigation';
import HeaderRight from './HeaderRight';

export default function MovieHeader() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));

    const [isOpenSidebarModal, setIsOpenSidebarModal] = useState(false);

    const handleShowSidebarModal = () => setIsOpenSidebarModal(true);
    const handleCloseSidebarModal = () => setIsOpenSidebarModal(false);

    const [width, setWidth] = useState(0);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    const [searchValue, setSearchValue] = useState('');
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [searchResult, setSearchResult] = useState<{
        movies: BaseMovieData[];
        totalItems: number;
    }>({ movies: [], totalItems: 0 });

    const keywordSearch = useDebounced(searchValue, 400);

    const searchRef = useRef<HTMLDivElement | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    const [showGenreList, setShowGenreList] = useState(false);
    const [showCountryList, setShowCountryList] = useState(false);

    useEffect(() => {
        const updateSide = () => {
            if (parentRef.current && headerRef.current) {
                setWidth(parentRef.current.offsetWidth);
            }
            setIsMobile(window.innerWidth < 576 ? true : false);
        };

        updateSide();
        window.addEventListener('resize', updateSide);

        return () => {
            window.removeEventListener('resize', updateSide);
        };
    }, []);

    const handleShowSearchResult = () => setShowSearchResult(true);
    const handleHideSearchResult = () => setShowSearchResult(false);

    useClickOutside(searchRef, handleHideSearchResult);

    useEffect(() => {
        (async () => {
            try {
                if (keywordSearch) {
                    const data = await searchMovieService(source, keywordSearch);
                    setSearchResult({
                        movies: data.movies,
                        totalItems: data.totalItems,
                    });
                } else {
                    setSearchResult({
                        movies: [],
                        totalItems: 0,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [keywordSearch, source]);

    return (
        <div ref={parentRef} className="w-full">
            <div ref={headerRef} className="h-16 bg-[#0a0a0a] shadow-sm fixed top-0 left-0 z-50" style={{ width }}>
                {isOpenSidebarModal && (
                    <Drawer
                        open={isOpenSidebarModal}
                        onClose={handleCloseSidebarModal}
                        className="bg-[#0a0a0a] border-r border-[#2d2d2d]"
                    >
                        <Drawer.Items className="flex flex-col gap-y-3">
                            <div className="flex gap-x-4">
                                <Link
                                    className={`${source === Source.OPHIM ? 'text-[#ff7c22]' : 'text-white'}`}
                                    href={`/movie?source=${Source.OPHIM}`}
                                    onClick={handleCloseSidebarModal}
                                >
                                    Server 1
                                </Link>
                                <Link
                                    className={`${source === Source.KKPHIM ? 'text-[#ff7c22]' : 'text-white'}`}
                                    href={`/movie?source=${Source.KKPHIM}`}
                                    onClick={handleCloseSidebarModal}
                                >
                                    Server 2
                                </Link>
                            </div>

                            <MovieLink
                                href="/movie/favorites"
                                className="text-white block"
                                onClick={handleCloseSidebarModal}
                            >
                                Phim yêu thích
                            </MovieLink>
                            <TooltipProvider>
                                <Tooltip open={isMobile ? showGenreList : undefined} onOpenChange={setShowGenreList}>
                                    <TooltipTrigger
                                        asChild
                                        onClick={() => isMobile && setShowGenreList((prev) => !prev)}
                                    >
                                        <div className="text-white flex items-center w-fit">
                                            Thể loại <ChevronRight />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side={isMobile ? 'bottom' : 'right'}
                                        align="start"
                                        className="bg-[#2d2d2d] border-[#2d2d2d] border w-fit px-4 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
                                    >
                                        {JSON.parse(sessionStorage.getItem('genreList') ?? '[]').map((g: any) => (
                                            <MovieLink
                                                href={`/movie/genre/${g.slug}`}
                                                className="text-white hover:text-orange-400 text-sm"
                                                key={`genre-${g.slug}`}
                                                onClick={handleCloseSidebarModal}
                                            >
                                                {g.name}
                                            </MovieLink>
                                        ))}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip
                                    open={isMobile ? showCountryList : undefined}
                                    onOpenChange={setShowCountryList}
                                >
                                    <TooltipTrigger
                                        asChild
                                        onClick={() => isMobile && setShowCountryList((prev) => !prev)}
                                    >
                                        <div className="text-white flex items-center w-fit">
                                            Quốc gia <ChevronRight />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side={isMobile ? 'bottom' : 'right'}
                                        align="start"
                                        className="bg-[#2d2d2d] border-[#2d2d2d] border w-fit px-4 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
                                    >
                                        {JSON.parse(sessionStorage.getItem('countryList') ?? '[]').map((g: any) => (
                                            <MovieLink
                                                href={`/movie/country/${g.slug}`}
                                                className="text-white hover:text-orange-400 text-sm"
                                                key={`country-${g.slug}`}
                                                onClick={handleCloseSidebarModal}
                                            >
                                                {g.name}
                                            </MovieLink>
                                        ))}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Drawer.Items>
                    </Drawer>
                )}
                <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 h-full mx-auto flex items-center justify-between gap-x-6 max-md:gap-x-4">
                    <div className="w-64 max-sm:w-36 max-xs:w-20 flex items-center gap-x-4 max-xs:gap-x-2 justify-start">
                        <div className="h-full flex items-center justify-center">
                            <AlignJustify className="text-white" onClick={handleShowSidebarModal} />
                        </div>
                        <MovieLink href="/" className="block w-fit max-sm:hidden">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </MovieLink>
                        <MovieLink
                            href={`/movie`}
                            className="block w-fit px-2 text-white hover:text-orange-400 hover:underline"
                        >
                            Trang chủ
                        </MovieLink>
                    </div>
                    <div ref={searchRef} className="flex-1 flex rounded-3xl items-center pe-4 h-fit bg-white relative">
                        <input
                            value={searchValue}
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent text-black"
                            placeholder="Tìm kiếm phim"
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') router.push(`/movie/search?keyword=${searchValue}`);
                            }}
                            onFocus={handleShowSearchResult}
                        />
                        <MagnifyingGlass className="text-black max-sm:hidden" />
                        {searchResult.movies.length > 0 && showSearchResult && (
                            <div
                                className={`py-1 flex flex-col bg-white rounded-sm shadow-all-sides ${
                                    isMobile
                                        ? 'fixed top-[calc(3.8rem)] left-2 right-2 '
                                        : 'absolute top-[calc(100%+0.3rem)] left-0 right-0'
                                }`}
                            >
                                {searchResult.totalItems > 0 && (
                                    <MovieLink
                                        href={`/movie/search?keyword=${searchValue}`}
                                        className="text-primary text-sm px-4 mb-1"
                                    >
                                        Xem tất cả
                                    </MovieLink>
                                )}
                                {searchResult.movies.slice(0, 10).map((r) => (
                                    <MovieLink
                                        href={`/movie/${r.slug}`}
                                        className="text-black px-4 line-clamp-1 break-all"
                                        key={`result-${r.movieId}`}
                                        onClick={() => {
                                            handleHideSearchResult();
                                            setSearchValue('');
                                        }}
                                    >
                                        {r.name}
                                    </MovieLink>
                                ))}
                            </div>
                        )}
                    </div>
                    <HeaderRight isDarkMode={true} />
                </div>
            </div>
            <div className="h-16"></div>
        </div>
    );
}
