export interface Track {
    id: string;
    title: string;
    artist: string;
    source: Source;
    album: string;
    uri?: string;
    url?: string;
    duration?: number;
}

export type Source = 'spotify' | 'local';

export type Genre = 
'classic-rock' | 
'hip-hop' | 
'rnb' | 
'jazz' | 
'oldies' | 
'top-hits';


export interface GenreOption {
    id: Genre;
    name: string;
    icon: string;
    playlistID?: string | null;
}

export interface PlaylistSearchParams {
    id?: string | null
    genre?: Genre | null;
    artist?: string | null;
    searchTerms?: string | null;
    decade?: string | null;
}