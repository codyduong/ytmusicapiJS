import {
  parsePlaylistReturn,
  parseVideoReturn,
} from '../parsers/browsing.types';
import {
  parseChartArtistReturn,
  parseChartSongReturn,
  parseChartTrendingReturn,
} from '../parsers/explore';

export type getMoodCategoriesResponse = {
  contents: {
    singleColumnBrowseResultsRenderer: {
      tabs: Array<{
        tabRenderer: {
          content: {
            sectionListRenderer: {
              contents: Array<{
                gridRenderer: {
                  items: Array<any>;
                  header: {
                    gridHeaderRenderer: {
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
};
export type getMoodPlaylists = getMoodCategoriesResponse;

export type getMoodCategoriesReturn = {
  [index: string]: [{ params: string; title: string }];
};

export type getChartsReturn<T extends string = 'ZZ'> = {
  countries: {
    selected: {
      text: string;
    };
    options: string[];
  };
  videos: {
    playlist?: null | string;
    items: parseVideoReturn[];
  };
  artists: {
    playlist?: null | string;
    items: parseChartArtistReturn[];
  };
  songs?: {
    playlist?: null | string;
    items: parseChartSongReturn[];
  };
  trending: T extends 'ZZ'
    ? undefined
    : {
        playlist?: null | string;
        items: parseChartTrendingReturn[];
      };
  genres: T extends 'US' ? parsePlaylistReturn[] : undefined;
};
// & T extends 'US'
//   ? {
//       genres: {
//         playlist: null | string;
//         items: parsePlaylistReturn;
//       };
//     }
//   : never;
