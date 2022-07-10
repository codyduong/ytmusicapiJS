import { Except } from 'type-fest';
import { FilterSingular, thumbnail, thumbnails as tb } from '../types';
import * as parser_bT from '../parsers/browsing.types';
import { parsePlaylistItemsReturn } from '../parsers/playlists.types';
import { parseAlbumHeaderReturn } from '../parsers/albums.types';

export type thumbnails = tb;

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
      browseEndpoint: {
        browseId: any;
      };
    };
    overlay: {
      musicItemThumbnailOverlayRenderer: {
        content: {
          musicPlayButtonRenderer: {
            playNavigationEndpoint: {
              watchEndpoint: {
                videoId: string;
                watchEndpointMusicSupportedConfigs: {
                  watchEndpointMusicConfig: {
                    musicVideoType: string;
                  };
                };
              };
            };
          };
        };
      };
    };
    badges: {
      musicInlineBadgeRenderer: {
        accessibilityData: {
          accessibilityData: {
            label: string;
          };
        };
      };
    }[];
    thumbnail: {
      musicThumbnailRenderer: {
        thumbnail: {
          thumbnails: thumbnails;
        };
      };
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
                      navigationEndpoint: any;
                    }>;
                  };
                  contents: any;
                };
                musicCarouselShelfRenderer: {
                  contents: any;
                  header: {
                    musicCarouselShelfBasicHeaderRenderer: {
                      title: {
                        runs: Array<{
                          text: string;
                          navigationEndpoint: {
                            browseEndpoint: {
                              browseId: string;
                            };
                          };
                        }>;
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
      thumbnail: {
        musicThumbnailRenderer: {
          thumbnail: {
            thumbnails: thumbnails;
          };
        };
      };
    };
  };
};
export type getArtistResults =
  getArtistResponse['contents']['singleColumnBrowseResultsRenderer']['tabs'][number]['tabRenderer']['content']['sectionListRenderer']['contents'];

/**
 * getArtist
 */
export type getArtistReturn = {
  name: string;
  description: string | null;
  views: string | null;
  channelId: string | null;
  shuffleId: string | null;
  radioId: string | null;
  subscribers: string;
  subscribed: boolean;
  thumbnails: thumbnails | null;
  songs:
    | {
        browseId: string;
        results: parsePlaylistItemsReturn;
      }
    | {
        browseId: null;
      };
} & parser_bT.parseArtistContentsReturn;

export type getUserReturn = {
  name: string;
} & parser_bT.parseArtistContentsReturn;

/**
 * getAlbum
 */
export type getAlbumReturn = parseAlbumHeaderReturn & {
  tracks: (Except<parsePlaylistItemsReturn[number], 'album'> & {
    album: string;
    artists: parseAlbumHeaderReturn['artists'];
  })[];
};

/**
 * getSong
 */
type getSongFormats = Partial<{
  width: number;
  hiehgt: number;
  fps: number;
  qualityLabel: string;
  signatureCipher: string;

  //adaptive
  itag: number;
  url: string;
  mimeType: string;
  bitrate: number;
  initRange: {
    start: string;
    end: string;
  };
  indexRange: {
    start: string;
    end: string;
  };
  lastModified: string;
  contentLength: string;
  quality: string;
  projectionType: string;
  averageBitrate: number;
  highReplication: boolean;
  audioQuality: string;
  approxDurationMs: string;
  audioSampleRate: string;
  audioChannels: number;
  loudnessDb: number;
}>[];

export type getSongRequest<T extends string, U extends string = string> = {
  playabilityStatus: {
    status: string;
    playableInEmbed: boolean;
    audioOnlyPlayability: {
      audioOnlyPlayabilityRenderer: {
        trackingParams: string;
        audioOnlyAvailability: string;
      };
    };
    miniplayer: {
      miniplayerRenderer: {
        playbackMode: string;
      };
    };
    contextParams: string;
  };
  streamingData: {
    expiresIn: string;
    formats: getSongFormats[];
    adaptiveFormats: getSongFormats;
  };
  videoDetails: {
    videoId: string;
    title: string;
    lengthSeconds: string;
    channelId: string;
    isOwnerViewing: boolean;
    isCrawlable: boolean;
    thumbnail: { thumbnails: thumbnails };
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    musicVideoType: string;
    isLiveContent: boolean;
  };
  microformat: {
    microformatDataRenderer: {
      urlCanonical: `https://music.youtube.com/watch?v=${T}`;
      title: string;
      description: string;
      thumbnail: thumbnail;
      siteName: 'YouTube Music';
      appName: 'YouTube Music';
      androidPackage: 'com.google.android.apps.youtube.music';
      iosAppStoreId: '1017492454';
      iosAppArguments: `https://music.youtube.com/watch?v=${T}`;
      ogType: 'video.other';
      urlApplinksIos: `vnd.youtube.music://music.youtube.com/watch?v=${T}&feature=applinks`;
      urlApplinksAndroid: `vnd.youtube.music://music.youtube.com/watch?v=${T}&feature=applinks`;
      urlTwitterIos: `vnd.youtube.music://music.youtube.com/watch?v=${T}&feature=twitter-deep-link`;
      urlTwitterAndroid: `vnd.youtube.music://music.youtube.com/watch?v=${T}&feature=twitter-deep-link`;
      twitterCardType: 'player';
      twitterSiteHandle: '@YouTubeMusic';
      schemaDotOrgType: 'http://schema.org/VideoObject';
      noindex: boolean;
      unlisted: boolean;
      paid: boolean;
      familySafe: boolean;
      tags: string[];
      availableCountries?: any;
      pageOwnerDetails: {
        name: string;
        externalChannelId: `${U}`;
        youtubeProfileUrl: `http://www.youtube.com/channel/${U}`;
      };
      videoDetails: {
        externalVideoId: string;
        durationSeconds: string;
        durationIso8601: string;
      };
      linkAlternates: {
        hrefUrl: string;
        title?: string;
        alternateType: string;
      };
      viewCount: string;
      publishDate: `${string}-${string}-${string}`;
      category: string;
      uploadDate: `${string}-${string}-${string}`;
    };
  };
  //There are more keys but they are all removed...
};

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
