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
