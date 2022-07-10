import { Filter } from '../types';
import { searchContentsAndMusicShelfRenderer } from './browsing.types';
import { thumbnails } from '../types';

/**search */
export type searchResponse = {
  contents: tabbedSerachResultsRenderer | searchResults;
};
type tabbedSerachResultsRenderer = {
  tabbedSearchResultsRenderer: {
    tabs: {
      tabRenderer: {
        content: searchResults;
      };
    }[];
  };
};
export type searchResults = {
  sectionListRenderer: {
    contents: searchResultsNav;
  };
};
type searchResultsNav = {
  musicShelfRenderer: {
    contents: searchContentsAndMusicShelfRenderer[];
    title: {
      runs: {
        text: Filter;
      }[];
    };
  };
}[];
/**
 * search
 */
type duration = string | null;
type artist = {
  name: string;
  id: string;
};
type artists = artist[];
type searchVideo = {
  category: 'Videos';
  resultType: 'video';
  videoId: string;
  title: string;
  artists: artists;
  views?: string;
  duration: duration;
  duration_seconds: number;
};
type searchSong = {
  category: 'Songs';
  resultType: 'song';
  videoId: string;
  title: string;
  artists: artists;
  album: {
    name: string;
    id: string;
  } | null;
  duration: duration;
  duration_seconds: number;
  isExplicit: boolean;
  feedbackTokens: {
    add: any | null;
    remove: any | null;
  };
};
type searchAlbum = {
  category: 'Albums';
  resultType: 'album';
  browseId: string;
  title: string;
  type: 'Album';
  artist: string;
  year: string | null;
  isExplicit: boolean;
};
type searchCommunityPlaylists = {
  category: 'Community playlists';
  resultType: 'playlist';
  browseId: string;
  title: string;
  author: string;
  itemCount: string;
};
type searchFeaturedPlaylists = {
  category: 'Featured playlists';
  resultType: 'playlist';
  browseId: string;
  title: string;
  author: string;
  itemCount: string;
};
type searchArtist = {
  category: 'Artists';
  resultType: 'artist';
  browseId: string;
  artist: string;
  shuffleId: string;
  radioId: string;
};
type searchReturnHelper<T extends { category: string }> = Omit<
  T,
  'category'
> & {
  category: T['category'] | 'Top result';
  thumbnails: thumbnails;
};
type searchAllUnion =
  | searchReturnHelper<searchVideo>
  | searchReturnHelper<searchSong>
  | searchReturnHelper<searchAlbum>
  | searchReturnHelper<searchCommunityPlaylists>
  | searchReturnHelper<searchFeaturedPlaylists>;
export type searchMappedHelper = {
  songs: searchReturnHelper<searchSong>[];
  videos: searchReturnHelper<searchVideo>[];
  albums: searchReturnHelper<searchAlbum>[];
  artists: searchReturnHelper<searchArtist>[];
  playlists: (
    | searchReturnHelper<searchCommunityPlaylists>
    | searchReturnHelper<searchFeaturedPlaylists>
  )[];
  community_playlists: searchReturnHelper<searchCommunityPlaylists>[];
  featured_playlists: searchReturnHelper<searchFeaturedPlaylists>[];
  uploads: any[];
  null: searchAllUnion[];
};
export type searchReturn<T extends keyof searchMappedHelper = 'null'> =
  searchMappedHelper[T];
