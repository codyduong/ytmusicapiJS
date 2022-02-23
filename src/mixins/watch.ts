import { YTMusicBase } from './.mixin.helper';

import { NAVIGATION_PLAYLIST_ID, TAB_CONTENT } from '../parsers';
import { getContinuations, nav, validatePlaylistId } from '../parsers/utils';
import { parseWatchPlaylist } from '../parsers/watch';

import * as wt from './watch.types';

/**
 * @module Watch
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const WatchMixin = <TBase extends YTMusicBase>(Base: TBase) => {
  return class WatchMixin extends Base {
    /**
     * Get a watch list of tracks. This watch playlist appears when you press
        play on a track in YouTube Music.
        Please note that the `INDIFFERENT` likeStatus of tracks returned by this
        endpoint may be either `INDIFFERENT` or `DISLIKE`, due to ambiguous data
        returned by YouTube Music.

     * @param videoId {string} videoId of the played video
     * @param playlistId {string} playlistId of the played playlist or album
     * @param limit {number} minimum number of watch playlist items to return
     * @param params only used internally by `getWatchPlaylistShuffle`
     * @return List of playlist items:
     * @example
     * {
          "tracks": [
              {
                "title": "Interstellar (Main Theme) - Piano Version",
                "byline": "Patrik Pietschmann • 47M views",
                "length": "4:47",
                "videoId": "4y33h81phKU",
                "thumbnail": [
                  {
                    "url": "https://i.ytimg.com/vi/4y...",
                    "width": 400,
                    "height": 225
                  }
                ],
                "feedbackTokens": [],
                "likeStatus": "LIKE"
              },...
          ],
          "playlistId": "RDAMVM4y33h81phKU",
          "lyrics": "MPLYt_HNNclO0Ddoc-17"
        }
     */
    async getWatchPlaylist(
      watchPlaylist: wt.getWatchPlaylistOptions
    ): Promise<wt.getWatchPlaylistReturn> {
      let { playlistId } = watchPlaylist;
      const { videoId, limit = 25, params } = watchPlaylist;
      const body: Record<string, any> = {
        enablePersistentPlaylistPanel: true,
        isAudioOnly: true,
      };
      if (!videoId && !playlistId) {
        throw new Error(
          'You must provide either a video id, a playlist id, or both'
        );
      }
      if (videoId) {
        body['videoId'] = videoId;
        if (!playlistId) {
          playlistId = 'RDAMVM' + videoId;
        }
        if (!params) {
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
      if (params) {
        body['params'] = params;
      }
      const endpoint = 'next';
      const response = await this._sendRequest<wt.response>(endpoint, body);
      const watchNextRenderer = nav<typeof response, wt.watchNextRenderer>(
        response,
        [
          'contents',
          'singleColumnMusicWatchNextResultsRenderer',
          'tabbedRenderer',
          'watchNextTabbedResultsRenderer',
        ]
      );

      let lyrics_browse_id = null;
      if (!('unselectable' in watchNextRenderer['tabs'][1]['tabRenderer'])) {
        lyrics_browse_id =
          watchNextRenderer['tabs'][1]['tabRenderer']['endpoint'][
            'browseEndpoint'
          ]['browseId'];
      }

      const results = nav<typeof watchNextRenderer, wt.results>(
        watchNextRenderer,
        [
          ...TAB_CONTENT,
          'musicQueueRenderer',
          'content',
          'playlistPanelRenderer',
        ]
      );
      const playlist = results['contents']
        .map((x) =>
          nav<never, string | null>(
            x,
            ['playlistPanelVideoRenderer', ...NAVIGATION_PLAYLIST_ID],
            true
          )
        )
        .filter((x) => !!x)[0];
      let tracks = parseWatchPlaylist(results['contents']);

      if ('continuations' in results) {
        const request_func = (additionalParams: any): any =>
          this._sendRequest(endpoint, body, additionalParams);
        const parse_func = (contents: any): any => parseWatchPlaylist(contents);
        tracks = {
          ...tracks,
          ...(await getContinuations(
            results,
            'playlistPanelContinuation',
            limit - tracks.length,
            request_func,
            parse_func,
            isPlaylist ? '' : 'Radio'
          )),
        };
      }
      return { tracks: tracks, playlistId: playlist, lyrics: lyrics_browse_id };
    }

    /**
     * Shuffle any playlist
     * @param videoId {string} Optional video id of the first video in the shuffled playlist
     * @param playlistId {string} Playlist id
     * @param limit {number} The number of watch playlist items to return @default 50
     * @returns A list of watch playlist items
     */
    async getWatchPlaylistShuffle(
      options: wt.getWatchPlaylistShuffleOptions
    ): Promise<wt.getWatchPlaylistReturn> {
      return this.getWatchPlaylist({
        ...options,
        params: 'wAEB8gECKAE%3D',
      });
    }
  };
};
