'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getMovieDetailBySlugService } from '@/services/movieService';
import { MediaPlayer, MediaPlayerInstance, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/shadcn/alert-dialog';
import { Button } from '@/components/shadcn/button';
import { convertSecondsToTime } from '@/lib/utils';
import { MovieSource } from '@/types';
import MovieLink from '@/components/MovieLink';
import SuggestedMovies from '@/components/SuggestedMovies';
import { MovieType } from '@/lib/enums';

interface WatchHistory {
    slug: string;
    type: MovieType;
    currentEpisode?: number;
    progress?: number;
    episodes?: Record<
        number,
        {
            episode: number;
            progress: number;
        }
    >;
}
const HISTORY_KEY = 'watchHistory';

// Get history from localstorage
const getWatchHistory = (): Record<string, WatchHistory> => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    } catch {
        return {};
    }
};

// Update history view
const updateWatchHistory = (slug: string, progress: number, type: MovieType, currentEpisode?: number) => {
    const history = getWatchHistory();
    history[slug] = {
        slug,
        type,
        ...(type === MovieType.MOVIE && { progress }),
        ...(type === MovieType.TV &&
            currentEpisode && {
                episodes: {
                    ...history[slug]?.episodes,
                    [currentEpisode]: {
                        progress,
                        episode: currentEpisode,
                    },
                },
            }),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Get the history of a movie
const getShowHistory = (slug: string): WatchHistory | null => {
    const history = getWatchHistory();
    return history[slug] || null;
};

// Delete the viewing process
const removeWatchProgress = (slug: string, episode?: number) => {
    const history = getWatchHistory();
    if (history[slug].type === MovieType.MOVIE) {
        delete history[slug];
    } else if (history[slug].episodes && episode) {
        delete history[slug].episodes[episode];
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export default function WatchTVShow() {
    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));

    const { slug, episode } = useParams<{ slug: string; episode: string }>();
    const [movieInfo, setMovieInfo] = useState<MovieSource | null>(null);
    const playerRef = useRef<MediaPlayerInstance | null>(null);

    const currentEpisode = Number(episode);
    const watchHistory = getShowHistory(slug);
    const [showContinueModal, setShowContinueModal] = useState(false);

    // Get detailed information of the movie
    useEffect(() => {
        const getMovieDetail = async () => {
            try {
                if (typeof slug === 'string') {
                    const data = await getMovieDetailBySlugService(source, slug);

                    setMovieInfo(data);

                    if (
                        watchHistory?.type === MovieType.TV &&
                        watchHistory.episodes &&
                        watchHistory.episodes[currentEpisode].progress > 1
                    ) {
                        setShowContinueModal(true);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMovieDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, currentEpisode, source]);

    // Save the time to see Localstorage
    useEffect(() => {
        const saveProgress = () => {
            if (playerRef.current && playerRef.current.currentTime > 0) {
                updateWatchHistory(slug, playerRef.current.currentTime, MovieType.TV, currentEpisode);
            }
        };

        const interval = setInterval(saveProgress, 5000);

        return () => {
            saveProgress();
            clearInterval(interval);
        };
    }, [slug, currentEpisode]);

    const handleContinueWatching = () => {
        if (playerRef.current && watchHistory?.episodes) {
            playerRef.current.currentTime = watchHistory.episodes[currentEpisode].progress ?? 0;
        }
        setShowContinueModal(false);
    };

    const handleStartFromBeginning = () => {
        removeWatchProgress(slug, currentEpisode);
        setShowContinueModal(false);
    };

    return (
        <div className="flex px-10 pt-2">
            <div className="max-w-[900px] px-2 sm:px-4">
                {movieInfo && (
                    <>
                        {showContinueModal && (
                            <AlertDialog open={showContinueModal} onOpenChange={setShowContinueModal}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            <div className="text-base font-normal">
                                                Bạn đang xem đến{' '}
                                                <span className="text-orange-400">
                                                    {watchHistory?.episodes &&
                                                        convertSecondsToTime(
                                                            watchHistory.episodes[currentEpisode].progress || 0,
                                                        )}
                                                </span>
                                            </div>
                                            <div className="text-base font-normal">Bạn có muốn tiếp tục xem không?</div>
                                        </AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <Button variant="outline" onClick={handleStartFromBeginning}>
                                            Bắt đầu mới
                                        </Button>
                                        <Button onClick={handleContinueWatching}>Tiếp tục xem</Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <MediaPlayer
                            ref={playerRef}
                            className="max-w-full w-full aspect-video"
                            src={movieInfo?.source}
                            viewType="video"
                            streamType="on-demand"
                            logLevel="warn"
                            crossOrigin
                            playsInline
                            poster={movieInfo?.posterUrl}
                        >
                            <MediaProvider>
                                <Poster className="vds-poster" />
                            </MediaProvider>
                            <DefaultVideoLayout icons={defaultLayoutIcons} />
                        </MediaPlayer>
                        <div className="text-white mt-6 mb-4">
                            <div className="text-2xl text-orange-400">TẬP PHIM</div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mt-3">
                                {[...Array(movieInfo?.numberOfEpisodes).keys()].map((i) => {
                                    return (
                                        <MovieLink
                                            href={`/movie/${slug}/${i + 1}`}
                                            className={cn(
                                                'bg-white text-black h-10 flex justify-center items-center rounded-md',
                                                i === currentEpisode - 1 && 'bg-red-600 text-white',
                                            )}
                                            key={`${slug}-episode-${i}`}
                                        >
                                            {i + 1}
                                        </MovieLink>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white">
                            <div className="text-white text-2xl font-semibold">
                                {movieInfo.name} - Tập {episode}
                            </div>
                            <div className="text-gray mt-4">{movieInfo.content}</div>
                        </div>
                    </>
                )}
            </div>
            {movieInfo?.genres && <SuggestedMovies className="flex-1" genres={movieInfo.genres} />}
        </div>
    );
}
