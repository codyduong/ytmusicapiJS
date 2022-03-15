export type thumbnail = {
  url: string;
  width: number;
  height: number;
};
export type thumbnails = thumbnail[];
export type Headers = {
  'user-agent': string;
  accept: string;
  'accept-encoding': string;
  'content-type': string;
  'content-encoding': string;
  origin: string;
  'x-origin'?: string;
  'x-goog-visitor-id'?: string;
  authorization?: string;
  cookie?: string;
};
export type Filter =
  | 'songs'
  | 'videos'
  | 'albums'
  | 'artists'
  | 'playlists'
  | 'community_playlists'
  | 'featured_playlists'
  | 'uploads';
export type FilterSingular =
  | 'song'
  | 'video'
  | 'album'
  | 'artist'
  | 'playlist'
  | 'community_playlist'
  | 'featured_playlist'
  | 'upload';
export type Scope = 'library' | 'uploads';
