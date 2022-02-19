import * as utf8 from 'utf8';

import { YTM_DOMAIN } from '../constants';
import type { YTMusicBase } from './.mixin.helper';

import {
  DESCRIPTION,
  GRID_ITEMS,
  MUSIC_SHELF,
  NAVIGATION_BROWSE_ID,
  NAVIGATION_WATCH_PLAYLIST_ID,
  RUN_TEXT,
  SECTION_LIST,
  SECTION_LIST_ITEM,
  SINGLE_COLUMN_TAB,
  THUMBNAILS,
  TITLE,
  TITLE_TEXT,
} from '../parsers/index';
import * as helpers from '../helpers';
import { re } from '../pyLibraryMock';

import { parse_album_header } from '../parsers/albums';
import { parseContentList, parsePlaylist } from '../parsers/browsing';
import { parse_albums } from '../parsers/library';
import { parse_playlist_items } from '../parsers/playlists';
import { getSearchParams } from '../parsers/searchParams';
import { findObjectByKey, getContinuations, nav } from '../parsers/utils';

import type { Artist, Filter, FilterSingular, Scope } from '../types';
import * as bT from './browsing.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const BrowsingMixin = <TBase extends YTMusicBase>(Base: TBase) => {
  return class BrowsingMixin extends Base {
    /**
   * Search YouTube music        
   * Returns results within the provided category.
   * @param query {string} Query string, i.e. 'Oasis Wonderwall'
   * @param filter {string} Filter for item types. Allowed values: ``songs``, ``videos``, ``albums``, ``artists``, ``playlists``, ``community_playlists``, ``featured_playlists``, ``uploads``.
   *    @default: Default search, including all types of items.
   * @param scope {string} Search scope. Allowed values: ``library``, ``uploads``.
   *    @default: Search the public YouTube Music catalogue.
   * @param limit {number} Number of search results to return @default 20
   * @param ignore_spelling {boolean} Whether to ignore YTM spelling suggestions.
          If True, the exact search term will be searched for, and will not be corrected.
          This does not have any effect when the filter is set to ``uploads``.
          Default: False, will use YTM's default behavior of autocorrecting the search.
   * @return List of results depending on filter.
          resultType specifies the type of item (important for default search).
          albums, artists and playlists additionally contain a browseId, corresponding to
          albumId, channelId and playlistId (browseId=``VL``+playlistId)
          @example list for default search with one result per resultType for brevity. Normally
          there are 3 results per resultType and an additional ``thumbnails`` key::
            [
              {
                "category": "Top result",
                "resultType": "video",
                "videoId": "vU05Eksc_iM",
                "title": "Wonderwall",
                "artists": [
                  {
                    "name": "Oasis",
                    "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
                  }
                ],
                "views": "1.4M",
                "duration": "4:38",
                "duration_seconds": 278
              },
              {
                "category": "Songs",
                "resultType": "song",
                "videoId": "ZrOKjDZOtkA",
                "title": "Wonderwall",
                "artists": [
                  {
                    "name": "Oasis",
                    "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
                  }
                ],
                "album": {
                  "name": "(What's The Story) Morning Glory? (Remastered)",
                  "id": "MPREb_9nqEki4ZDpp"
                },
                "duration": "4:19",
                "duration_seconds": 259
                "isExplicit": false,
                "feedbackTokens": {
                  "add": null,
                  "remove": null
                }
              },
              {
                "category": "Albums",
                "resultType": "album",
                "browseId": "MPREb_9nqEki4ZDpp",
                "title": "(What's The Story) Morning Glory? (Remastered)",
                "type": "Album",
                "artist": "Oasis",
                "year": "1995",
                "isExplicit": false
              },
              {
                "category": "Community playlists",
                "resultType": "playlist",
                "browseId": "VLPLK1PkWQlWtnNfovRdGWpKffO1Wdi2kvDx",
                "title": "Wonderwall - Oasis",
                "author": "Tate Henderson",
                "itemCount": "174"
              },
              {
                "category": "Videos",
                "resultType": "video",
                "videoId": "bx1Bh8ZvH84",
                "title": "Wonderwall",
                "artists": [
                  {
                    "name": "Oasis",
                    "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
                  }
                ],
                "views": "386M",
                "duration": "4:38",
                "duration_seconds": 278
              },
              {
                "category": "Artists",
                "resultType": "artist",
                "browseId": "UCmMUZbaYdNH0bEd1PAlAqsA",
                "artist": "Oasis",
                "shuffleId": "RDAOkjHYJjL1a3xspEyVkhHAsg",
                "radioId": "RDEMkjHYJjL1a3xspEyVkhHAsg"
              }
            ]
   */
    async search(
      query: string,
      options?: {
        filter?: Filter;
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<Array<any>> {
      const _options = options ?? {};
      let { filter } = _options;
      const { scope, limit = 20, ignoreSpelling } = _options;
      const body: Record<string, any> = { query: query };
      const endpoint = 'search';
      let searchResults: Array<any> = [];
      const filters = [
        'albums',
        'artists',
        'playlists',
        'community_playlists',
        'featured_playlists',
        'songs',
        'videos',
      ];
      if (filter && !filters.includes(filter)) {
        throw new Error(
          `Invalid filter provided. Please use one of the following filters or leave out the parameter: ${filters.join(
            ', '
          )}`
        );
      }

      const scopes: Scope[] = ['library', 'uploads'];
      if (scope && !scopes.includes(scope)) {
        throw new Error(
          `Invalid scope provided. Please use one of the following scopes or leave out the parameter: ${scopes.join(
            ', '
          )}`
        );
      }
      const params = getSearchParams(filter, scope, ignoreSpelling);
      if (params) {
        body['params'] = params;
      }

      const response = await this._sendRequest<bT.searchResponse>(
        endpoint,
        body
      );

      // no results
      if (!response['contents']) {
        return searchResults;
      }

      let results: bT.searchResults;
      if ('tabbedSearchResultsRenderer' in response.contents) {
        //0 if not scope or filter else scopes.index(scope) + 1
        const tab_index = !scope || filter ? 0 : scopes.indexOf(scope) + 1;
        results =
          response['contents']['tabbedSearchResultsRenderer']['tabs'][
            tab_index
          ]['tabRenderer']['content'];
      } else {
        results = response['contents'];
      }

      const resultsNav = nav<typeof results, bT.searchResultsNav>(
        results,
        SECTION_LIST
      );

      // no results
      if (
        Object.keys(resultsNav).length == 1 &&
        'itemSectionRenderer' in results
      ) {
        return searchResults;
      }

      //set filter for parser
      if (filter && 'playlists' in filter.split('_')) {
        filter = 'playlists';
      } else if (scope == 'uploads') {
        filter = 'uploads';
      }

      for (const res of resultsNav) {
        if ('musicShelfRenderer' in res) {
          const resultsMusicShelfContents =
            res['musicShelfRenderer']['contents'];
          const original_filter = filter;
          const category = nav(res, [...MUSIC_SHELF, ...TITLE_TEXT], true);
          if (!filter && scope == scopes[0]) {
            filter = category;
          }

          const type: FilterSingular | null = filter
            ? (filter.slice(undefined, -1).toLowerCase() as FilterSingular)
            : null;
          searchResults = [
            ...searchResults,
            ...this.parser.parseSearchResults(
              resultsMusicShelfContents,
              type,
              category
            ),
          ];
          filter = original_filter;

          if ('continuations' in res['musicShelfRenderer']) {
            const request_func = async (
              additionalParams: string
            ): Promise<Record<string, any>> =>
              await this._sendRequest(endpoint, body, additionalParams);

            const parse_func = (contents: any): Record<string, any> =>
              this.parser.parseSearchResults(contents, type, category);

            searchResults = [
              ...searchResults,
              ...(await getContinuations(
                res['musicShelfRenderer'],
                'musicShelfContinuation',
                limit - searchResults.length,
                request_func,
                parse_func
              )),
            ];
          }
        }
      }

      return searchResults;
    }

    /**
    Get information about an artist and their top releases (songs,
    albums, singles, videos, and related artists). The top lists
    contain pointers for getting the full list of releases. For
    songs/videos, pass the browseId to :py:func:`get_playlist`.
    For albums/singles, pass browseId and params to :py:func:
    `get_artist_albums`.
    @param channelId {string}: channel id of the artist
    @return Object with requested information.
    @example
        {
            "description": "Oasis were ...",
            "views": "1838795605",
            "name": "Oasis",
            "channelId": "UCUDVBtnOQi4c7E8jebpjc9Q",
            "subscribers": "2.3M",
            "subscribed": false,
            "thumbnails": [...],
            "songs": {
                "browseId": "VLPLMpM3Z0118S42R1npOhcjoakLIv1aqnS1",
                "results": [
                    {
                        "videoId": "ZrOKjDZOtkA",
                        "title": "Wonderwall (Remastered)",
                        "thumbnails": [...],
                        "artist": "Oasis",
                        "album": "(What's The Story) Morning Glory? (Remastered)"
                    }
                ]
            },
            "albums": {
                "results": [
                    {
                        "title": "Familiar To Millions",
                        "thumbnails": [...],
                        "year": "2018",
                        "browseId": "MPREb_AYetWMZunqA"
                    }
                ],
                "browseId": "UCmMUZbaYdNH0bEd1PAlAqsA",
                "params": "6gPTAUNwc0JDbndLYlFBQV..."
            },
            "singles": {
                "results": [
                    {
                        "title": "Stand By Me (Mustique Demo)",
                        "thumbnails": [...],
                        "year": "2016",
                        "browseId": "MPREb_7MPKLhibN5G"
                    }
                ],
                "browseId": "UCmMUZbaYdNH0bEd1PAlAqsA",
                "params": "6gPTAUNwc0JDbndLYlFBQV..."
            },
            "videos": {
                "results": [
                    {
                        "title": "Wonderwall",
                        "thumbnails": [...],
                        "views": "358M",
                        "videoId": "bx1Bh8ZvH84",
                        "playlistId": "PLMpM3Z0118S5xuNckw1HUcj1D021AnMEB"
                    }
                ],
                "browseId": "VLPLMpM3Z0118S5xuNckw1HUcj1D021AnMEB"
            },
            "related": {
                "results": [
                    {
                        "browseId": "UCt2KxZpY5D__kapeQ8cauQw",
                        "subscribers": "450K",
                        "title": "The Verve"
                    },
                    {
                        "browseId": "UCwK2Grm574W1u-sBzLikldQ",
                        "subscribers": "341K",
                        "title": "Liam Gallagher"
                    },
                    ...
                ]
            }
        }
    */
    async getArtist(channelId: string): Promise<Artist> {
      if (channelId.startsWith('MPLA')) {
        channelId = channelId.slice(4);
      }
      const body = { browseId: channelId };
      const endpoint = 'browse';
      const response = await this._sendRequest<bT.getArtistResponse>(
        endpoint,
        body
      );
      const results = nav<typeof response, bT.getArtistResults>(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST,
      ]);
      if (results.length == 1) {
        // not a YouTube Music Channel, a standard YouTube Channel ID with no music content was given
        throw new ReferenceError(
          'The YouTube Channel {channelId} has no music content.'
        );
      }

      let artist: Artist = {
        description: null,
        views: null,
      };
      const header = response['header']['musicImmersiveHeaderRenderer'];
      artist['name'] = nav(header, TITLE_TEXT);
      const descriptionShelf = findObjectByKey(
        results,
        'musicDescriptionShelfRenderer',
        undefined,
        true
      );
      if (descriptionShelf) {
        artist['description'] = nav(descriptionShelf, DESCRIPTION);
        artist['views'] = !('subheader' in descriptionShelf)
          ? null
          : descriptionShelf['subheader']['runs'][0]['text'];
      }
      const subscriptionButton =
        header['subscriptionButton']['subscribeButtonRenderer'];
      artist['channelId'] = subscriptionButton['channelId'];
      artist['shuffleId'] = nav<typeof header, bT.getArtistShuffleId>(
        header,
        ['playButton', 'buttonRenderer', ...NAVIGATION_WATCH_PLAYLIST_ID],
        true
      );
      artist['radioId'] = nav<typeof header, bT.getArtistRadioId>(
        header,
        ['startRadioButton', 'buttonRenderer', ...NAVIGATION_WATCH_PLAYLIST_ID],
        true
      );
      artist['subscribers'] = nav<
        typeof subscriptionButton,
        bT.getArtistSubscribers
      >(subscriptionButton, ['subscriberCountText', 'runs', 0, 'text'], true);
      artist['subscribed'] = subscriptionButton['subscribed'];
      artist['thumbnails'] = nav(header, THUMBNAILS, true);
      artist['songs'] = { browseId: null };
      if ('musicShelfRenderer' in results[0]) {
        // API sometimes does not return songs
        const musicShelf = nav<typeof results[0], bT.getArtistMusicShelf>(
          results[0],
          MUSIC_SHELF
        );
        if (
          'navigationEndpoint' in
          nav<typeof musicShelf, bT.getArtistRunTitle>(musicShelf, TITLE)
        ) {
          artist['songs']['browseId'] = nav(musicShelf, [
            ...TITLE,
            ...NAVIGATION_BROWSE_ID,
          ]);
        }
        artist['songs']['results'] = parse_playlist_items(
          musicShelf['contents']
        );
      }
      artist = { ...artist, ...this.parser.parseArtistContents(results) };
      return artist;
    }

    /**
     * Get the full list of an artist's albums or singles
     * @param channelId {string} channel Id of the artist
     * @param params {string} params obtained by :py:func:`get_artist` <-- TODO @codyduong
     * @returns List of albums in the format of :py:func:`get_library_albums`, except artists key is missing.
     */
    getArtistAlbums(
      channelId: string,
      params: string
    ): Array<Record<string, any>> {
      const body = { browseId: channelId, params: params };
      const endpoint = 'browse';
      const response = this._sendRequest(endpoint, body);
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        ...GRID_ITEMS,
      ]);
      const albums = parse_albums(results);

      return albums;
    }

    /**
     *  Retrieve a user's page. A user may own videos or playlists.
     * @param channelId {string} channelId of the user
     * @returns Object with information about a user.
     * @example
     * {
              "name": "4Tune – No Copyright Music",
              "videos": {
                "browseId": "UC44hbeRoCZVVMVg5z0FfIww",
                "results": [
                  {
                    "title": "Epic Music Soundtracks 2019",
                    "videoId": "bJonJjgS2mM",
                    "playlistId": "RDAMVMbJonJjgS2mM",
                    "thumbnails": [
                      {
                        "url": "https://i.ytimg.com/vi/bJon...",
                        "width": 800,
                        "height": 450
                      }
                    ],
                    "views": "19K"
                  }
                ]
              },
              "playlists": {
                "browseId": "UC44hbeRoCZVVMVg5z0FfIww",
                "results": [
                  {
                    "title": "♚ Machinimasound | Playlist",
                    "playlistId": "PLRm766YvPiO9ZqkBuEzSTt6Bk4eWIr3gB",
                    "thumbnails": [
                      {
                        "url": "https://i.ytimg.com/vi/...",
                        "width": 400,
                        "height": 225
                      }
                    ]
                  }
                ],
                "params": "6gO3AUNvWU..."
              }
            }
     */
    getUser(channelId: string): Record<string, any> {
      const endpoint = 'browse';
      const body = { browseId: channelId };
      const response = this._sendRequest(endpoint, body);
      let user = {
        name: nav(response, [
          'header',
          'musicVisualHeaderRenderer',
          ...TITLE_TEXT,
        ]),
      };
      const results = nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]);
      user = { ...user, ...this.parser.parseArtistContents(results) };
      return user;
    }

    /**
     * Retrieve a list of playlists for a given user.
     * Call this function again with the returned ``params`` to get the full list.
     * @param channelId {string} channelId of the user.
     * @param params {string} params obtained by :py:func:`get_artist` <-- TODO @codyduong
     * @returns List of user playlists in the format of :py:func:`get_library_playlists`
     */
    getUserPlaylists(
      channelId: string,
      params: string
    ): Array<Record<string, any>> {
      const endpoint = 'browse';
      const body = { browseId: channelId, params: params };
      const response = this._sendRequest(endpoint, body);
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        ...GRID_ITEMS,
      ]);
      const user_playlists = parseContentList(results, parsePlaylist);

      return user_playlists;
    }

    /**
     * Get an album's browseId based on its audioPlaylistId
     * @param audioPlaylistId audioPlaylistId: id of the audio playlist (starting with `OLAK5uy_`)
     * @returns browseId (starting with `MPREb_`)
     */
    async getAlbumBrowseId(audioPlaylistId: string): Promise<any> {
      const params = { list: audioPlaylistId };
      const response = await this._sendGetRequest(
        YTM_DOMAIN + '/playlist',
        params
      );
      const matches = re.findall(/"MPRE.+?"/, response);
      let browse_id = null;
      if (matches.length > 0) {
        browse_id = utf8
          .decode(utf8.encode(matches[0]))
          .replace(/^"+|"+$/g, '');
      }
      return browse_id;
    }

    /**
     * Get information and tracks of an album
     * @param browseId browseId of the album, for example returned by {class}.search <-- TODO @codyduong
     * @returns Object with album and track metadata.
     * @example
     * {
                "title": "Revival",
                "type": "Album",
                "thumbnails": [],
                "description": "Revival is the ninth studio album by American rapper Eminem. ...",
                "artists": [{
                        "name": "Eminem",
                        "id": "UCedvOgsKFzcK3hA5taf3KoQ"
                }],
                "year": "2017",
                "trackCount": 19,
                "duration": "1 hour, 17 minutes",
                "duration_seconds": 4657,
                "audioPlaylistId": "OLAK5uy_nMr9h2VlS-2PULNz3M3XVXQj_P3C2bqaY",
                "tracks": [
                    {
                        "videoId": "iKLU7z_xdYQ",
                        "title": "Walk On Water (feat. Beyoncé)",
                        "artists": None,
                        "album": None,
                        "likeStatus": "INDIFFERENT",
                        "thumbnails": None,
                        "isAvailable": True,
                        "isExplicit": True,
                        "duration": "5:03",
                        "feedbackTokens":
                        {
                            "add": "AB9zfpJww...",
                            "remove": "AB9zfpI807..."
                        }
                    }
                ]
            }
     */
    getAlbum(browseId: string): Record<string, any> {
      const body = { browseId: browseId };
      const endpoint = 'browse';
      const response = this._sendRequest(endpoint, body);
      const album = parse_album_header(response);
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        ...MUSIC_SHELF,
      ]);
      album['tracks'] = parse_playlist_items(results['contents']);
      album['duration_seconds'] = helpers.sumTotalDuration(album);

      return album;
    }

    /**
     * Returns metadata and streaming information about a song or video.
     * @param videoId {string} Video id
     * @param signatureTimestamp {number} Provide the current YouTube signatureTimestamp.
          If not provided a default value will be used, which might result in invalid streaming URLs
     * @return Object with song metadata
     * @example
     * {
          "playabilityStatus": {
              "status": "OK",
              "playableInEmbed": true,
              "audioOnlyPlayability": {
                  "audioOnlyPlayabilityRenderer": {
                      "trackingParams": "CAEQx2kiEwiuv9X5i5H1AhWBvlUKHRoZAHk=",
                      "audioOnlyAvailability": "FEATURE_AVAILABILITY_ALLOWED"
                  }
              },
              "miniplayer": {
                  "miniplayerRenderer": {
                      "playbackMode": "PLAYBACK_MODE_ALLOW"
                  }
              },
              "contextParams": "Q0FBU0FnZ0M="
          },
          "streamingData": {
              "expiresInSeconds": "21540",
              "adaptiveFormats": [
                  {
                      "itag": 140,
                      "url": "https://rr1---sn-h0jelnez.c.youtube.com/videoplayback?expire=1641080272...",
                      "mimeType": "audio/mp4; codecs=\"mp4a.40.2\"",
                      "bitrate": 131007,
                      "initRange": {
                          "start": "0",
                          "end": "667"
                      },
                      "indexRange": {
                          "start": "668",
                          "end": "999"
                      },
                      "lastModified": "1620321966927796",
                      "contentLength": "3967382",
                      "quality": "tiny",
                      "projectionType": "RECTANGULAR",
                      "averageBitrate": 129547,
                      "highReplication": true,
                      "audioQuality": "AUDIO_QUALITY_MEDIUM",
                      "approxDurationMs": "245000",
                      "audioSampleRate": "44100",
                      "audioChannels": 2,
                      "loudnessDb": -1.3000002
                  }
              ]
          },
          "videoDetails": {
              "videoId": "AjXQiKP5kMs",
              "title": "Sparks",
              "lengthSeconds": "245",
              "channelId": "UCvCk2zFqkCYzpnSgWfx0qOg",
              "isOwnerViewing": false,
              "isCrawlable": false,
              "thumbnail": {
                  "thumbnails": []
              },
              "allowRatings": true,
              "viewCount": "12",
              "author": "Thomas Bergersen",
              "isPrivate": true,
              "isUnpluggedCorpus": false,
              "musicVideoType": "MUSIC_VIDEO_TYPE_PRIVATELY_OWNED_TRACK",
              "isLiveContent": false
          },
          "microformat": {
              "microformatDataRenderer": {
                  "urlCanonical": "https://music.youtube.com/watch?v=AjXQiKP5kMs",
                  "title": "Sparks - YouTube Music",
                  "description": "Uploaded to YouTube via YouTube Music Sparks",
                  "thumbnail": {
                      "thumbnails": [
                          {
                              "url": "https://i.ytimg.com/vi/AjXQiKP5kMs/hqdefault.jpg",
                              "width": 480,
                              "height": 360
                          }
                      ]
                  },
                  "siteName": "YouTube Music",
                  "appName": "YouTube Music",
                  "androidPackage": "com.google.android.apps.youtube.music",
                  "iosAppStoreId": "1017492454",
                  "iosAppArguments": "https://music.youtube.com/watch?v=AjXQiKP5kMs",
                  "ogType": "video.other",
                  "urlApplinksIos": "vnd.youtube.music://music.youtube.com/watch?v=AjXQiKP5kMs&feature=applinks",
                  "urlApplinksAndroid": "vnd.youtube.music://music.youtube.com/watch?v=AjXQiKP5kMs&feature=applinks",
                  "urlTwitterIos": "vnd.youtube.music://music.youtube.com/watch?v=AjXQiKP5kMs&feature=twitter-deep-link",
                  "urlTwitterAndroid": "vnd.youtube.music://music.youtube.com/watch?v=AjXQiKP5kMs&feature=twitter-deep-link",
                  "twitterCardType": "player",
                  "twitterSiteHandle": "@YouTubeMusic",
                  "schemaDotOrgType": "http://schema.org/VideoObject",
                  "noindex": true,
                  "unlisted": true,
                  "paid": false,
                  "familySafe": true,
                  "pageOwnerDetails": {
                      "name": "Music Library Uploads",
                      "externalChannelId": "UCvCk2zFqkCYzpnSgWfx0qOg",
                      "youtubeProfileUrl": "http://www.youtube.com/channel/UCvCk2zFqkCYzpnSgWfx0qOg"
                  },
                  "videoDetails": {
                      "externalVideoId": "AjXQiKP5kMs",
                      "durationSeconds": "246",
                      "durationIso8601": "PT4M6S"
                  },
                  "linkAlternates": [
                      {
                          "hrefUrl": "android-app://com.google.android.youtube/http/youtube.com/watch?v=AjXQiKP5kMs"
                      },
                      {
                          "hrefUrl": "ios-app://544007664/http/youtube.com/watch?v=AjXQiKP5kMs"
                      },
                      {
                          "hrefUrl": "https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fmusic.youtube.com%2Fwatch%3Fv%3DAjXQiKP5kMs",
                          "title": "Sparks",
                          "alternateType": "application/json+oembed"
                      },
                      {
                          "hrefUrl": "https://www.youtube.com/oembed?format=xml&url=https%3A%2F%2Fmusic.youtube.com%2Fwatch%3Fv%3DAjXQiKP5kMs",
                          "title": "Sparks",
                          "alternateType": "text/xml+oembed"
                      }
                  ],
                  "viewCount": "12",
                  "publishDate": "1969-12-31",
                  "category": "Music",
                  "uploadDate": "1969-12-31"
              }
          }
      }
     */
    async getSong(
      videoId: string,
      signatureTimestamp: number
    ): Promise<Record<string, any>> {
      const endpoint = 'player';
      if (!signatureTimestamp) {
        signatureTimestamp = helpers.getDatestamp() - 1;
      }

      const params = {
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: signatureTimestamp,
          },
        },
        video_id: videoId,
      };
      const response = await this._sendRequest(endpoint, params);
      const keys = [
        'videoDetails',
        'playabilityStatus',
        'streamingData',
        'microformat',
      ];
      for (const k in response.keys()) {
        if (!(k in keys)) {
          delete response[k];
        }
      }
      return response;
    }

    /**
     * Returns lyrics of a song or video.
     * @param browseId 
     * @return Object with song lyrics
     * @example
     * {
            "lyrics": "Today is gonna be the day\\nThat they're gonna throw it back to you\\n",
            "source": "Source: LyricFind"
        }
     */
    getLyrics(browseId: string): Record<string, any> {
      const lyrics: Record<string, any> = {};
      if (!browseId) {
        throw new Error(
          'Invalid browseId provided. This song might not have lyrics.'
        );
      }

      const response = this._sendRequest('browse', { browseId: browseId });
      lyrics['lyrics'] = nav(
        response,
        [
          'contents',
          ...SECTION_LIST_ITEM,
          'musicDescriptionShelfRenderer',
          ...DESCRIPTION,
        ],
        true
      );
      lyrics['source'] = nav(
        response,
        [
          'contents',
          ...SECTION_LIST_ITEM,
          'musicDescriptionShelfRenderer',
          'footer',
          ...RUN_TEXT,
        ],
        true
      );

      return lyrics;
    }

    /**
     * Extract the URL for the `base.js` script from YouTube Music.
     * @return {string} URL to `base.js`
     */
    async getBaseJSUrl(): Promise<string> {
      const response = await this._sendGetRequest(YTM_DOMAIN);
      const match = re.search(/jsUrl"\s*:\s*"([^"]+)"/, response);
      if (!match) {
        throw new Error('Could not identify the URL for base.js player.');
      }

      //@codyduong verify this is the same...
      return YTM_DOMAIN + match?.groups?.[0];
    }

    /**
     * Fetch the `base.js` script from YouTube Music and parse out the
        `signatureTimestamp` for use with :py:func:`get_song`. <-- @codyduong todo
     * @param url Optional. Provide the URL of the `base.js` script. If this
            isn't specified a call will be made to :py:func:`get_basejs_url`.
     * @returns `signatureTimestamp` string <-- @codyduong this contradicts the actual code? idk
     */
    async getSignatureTimestamp(url: string): Promise<number | null> {
      if (!url) {
        url = await this.getBaseJSUrl();
      }
      const response = await this._sendGetRequest(url);
      const match = re.search(/signatureTimestamp[:=](\d+)/, response);
      if (!match) {
        throw new Error('Unable to identify the signatureTimestamp.');
      }

      if (match && match.groups) {
        return Math.round(Number(match.groups[0]));
      }
      return null;
    }
  };
};
