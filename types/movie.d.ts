import { MovieType } from '@/lib/enums';

export interface BaseMovieData {
    movieId: string;
    name: string;
    originName: string;
    slug: string;
    thumbUrl: string;
    type: MovieType;
}

export interface MovieDetails {
    trailerUrl: string;
    posterUrl: string;
    content: string;
    time: string;
    voteAverage: number;
    actors: string[];
    genres: string[];
    releaseYear: number | string;
}

export interface MovieSource {
    name: string;
    source: string;
    posterUrl: string;
    numberOfEpisodes: number;
    type: MovieType;
    genres: [];
    content: string;
}

export interface MovieCountry {
    id: string;
    name: string;
    slug: string;
}

export interface MovieCollection {
    title: string;
    movies: BaseMovieData[];
    totalMovies: number;
    totalPages: number;
}
