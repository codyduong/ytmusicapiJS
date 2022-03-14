import { htmlToText, sumTotalDuration, toInt } from '../helpers';
import {
  DESCRIPTION,
  MUSIC_SHELF,
  NAVIGATION_BROWSE_ID,
  RELOAD_CONTINUATION,
  SECTION_LIST_ITEM,
  SINGLE_COLUMN_TAB,
  SUBTITLE2,
  SUBTITLE3,
  THUMBNAIL_CROPPED,
  TITLE_TEXT,
} from '../parsers';
import { parsePlaylistItems } from '../parsers/playlists';
import {
  getContinuations,
  getContinuationString,
  nav,
  validatePlaylistId,
} from '../parsers/utils';
import { GConstructor, Mixin } from './.mixin.helper';
import { ExploreMixin } from './explore';

import * as pt from './playlists.types';

export type PlaylistsMixin = Mixin<typeof PlaylistsMixin>;

/**
 * @module Playlists
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const PlaylistsMixin = <TBase extends GConstructor<ExploreMixin>>(
  Base: TBase
) => {
  return class PlaylistsMixin extends Base {
    /**
     * Return a list of playlist items.
     * @param {string} [playlistId ] Playlist id.
     * @param {number} [limit=100] How many songs to return.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "id": "PLQwVIlKxHM6qv-o99iX9R85og7IzF9YS_",
     *   "privacy": "PUBLIC",
     *   "title": "New EDM This Week 03/13/2020",
     *   "thumbnails": [...]
     *   "description": "Weekly r/EDM new release roundup. Created with github.com/sigma67/spotifyplaylist_to_gmusic",
     *   "author": "sigmatics",
     *   "year": "2020",
     *   "duration": "6+ hours",
     *   "duration_seconds": 52651,
     *   "trackCount": 237,
     *   "tracks": [
     *     {
     *       "videoId": "bjGppZKiuFE",
     *       "title": "Lost",
     *       "artists": [
     *         {
     *           "name": "Guest Who",
     *           "id": "UCkgCRdnnqWnUeIH7EIc3dBg"
     *         },
     *         {
     *           "name": "Kate Wild",
     *           "id": "UCwR2l3JfJbvB6aq0RnnJfWg"
     *         }
     *       ],
     *       "album": {
     *       "name": "Lost",
     *       "id": "MPREb_PxmzvDuqOnC"
     *     },
     *     "duration": "2:58",
     *     "likeStatus": "INDIFFERENT",
     *     "thumbnails": [...],
     *     "isAvailable": True,
     *     "isExplicit": False,
     *     "feedbackTokens": {
     *       "add": "AB9zfpJxtvrU...",
     *       "remove": "AB9zfpKTyZ..."
     *     }
     *   ]
     * }
     */
    async getPlaylist(
      playlistId: string,
      limit = 100
    ): Promise<pt.getPlaylistReturn> {
      const browseId = !playlistId.startsWith('VL')
        ? `VL${playlistId}`
        : playlistId;
      const body: Record<string, any> = { browseId: browseId };
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        'musicPlaylistShelfRenderer',
      ]);
      const playlist: pt.getPlaylistReturn = {
        id: results['playlistId'],
      } as any;
      const ownPlaylist =
        'musicEditablePlaylistDetailHeaderRenderer' in response['header'];
      let header;
      if (!ownPlaylist) {
        header = response['header']['musicDetailHeaderRenderer'];
        playlist['privacy'] = 'PUBLIC';
      } else {
        header =
          response['header']['musicEditablePlaylistDetailHeaderRenderer'];
        playlist['privacy'] =
          header['editHeader']['musicPlaylistEditHeaderRenderer']['privacy'];
        header = header['header']['musicDetailHeaderRenderer'];
      }

      playlist['title'] = nav(header, TITLE_TEXT);
      playlist['thumbnails'] = nav(header, THUMBNAIL_CROPPED);
      playlist['description'] = nav(header, DESCRIPTION, true);
      const runCount = header['subtitle']['runs'].length;

      if (runCount > 1) {
        playlist['author'] = {
          name: nav(header, SUBTITLE2),
          id: nav(
            header,
            ['subtitle', 'runs', 2, ...NAVIGATION_BROWSE_ID],
            true
          ),
        };
        if (runCount == 5) {
          playlist['year'] = nav(header, SUBTITLE3);
        }
      }

      const songCount = toInt(
        header['secondSubtitle']['runs'][0]['text'].normalize('NFKD')
      );
      if (header['secondSubtitle']['runs'].length > 1) {
        playlist['duration'] = header['secondSubtitle']['runs'][2]['text'];
      }

      playlist['trackCount'] = songCount;
      playlist['suggestions_token'] = nav(
        response,
        [
          ...SINGLE_COLUMN_TAB,
          'sectionListRenderer',
          'contents',
          1,
          ...MUSIC_SHELF,
          ...RELOAD_CONTINUATION,
        ],
        true
      );

      playlist['tracks'] = [];
      if (songCount > 0) {
        playlist['tracks'] = [
          ...playlist['tracks'],
          ...parsePlaylistItems(results['contents']),
        ];
        const songsToGet = Math.min(limit, songCount);

        if ('continuations' in results) {
          const requestFunc = async (additionalParams: any): Promise<any> =>
            await this._sendRequest(endpoint, body, additionalParams);
          const parseFunc = (contents: any): any =>
            parsePlaylistItems(contents);
          playlist['tracks'] = [
            ...playlist['tracks'],
            ...(await getContinuations(
              results,
              'musicPlaylistShelfContinuation',
              songsToGet - playlist['tracks'].length,
              requestFunc,
              parseFunc
            )),
          ];
        }
      }
      //For some reason we are able to go over limit, so manually truncate at the end @codyduong TODO
      playlist['tracks'] = playlist['tracks'].slice(0, limit);
      playlist['duration_seconds'] = sumTotalDuration(playlist);
      return playlist;
    }

    /**
     * Gets suggested tracks to add to a playlist. Suggestions are offered for playlists with less than 100 tracks
     * @param suggestionsToken Token returned by `getPlaylist` or this function
     * @returns Object containing suggested `tracks` and a `refresh_token` to get another set of suggestions.
     * For data format of tracks, check `getPlaylist`
     */
    async getPlaylistSuggestions(
      suggestionsToken: string
    ): Promise<Record<string, any>> {
      if (!suggestionsToken) {
        throw new Error(
          'Suggestions token is undefined.\nPlease ensure the playlist is small enough to receive suggestions.'
        );
      }
      const endpoint = 'browse';
      const additionalParams = getContinuationString(suggestionsToken);
      const response = this._sendRequest(endpoint, {}, additionalParams);
      const results = nav(response, [
        'continuationContents',
        'musicShelfContinuation',
      ]);
      const refreshToken = nav(results, RELOAD_CONTINUATION);
      const suggestions = parsePlaylistItems(results['contents']);
      return { tracks: suggestions, refresh_token: refreshToken };
    }

    /**
     * Creates a new empty playlist and returns its id.
     * @param title Playlist title.
     * @param options
     * @param {string} [options.description] Optional. Playlist description.
     * @param {string} [options.privacyStatus='PRIVATE'] Playlists can be 'PUBLIC', 'PRIVATE', or 'UNLISTED'. Default: 'PRIVATE'.
     * @param {string[]} [options.videoIds] IDs of songs to create the playlist with.
     * @param {string} [options.sourcePlaylist] Another playlist whose songs should be added to the new playlist.
     * @returns ID of the YouTube playlist or full response if there was an error.
     */
    async createPlaylist(
      title: string,
      options?: {
        description?: string;
        privacyStatus?: pt.PrivacyStatus;
        videoIds?: string[];
        sourcePlaylist?: string;
      }
    ): Promise<string | Record<string, any>>;
    /**
     * Creates a new empty playlist and returns its id.
     * @param title Playlist title.
     * @param description Optional. Playlist description.
     * @param options
     * @param {string} [options.privacyStatus='PRIVATE'] Playlists can be 'PUBLIC', 'PRIVATE', or 'UNLISTED'. Default: 'PRIVATE'.
     * @param {string[]} [options.videoIds] IDs of songs to create the playlist with.
     * @param {string} [options.sourcePlaylist] Another playlist whose songs should be added to the new playlist.
     * @returns ID of the YouTube playlist or full response if there was an error.
     */
    async createPlaylist(
      title: string,
      description?: string,
      options?: {
        privacyStatus?: pt.PrivacyStatus;
        videoIds?: string[];
        sourcePlaylist?: string;
      }
    ): Promise<string | Record<string, any>>;
    /**
     * Creates a new empty playlist and returns its id.
     * @param title Playlist title.
     * @param description Optional. Playlist description.
     * @param {string} [privacyStatus='PRIVATE'] Playlists can be 'PUBLIC', 'PRIVATE', or 'UNLISTED'. Default: 'PRIVATE'.
     * @param options
     * @param {string[]} [options.videoIds] IDs of songs to create the playlist with.
     * @param {string} [options.sourcePlaylist] Another playlist whose songs should be added to the new playlist.
     * @returns ID of the YouTube playlist or full response if there was an error.
     */
    async createPlaylist(
      title: string,
      description?:
        | string
        | {
            description?: string;
            privacyStatus?: pt.PrivacyStatus;
            videoIds?: string[];
            sourcePlaylist?: string;
          },
      privacyStatus?:
        | {
            privacyStatus?: pt.PrivacyStatus;
            videoIds?: string[];
            sourcePlaylist?: string;
          }
        | pt.PrivacyStatus,
      options?: { videoIds?: string[]; sourcePlaylist?: string }
    ): Promise<string | Record<string, any>> {
      this._checkAuth();
      let actualDescription,
        actualPrivacyStatus,
        actualVideoIds,
        actualSourcePlaylist;
      if (typeof description == 'object') {
        actualDescription = description.description;
        actualPrivacyStatus = description.privacyStatus;
        actualVideoIds = description.videoIds;
        actualSourcePlaylist = description.sourcePlaylist;
      } else if (typeof privacyStatus == 'object') {
        actualDescription = description;
        actualPrivacyStatus = privacyStatus.privacyStatus;
        actualVideoIds = privacyStatus.videoIds;
        actualSourcePlaylist = privacyStatus.sourcePlaylist;
      } else {
        actualDescription = description;
        actualPrivacyStatus = privacyStatus;
        actualVideoIds = options?.videoIds;
        actualSourcePlaylist = options?.sourcePlaylist;
      }

      const body: Record<string, any> = {
        title: title,
        description: htmlToText(actualDescription ?? ''), // YT does not allow HTML tags
        privacyStatus: actualPrivacyStatus,
      };
      if (actualVideoIds) {
        body['videoIds'] = actualVideoIds;
      }

      if (actualSourcePlaylist) {
        {
          body['sourcePlaylistId'] = actualSourcePlaylist;
        }
      }

      const endpoint = 'playlist/create';
      const response = await this._sendRequest(endpoint, body);
      return 'playlistId' in response ? response['playlistId'] : response;
    }

    /**
     * Edit title, description or privacyStatus of a playlist.
     * You may also move an item within a playlist or append another playlist to this playlist.
     * @param playlistId Playlist id.
     * @param options
     * @param {string} [options.title=] New title for the playlist.
     * @param {string} [options.description=] New description for the playlist.
     * @param {pt.PrivacyStatu} [options.privacyStatus=] New privacy status for the playlist.
     * @param {string} [options.moveItem=] Move one item before another. Items are specified by setVideoId, see `getPlaylist`.
     * @param {string} [options.addPlaylistId=] Id of another playlist to add to this playlist
     * @return Status String or full response
     */
    async editPlaylist(
      playlistId: string,
      options: {
        title?: string;
        description?: string | null;
        privacyStatus?: pt.PrivacyStatus;
        moveItem?: [string, string];
        addPlaylistId?: string;
      }
    ): Promise<string | Record<string, any>> {
      this._checkAuth();
      const { title, description, privacyStatus, moveItem, addPlaylistId } =
        options;
      const body: Record<string, any> = {
        playlistId: validatePlaylistId(playlistId),
      };
      const actions = [];
      if (title) {
        {
          actions.push({
            action: 'ACTION_SET_PLAYLIST_NAME',
            playlistName: title,
          });
        }
      }

      if (description) {
        actions.push({
          action: 'ACTION_SET_PLAYLIST_DESCRIPTION',
          playlistDescription: description,
        });
      }
      if (privacyStatus) {
        actions.push({
          action: 'ACTION_SET_PLAYLIST_PRIVACY',
          playlistPrivacy: privacyStatus,
        });
      }
      if (moveItem) {
        actions.push({
          action: 'ACTION_MOVE_VIDEO_BEFORE',
          setVideoId: moveItem[0],
          movedSetVideoIdSuccessor: moveItem[1],
        });
      }

      if (addPlaylistId) {
        actions.push({
          action: 'ACTION_ADD_PLAYLIST',
          addedFullListId: addPlaylistId,
        });
      }

      body['actions'] = actions;
      const endpoint = 'browse/edit_playlist';
      const response = await this._sendRequest(endpoint, body);
      return 'status' in response ? response['status'] : response;
    }

    /**
     * Delete a playlist.
     * @param {string} [playlistId] Playlist id.
     * @returns Status String or full response.
     */
    async deletePlaylist(
      playlistId: string
    ): Promise<string | Record<string, any>> {
      this._checkAuth();
      const body = { playlistId: validatePlaylistId(playlistId) };
      const endpoint = 'playlist/delete';
      const response = await this._sendRequest(endpoint, body);
      return 'status' in response ? response['status'] : response;
    }

    /**
     * Add songs to an existing playlist
     * @param playlistId Playlist id.
     * @param {string[]} [options.videoIds] IDs of songs to create the playlist with.
     * @param {string} [options.sourcePlaylist] Another playlist whose songs should be added to the new playlist.
     * @param {boolean} [options.duplicates=false]  If true, duplicates will be added. If false, an error will be returned if there are duplicates (no items are added to the playlist)
     * @returns Status String and an object containing the new setVideoId for each videoId or full response.
     */
    async addPlaylistItems(
      playlistId: string,
      options: {
        videoIds: string[];
        sourcePlaylist: string;
        duplicates: boolean;
      }
    ): Promise<pt.addPlaylistItemsReturn> {
      this._checkAuth();
      const { videoIds, sourcePlaylist, duplicates } = options;
      const body: Record<string, any> = {
        playlistId: validatePlaylistId(playlistId),
        actions: [],
      };
      if (!videoIds && !sourcePlaylist) {
        throw new Error(
          'You must provide either videoIds or a source_playlist to add to the playlist'
        );
      }
      if (videoIds) {
        for (const videoId of videoIds) {
          const action: Record<string, any> = {
            action: 'ACTION_ADD_VIDEO',
            addedVideoId: videoId,
          };
          if (duplicates) {
            action['dedupeOption'] = 'DEDUPE_OPTION_SKIP';
          }
          body['actions'].push(action);
        }
      }
      if (sourcePlaylist) {
        body['actions'].push({
          action: 'ACTION_ADD_PLAYLIST',
          addedFullListId: sourcePlaylist,
        });

        // add an empty ACTION_ADD_VIDEO because otherwise
        // YTM doesn't return the dict that maps videoIds to their new setVideoIds
        if (!videoIds) {
          body['actions'].push({
            action: 'ACTION_ADD_VIDEO',
            addedVideoId: null,
          });
        }
      }
      const endpoint = 'browse/edit_playlist';
      const response = await this._sendRequest(endpoint, body);
      if ('status' in response && response['status'].includes('SUCCEEDED')) {
        const resultArray = [
          (response['playlistEditResults'] ?? []).map(
            (resultData: any) => resultData['playlistEditVideoAddedResultData']
          ),
        ];
        return { status: response['status'], playlistEditResults: resultArray };
      } else {
        return response;
      }
    }

    /**
     * Remove songs from an existing playlist.
     * @param playlistId: Playlist id.
     * @param videos: List of PlaylistItems, see `getPlaylist`.
     *
     */
    async removePlaylistItems(
      playlistId: string,
      videos: Array<Record<string, any>>
    ): Promise<string | pt.getPlaylistReturn['tracks']> {
      this._checkAuth();
      videos = videos.filter((x) => 'videoId' in x && 'setVideoId' in x);
      if (videos.length == 0) {
        throw new Error(
          'Cannot remove songs, because setVideoId is missing. Do you own this playlist?'
        );
      }

      const body: Record<string, any> = {
        playlistId: validatePlaylistId(playlistId),
        actions: [],
      };
      for (const video of videos) {
        body['actions'].push({
          setVideoId: video['setVideoId'],
          removedVideoId: video['videoId'],
          action: 'ACTION_REMOVE_VIDEO',
        });
      }

      const endpoint = 'browse/edit_playlist';
      const response = await this._sendRequest(endpoint, body);
      return 'status' in response ? response['status'] : response;
    }
  };
};
