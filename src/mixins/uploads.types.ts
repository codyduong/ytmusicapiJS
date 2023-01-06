import {
  getLibraryAlbumsReturn,
  getLibraryArtistsReturn,
  Order as _Order,
} from './library.types';
import { parseAlbumHeaderReturn } from '../parsers/albums.types';
import { parseUploadedItemsReturn } from '../parsers/uploads';

export type Order = _Order;
export type uploadsOptions = {
  limit?: number | null;
  order?: Order;
};

export type getLibraryUploadSongsReturn = parseUploadedItemsReturn[];
export type getLibraryUploadAlbumsReturn = getLibraryAlbumsReturn;
export type getLibraryUploadArtistsReturn = getLibraryArtistsReturn;
export type getLibraryUploadArtistReturn = parseUploadedItemsReturn[];
export type getLibraryUploadAlbumReturn = parseAlbumHeaderReturn & {
  tracks: parseUploadedItemsReturn[];
};
