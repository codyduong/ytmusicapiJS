/**
 * @module Watch
 */

import { GConstructor, Mixin } from './.mixin.helper';

import { nav, NAVIGATION_PLAYLIST_ID, TAB_CONTENT } from '../parsers';
import { validatePlaylistId } from '../parsers/utils';
import { getTabBrowseId, parseWatchPlaylist } from '../parsers/watch';

import * as wt from './watch.types';
import { BrowsingMixin } from './browsing';
import { getContinuations } from '../continuations';

export type WatchMixin = Mixin<typeof WatchMixin>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const WatchMixin = <TBase extends GConstructor<BrowsingMixin>>(
  Base: TBase
) => {
  return class WatchMixin extends Base {
    /**
     * Get a watch list of tracks. This watch playlist appears when you press
     * play on a track in YouTube Music.
     * Please note that the `INDIFFERENT` likeStatus of tracks returned by this
     * endpoint may be either `INDIFFERENT` or `DISLIKE`, due to ambiguous data
     * returned by YouTube Music.
     *
     * @param {string} videoId videoId of the played video
     * @param {string} playlistId playlistId of the played playlist or album
     * @param {number} [limit=25] minimum number of watch playlist items to return
     * @param {boolean} [radio=false] get a radio playlist (changes each time)
     * @param {boolean} [shuffle=false] shuffle the input playlist. only works when the playlistId parameter.
     *   is set at the same time. does not work if radio=True
     * @return List of watch playlist items. The counterpart key is optional and only
     * appears if a song has a corresponding video counterpart (UI song/video switcher).
     * @example
     * {
     *   "tracks": [
     *      {
     *        "videoId": "9mWr4c_ig54",
     *        "title": "Foolish Of Me (feat. Jonathan Mendelsohn)",
     *        "length": "3:07",
     *        "thumbnail": [
     *          {
     *            "url": "https://lh3.googleusercontent.com/ulK2YaLtOW0PzcN7ufltG6e4ae3WZ9Bvg8CCwhe6LOccu1lCKxJy2r5AsYrsHeMBSLrGJCNpJqXgwczk=w60-h60-l90-rj",
     *            "width": 60,
     *            "height": 60
     *          }...
     *        ],
     *        "feedbackTokens": {
     *          "add": "AB9zfpIGg9XN4u2iJ...",
     *          "remove": "AB9zfpJdzWLcdZtC..."
     *        },
     *        "likeStatus": "INDIFFERENT",
     *        "artists": [
     *          {
     *            "name": "Seven Lions",
     *            "id": "UCYd2yzYRx7b9FYnBSlbnknA"
     *          },
     *          {
     *            "name": "Jason Ross",
     *            "id": "UCVCD9Iwnqn2ipN9JIF6B-nA"
     *          },
     *          {
     *            "name": "Crystal Skies",
     *            "id": "UCTJZESxeZ0J_M7JXyFUVmvA"
     *          }
     *        ],
     *        "album": {
     *          "name": "Foolish Of Me",
     *          "id": "MPREb_C8aRK1qmsDJ"
     *        },
     *        "year": "2020",
     *        "counterpart": {
     *          "videoId": "E0S4W34zFMA",
     *          "title": "Foolish Of Me [ABGT404] (feat. Jonathan Mendelsohn)",
     *          "length": "3:07",
     *          "thumbnail": [...],
     *          "feedbackTokens": null,
     *          "likeStatus": "LIKE",
     *          "artists": [
     *            {
     *              "name": "Jason Ross",
     *              "id": null
     *            },
     *            {
     *              "name": "Seven Lions",
     *              "id": null
     *            },
     *            {
     *              "name": "Crystal Skies",
     *              "id": null
     *            }
     *          ],
     *          "views": "6.6K"
     *        }
     *      },...
     *   ],
     *   "playlistId": "RDAMVM4y33h81phKU",
     *   "lyrics": "MPLYt_HNNclO0Ddoc-17"
     * }
     */
    async getWatchPlaylist(
      watchPlaylist: wt.getWatchPlaylistOptions
    ): Promise<wt.getWatchPlaylistReturn> {
      let { playlistId } = watchPlaylist;
      const {
        videoId,
        limit = 25,
        radio = false,
        shuffle = false,
      } = watchPlaylist;
      const body: Record<string, any> = {
        enablePersistentPlaylistPanel: true,
        isAudioOnly: true,
        tunerSettingValue: 'AUTOMIX_SETTING_NORMAL',
      };
      if (!videoId && !playlistId) {
        throw TypeError(
          'You must provide either a video id, a playlist id, or both'
        );
      }
      if (videoId) {
        body['videoId'] = videoId;
        if (!playlistId) {
          playlistId = 'RDAMVM' + videoId;
        }
        if (!(radio || shuffle)) {
          body['watchEndpointMusicSupportedConfigs'] = {
            watchEndpointMusicConfig: {
              hasPersistentPlaylistPanel: true,
              musicVideoType: 'MUSIC_VIDEO_TYPE_ATV',
            },
          };
        }
      }
      body['playlistId'] = validatePlaylistId(playlistId);
      const isPlaylist =
        body['playlistId'].startsWith('PL') ||
        body['playlistId'].startsWith('OLA');
      if (shuffle && playlistId) {
        body['params'] = 'wAEB8gECKAE%3D';
      }
      if (radio) {
        body['params'] = 'wAEB';
      }
      const endpoint = 'next';
      const response = await this._sendRequest<wt.response>(endpoint, body);
      const watchNextRenderer = nav(response, [
        'contents',
        'singleColumnMusicWatchNextResultsRenderer',
        'tabbedRenderer',
        'watchNextTabbedResultsRenderer',
      ] as const);

      const lyricsBrowseId = getTabBrowseId(watchNextRenderer, 1);
      const relatedBrowseId = getTabBrowseId(watchNextRenderer, 1);

      // Waiting on bugfix for nav nested arrays objects
      const results = nav(watchNextRenderer, [
        ...TAB_CONTENT,
        'musicQueueRenderer',
        'content',
        'playlistPanelRenderer',
      ] as const);
      const playlist = results['contents']
        .map(
          (x) =>
            nav(
              x,
              ['playlistPanelVideoRenderer', ...NAVIGATION_PLAYLIST_ID],
              null
            ) as unknown as string | null
        )
        .filter((x) => !!x)[0];
      let tracks = parseWatchPlaylist(results['contents']);

      if ('continuations' in results) {
        const request_func = (additionalParams: any): any =>
          this._sendRequest(endpoint, body, additionalParams);
        const parse_func = (
          contents: any
        ): ReturnType<typeof parseWatchPlaylist> =>
          parseWatchPlaylist(contents);
        tracks = [
          ...tracks,
          ...(await getContinuations(
            results,
            'playlistPanelContinuation',
            limit - tracks.length,
            request_func,
            parse_func,
            isPlaylist ? '' : 'Radio'
          )),
        ];
      }
      return {
        tracks: tracks,
        playlistId: playlist,
        lyrics: lyricsBrowseId,
        related: relatedBrowseId,
      };
    }
  };
};
