'use client';

import { MovieItem } from '@/components/MovieItem';
import { MovieCollection } from '@/types';
import { getMovieListByCountryService } from '@/services/movieService';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import ReactPaginate from 'react-paginate';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';

export default function MoviesByCountry() {
    const { country } = useParams();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page'));
    const source = Number(searchParams.get('source'));

    const router = useRouter();

    const moviesPerSlide = useMoviesPerSlide();

    const [data, setData] = useState<MovieCollection>({
        title: '',
        movies: [],
        totalMovies: 0,
        totalPages: 0,
    });

    const [pageRange, setPageRange] = useState(5);

    useEffect(() => {
        const updatePageRange = () => {
            setPageRange(window.innerWidth < 640 ? 2 : 5);
        };
        updatePageRange();
        window.addEventListener('resize', updatePageRange);
        return () => window.removeEventListener('resize', updatePageRange);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                if (typeof country === 'string') {
                    const data = await getMovieListByCountryService(source, country, page);
                    setData(data);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [country, page, source]);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Phim quốc gia {data.title}</div>
            <div className={`grid grid-cols-${moviesPerSlide} gap-x-2 gap-y-4 mt-2`}>
                {data.movies.map((m, index) => {
                    return (
                        <MovieItem
                            movieId={m.movieId}
                            name={m.name}
                            originName={m.originName}
                            slug={m.slug}
                            thumbUrl={m.thumbUrl}
                            type={m.type}
                            isFirst={index % moviesPerSlide === 0}
                            isLast={(index + 1) % moviesPerSlide === 0}
                            key={`movie-${m.movieId}`}
                        />
                    );
                })}
            </div>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={(p) => router.push(`/movie/country/${country}?page=${p.selected + 1}`)}
                pageRangeDisplayed={pageRange}
                pageCount={data.totalPages}
                previousLabel="<"
                renderOnZeroPageCount={null}
                forcePage={page ? page - 1 : 0}
                containerClassName="mt-4 mb-4 flex justify-center text-white gap-x-2"
                breakClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                pageClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                previousClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                nextClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                activeClassName="text-primary"
                disabledClassName="hidden"
            />
        </div>
    );
}
