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
export type Album = {
  title: string;
  year: string; //number?
  browseId: string; //number?
  thumbnails: string;
};
export type Single = {
  title: string;
  year: string; //number?
  browseId: string; //number?
  thumbnails: string;
};
export type Video = {
  title: string;
  videoId: string; //number?
  artists: string;
  playlistId: string; //number?
  thumbnails: string;
  views?: string; //number?
};
export type Playlist = {
  title: string;
  playlistId: string; //number?
  thumbnails: string;
  count?: string; //number?
};
export type RelatedArtist = {
  title: string;
  browseId: string; //number?
  subscribers: string; //number?
  thumbnails: string;
};
export type Artist = {
  description?: string | null;
  views?: string | null;
  name?: string;
  channelId?: string;
  shuffleId?: string;
  radioId?: string;
  subscribers?: string;
  subscribed?: boolean;
  thumbnails?: string;
  songs?: Record<string, any>;
  albums: {
    browseId: string;
    params: string;
  };
  related: {
    results: Array<any>;
  };
};
