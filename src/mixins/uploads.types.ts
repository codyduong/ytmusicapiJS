import {
  getLibraryAlbumsReturn,
  getLibraryArtistsReturn,
  Order as _Order,
  Rating,
} from './library.types';
import { thumbnails } from './browsing.types';

export type Order = _Order;
export type uploadsOptions = {
  limit: number;
  order: Order;
};

/**
 * getLibraryUploadSongs
 */
export type getLibraryUploadSongsReturn = {
  entityId: string;
  videoId: string;
  artists: {
    name: string;
    id: string;
  }[];
  title: string;
  album: string;
  likeStatus: Rating;
  thumbnails: thumbnails;
}[];
export type getLibraryUploadAlbumsReturn = getLibraryAlbumsReturn;
export type getLibraryUploadArtistsReturn = getLibraryArtistsReturn;
export type getLibraryUploadArtistReturn = {
  entityId: string;
  videoId: string;
  title: string;
  artists: {
    name: string;
    id: string;
  }[];
  album: {
    name: string;
    id: string;
  } | null;
  likeStatus: Rating;
  thumbnails: thumbnails;
}[];
export type getLibraryUploadAlbumReturn = {
  title: string;
  type: string;
  thumbnails: thumbnails;
  trackCount: number;
  duration: string;
  audioPlaylistId: string;
  tracks: {
    entityId: string;
    videoId: string;
    title: string;
    duration: string;
    duration_seconds: number;
    artists: null | {
      name: string;
      id: string;
    };
    album: null | {
      name: string;
      id: string;
    };
    likeStatus: Rating;
    thumbnails: thumbnails;
  }[];
};
