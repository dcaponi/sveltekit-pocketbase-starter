import { SpotifyApi } from '@spotify/web-api-ts-sdk';

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import type { MusicProvider } from "./provider";
import type { Authable, Token, TokenHandler } from '$lib/auth/provider';
import type { PlaylistSearchParams, Source, Track } from './types';


export class SpotifyProvider implements MusicProvider, Authable {
    sdk: SpotifyApi

    constructor(token: Token) {
        const accessToken = {
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
            token_type: 'Bearer',
            expires_in: 3600
        };
        this.sdk = SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, accessToken);
    }

    getArtist = async (id: string): Promise<any> => {
        return await this.sdk.artists.get(id);
    }

    getPlaylist = async (searchParams: PlaylistSearchParams): Promise<Track[]> => {
        try {
            if (searchParams.id) {
                return (await this.sdk.playlists.getPlaylist(searchParams.id))
                    .tracks.items.map(track => {
                        const t = track.track
                        return {
                            id: t?.id,
                            title: t?.name,
                            artist: t?.artists.map(artist => artist.name).join(" "),
                            source: 'spotify' as Source,
                            album: t?.album.name,
                            uri: t?.uri,
                            url: t?.external_urls.spotify,
                            duration: t?.duration_ms,
                        }
                    });
            }
            return [];
        } catch(e) {
            console.log("[getPlaylist Error]:", searchParams, e);
            return [];
        }
    }

    reauth = async(provider: TokenHandler): Promise<Token | null> => {
        const oldToken = await provider.getToken("spotify");
        if (!oldToken) {
            console.log("[spotify reauth error]: no existing token found, user should auth");
            return null;
        }

        const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: oldToken.refreshToken,
            }),
        });
        const token = await res.json();
        if (token.access_token && token.refresh_token) {
            this.sdk = SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, token);
            const updatedUser = await provider.setToken("spotify", token.access_token, token.refresh_token);
            if (updatedUser) return updatedUser?.tokens?.spotify ?? null;
        }
        return null;
    }
}

