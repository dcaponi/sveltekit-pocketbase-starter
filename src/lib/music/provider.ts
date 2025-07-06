import type { PlaylistSearchParams } from ".";

export interface MusicProvider {
    getArtist(id: string): Promise<any>;
    getPlaylist(searchParams: PlaylistSearchParams): Promise<any>
}