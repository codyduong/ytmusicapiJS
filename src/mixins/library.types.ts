import { parsePlaylistItemsReturn } from '../parsers/playlists.types';
import { thumbnails } from './browsing.types';

export type Order = 'a_to_z' | 'z_to_a' | 'recently_added';
export type Rating = 'LIKE' | 'DISLIKE' | 'INDIFFERENT';

export type getLibraryAlbumsReturn = {
  browseId: string;
  title: string;
  type: string;
  thumbnails: thumbnails;
  artists: {
    name: string;
    id: string;
  }[];
  year: string;
}[];
export type getLibraryArtistsReturn = {
  browseId: string;
  artist: string;
  subscribers: string;
  thumbnails: thumbnails;
}[];
export type getHistoryReturn = (parsePlaylistItemsReturn[number] & {
  played: boolean;
})[];
