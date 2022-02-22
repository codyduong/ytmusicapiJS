import { FilterSingular } from '../types';

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
export type searchResultsNav = {
  musicShelfRenderer: {
    contents: searchContentsAndMusicShelfRenderer[];
  };
}[];

export type searchContentsAndMusicShelfRenderer = searchResult & {
  musicShelfRenderer: {
    title: {
      runs: { text: string }[];
    };
  };
};

//**parsers -- parseSearchResults*/
export type parseResults = parseResult[];
export type parseResult = searchResult;
export type searchResult = {
  musicResponsiveListItemRenderer: {
    navigationEndpoint: {
      watchEndpoint: { videoId: string; playlistId: string };
    };
  };
};
export type resultType = FilterSingular;
export type resultTypes = (
  | Extract<resultType, 'artist' | 'playlist' | 'song' | 'video'>
  | parseSearchResultsAdditionalResultTypes
)[];
//No idea where this comes from @codyduong
export type parseSearchResultsAdditionalResultTypes = 'station';

/**getArtist */
export type getArtistResponse = {
  contents: {
    singleColumnBrowseResultsRenderer: {
      tabs: Array<{
        tabRenderer: {
          content: {
            sectionListRenderer: {
              contents: Array<{
                musicShelfRenderer: {
                  title: {
                    runs: Array<{
                      navigationEndpoint: unknown;
                    }>;
                  };
                  contents: unknown;
                };
                musicCarouselShelfRenderer: {
                  contents: any;
                  header: {
                    musicCarouselShelfBasicHeaderRenderer: {
                      title: {
                        runs: Array<{ text: string }>;
                      };
                    };
                  };
                };
              }>;
            };
          };
        };
      }>;
    };
  };
  header: {
    musicImmersiveHeaderRenderer: {
      title: {
        runs: Array<{
          text: string;
        }>;
      };
      subscriptionButton: {
        subscribeButtonRenderer: {
          channelId: string;
          subscribed: boolean;
          subscriberCountText: {
            runs: Array<{ text: string }>;
          };
        };
      };
      playButton: {
        buttonRenderer: {
          navigationEndpoint: { watchPlaylistEndpoint: { playlistId: string } };
        };
      };
      startRadioButton: {
        buttonRenderer: {
          navigationEndpoint: { watchPlaylistEndpoint: { playlistId: string } };
        };
      };
    };
  };
};
export type getArtistResults =
  getArtistResponse['contents']['singleColumnBrowseResultsRenderer']['tabs'][number]['tabRenderer']['content']['sectionListRenderer']['contents'];
export type getArtistMusicShelf =
  getArtistResults[number]['musicShelfRenderer'];
export type getArtistRunTitle = getArtistMusicShelf['title']['runs'][number];
type getArtistHeader =
  getArtistResponse['header']['musicImmersiveHeaderRenderer'];
export type getArtistShuffleId =
  getArtistHeader['playButton']['buttonRenderer']['navigationEndpoint']['watchPlaylistEndpoint']['playlistId'];
export type getArtistRadioId =
  getArtistHeader['startRadioButton']['buttonRenderer']['navigationEndpoint']['watchPlaylistEndpoint']['playlistId'];
export type getArtistSubscribers =
  getArtistHeader['subscriptionButton']['subscribeButtonRenderer']['subscriberCountText']['runs'][0]['text'];

/**
 * search
 */
type thumbnail = {
  url: string;
  width: number;
  height: number;
};
export type thumbnails = thumbnail[];
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
type searchReturnHelper<T> = T & {
  //@ts-expect-error: yup.
  category: T['category'] | 'Top result';
  thumbnails: thumbnails;
};
type searchAllUnion =
  | searchReturnHelper<searchVideo>
  | searchReturnHelper<searchSong>
  | searchReturnHelper<searchAlbum>
  | searchReturnHelper<searchCommunityPlaylists>
  | searchReturnHelper<searchFeaturedPlaylists>;
type searchMappedHelper = {
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

/**
 * getArtist
 */
export type getArtistReturn = {
  description: string;
  views: string;
  name: string;
  channelId: string;
  shuffleId?: string;
  subscribers: string;
  subscribed: boolean;
  thumbnails: thumbnails;
  albums?: getUserReturnShared;
  singles?: getUserReturnShared;
  videos?: getUserReturnShared;
  playlists?: getUserReturnShared;
  related?: getUserReturnShared;
};

/**
 * getArtistAlbums
 */
export type getArtistAlbumsReturn = {
  browseId: string;
  title: string;
  type: string;
  thumbnails: thumbnails;
  year: string;
}[];

/**
 * getUser
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type getUserReturnCategories =
  | 'albums'
  | 'singles'
  | 'videos'
  | 'playlists'
  | 'related';
type getUserReturnShared = {
  browseId?: string;
  params?: string;
  results?: {
    title: string;
    videoId: string;
    artists: artists;
    playlistId: string;
    thumbnails: thumbnails;
    views: string;
  }[];
};
export type getUserReturn = {
  name: string;
  // albums?: getUserReturnCatergorized;
  // singles?: getUserReturnCatergorized;
  videos?: getUserReturnShared;
  playlists?: getUserReturnShared;
  // related?: getUserReturnCatergorized;
};

/**
 * getUserPlaylists
 */
export type getUserPlaylistsReturn = {
  playlistId: string;
  title: string;
  thumbnails: thumbnails;
  count?: number;
}[];

/**
 * getAlbumBrowseId
 */

/**
 * getAlbum
 */

/**
 * getSong
 */

/**
 * getLyrics
 */
export type getLyricsReturn = {
  lyrics: string | null;
  source: string | null;
};

/**
 * getBaseJSUrl
 */

/**
 * getSignatureTimestamp
 */
