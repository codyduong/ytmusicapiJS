import { thumbnails } from '../types';
import { parsePlaylistItemsReturn } from './playlists.types';

export type parseAlbumsReturn = {
  browseId: string;
  playlistId: string | null;
  title: string;
  thumbnails: string;
  year?: string | undefined;
  type?: string | undefined;
  artists?:
    | undefined
    | {
        name: string;
        id: string;
      }[];
}[];
export type parseArtistsReturn = {
  browseId: string;
  artist: string;
  songs: string;
  subscribers: string;
  thumbnails: thumbnails;
}[];
export type parseLibarySongsReturn = {
  results: any;
  parsed: parsePlaylistItemsReturn;
};
export type parseLibraryArtistsReturn = parseArtistsReturn;
