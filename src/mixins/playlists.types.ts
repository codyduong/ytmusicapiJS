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
