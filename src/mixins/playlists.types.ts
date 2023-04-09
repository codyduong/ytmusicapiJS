import { parsePlaylistItemsReturn } from '../parsers/playlists.types';
import { thumbnails } from '../types';

export type PrivacyStatus = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export type AddPlaylistItemsOptions =
  | {
      videoIds: string[];
      sourcePlaylist?: string;
      duplicates?: boolean;
    }
  | {
      videoIds?: string[];
      sourcePlaylist: string;
      duplicates?: boolean;
    };

export type getPlaylistOptions = {
  playlistId: string;
  limit?: number | null;
  related?: boolean;
  suggestionsLimit?: number;
};

export type getPlaylistReturn = {
  id: string;
  privacy: PrivacyStatus;
  title: string;
  thumbnails: thumbnails;
  description?: string | null;
  author?: { name: string; id: string | null };
  year?: string;
  duration?: string;
  trackCount: number;
  suggestions_token: any | null;
  tracks: parsePlaylistItemsReturn;
  duration_seconds: number;
  suggestions?: parsePlaylistItemsReturn;
  related?: any;
};
export type addPlaylistItemsReturn =
  | {
      status: string;
      playlistEditResults: any[];
    }
  | Record<string, any>;
