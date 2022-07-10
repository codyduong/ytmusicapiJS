import { Except } from 'type-fest';
import * as bT from '../mixins/browsing.types';
import {
  parseSongArtists,
  parseSongArtistsRuns,
  parseSongRuns,
  parseSongRunsReturn,
} from './songs';

export type parseAlbumReturn = {
  title: string;
  year: string;
  browseId: string;
  thumbnails: bT.thumbnails;
};

export type parseSingleReturn = {
  title: string;
  year: string;
  browseId: string;
  thumbnails: bT.thumbnails;
};

export type parseSongReturn = {
  title: string;
  videoId: string;
  playlistId: string;
  thumbnails: bT.thumbnails;
} & ReturnType<typeof parseSongRuns>;

export type parseSongFlatReturn = {
  title: string;
  videoId: string;
  thumbnails: bT.thumbnails;
  artists: ReturnType<typeof parseSongArtists>;
  isExplicit: boolean;
  album: {
    name: string;
    id: string;
  };
};

export type parseVideoReturn = {
  title: string;
  videoId: string;
  artists: ReturnType<typeof parseSongArtistsRuns>;
  playlistId: string;
  thumbnails: bT.thumbnails;
  views?: string;
};

export type parseArtistContentsReturn = {
  albums: {
    browseId: string | null;
    results: parseAlbumReturn[];
    params: string;
  };
  singles: {
    browseId: string | null;
    results: parseSingleReturn[];
    params: string;
  };
  videos: {
    browseId: string | null;
    results: parseVideoReturn[];
  };
  playlists: {
    browseId: string | null;
    results: parsePlaylistReturn[];
    params: string;
  };
  related: {
    browseId: string | null;
    results: parseRelatedArtistReturn[];
  };
};

export type parsePlaylistReturn = {
  title: string;
  playlistId: string;
  thumbnails: string;
  description?: string;
  author?: ReturnType<typeof parseSongArtistsRuns>;
  count?: string;
};

export type parseRelatedArtistReturn = {
  title: string;
  browseId: string;
  subscribers: string | null;
  thumbnails: bT.thumbnails;
};

export type parseHomeReturn = {
  title: string;
  contents: (
    | parseSongReturn
    | parseAlbumReturn
    | parseRelatedArtistReturn
    | parsePlaylistReturn
    | ({
        title: string;
        videoId: string;
        thumbnails: bT.thumbnails;
      } & Except<parseSongRunsReturn, 'album'> & {
          album?:
            | parseSongRunsReturn['album']
            | {
                title: string;
                browseId: string;
              };
        })
  )[];
}[];
