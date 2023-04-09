import { sumTotalDuration, toInt } from '../helpers';
import {
  CAROUSEL,
  CONTENT,
  DESCRIPTION,
  MUSIC_SHELF,
  nav,
  NAVIGATION_BROWSE_ID,
  RELOAD_CONTINUATION,
  SECTION_LIST_CONTINUATION,
  SECTION_LIST_ITEM,
  SINGLE_COLUMN_TAB,
  SUBTITLE2,
  SUBTITLE3,
  THUMBNAIL_CROPPED,
  TITLE_TEXT,
} from '../parsers';
import {
  getContinuationContents,
  getContinuationParams,
  getContinuations,
  getContinuationString,
} from '../continuations';
import { parsePlaylistItems } from '../parsers/playlists';
import { validatePlaylistId } from '../parsers/utils';
import { GConstructor, Mixin } from './.mixin.helper';
import { ExploreMixin } from './explore';

import * as pt from './playlists.types';
import { htmlToText } from './_utils';
import { parseContentList, parsePlaylist } from '../parsers/browsing';
import { parsePlaylistReturn } from '../parsers/browsing.types';
import { parsePlaylistItemsReturn } from '../parsers/playlists.types';

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
     * @param {string} [playlistId] Playlist id.
     * @param {number} [limit = 100] How many songs to return. `null` retrieves them all.
     * @param {boolean} [related = False] Whether to fetch 10 related playlists or not.
     * @param {boolean} [suggestionsLimit = 0] How many suggestions to return. The result is a list of
     *   suggested playlist items (videos) contained in a "suggestions" key.
     *   7 items are retrieved in each internal request.
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
     *   "suggestions": [
     *       {
     *         "videoId": "HLCsfOykA94",
     *         "title": "Mambo (GATTÜSO Remix)",
     *         "artists": [{
     *             "name": "Nikki Vianna",
     *             "id": "UCMW5eSIO1moVlIBLQzq4PnQ"
     *           }],
     *         "album": {
     *           "name": "Mambo (GATTÜSO Remix)",
     *           "id": "MPREb_jLeQJsd7U9w"
     *         },
     *         "likeStatus": "LIKE",
     *         "thumbnails": [...],
     *         "isAvailable": true,
     *         "isExplicit": false,
     *         "duration": "3:32",
     *         "duration_seconds": 212,
     *         "setVideoId": "to_be_updated_by_client"
     *       }
     *   ],
     *   "related": [
     *       {
     *         "title": "Presenting MYRNE",
     *         "playlistId": "RDCLAK5uy_mbdO3_xdD4NtU1rWI0OmvRSRZ8NH4uJCM",
     *         "thumbnails": [...],
     *         "description": "Playlist • YouTube Music"
     *       }
     *   ],
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
     *     "videoType": "MUSIC_VIDEO_TYPE_OMV"
     *     "feedbackTokens": {
     *       "add": "AB9zfpJxtvrU...",
     *       "remove": "AB9zfpKTyZ..."
     *     }
     *   ]
     * }
     */
    async getPlaylist(
      options: pt.getPlaylistOptions
    ): Promise<pt.getPlaylistReturn>;
    async getPlaylist(
      options: string,
      limit: number | null,
      related: boolean,
      suggestionsLimit: number
    ): Promise<pt.getPlaylistReturn>;
    async getPlaylist(
      options: string | pt.getPlaylistOptions,
      limit: number | null = 100,
      related = false,
      suggestionsLimit = 0
    ): Promise<pt.getPlaylistReturn> {
      const {
        playlistId,
        limit: limitI = 100,
        related: relatedI = false,
        suggestionsLimit: suggestionsLimitI = 0,
      } = typeof options == 'object'
        ? options
        : {
            playlistId: options,
            limit: limit,
            related: related,
            suggestionsLimit: suggestionsLimit,
          };

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
      playlist['description'] = nav(header, DESCRIPTION, null);
      const runCount = header['subtitle']['runs'].length;

      if (runCount > 1) {
        playlist['author'] = {
          name: nav(header, SUBTITLE2),
          id: nav(
            header,
            ['subtitle', 'runs', 2, ...NAVIGATION_BROWSE_ID],
            null
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

      const requestFunc = async (
        additionalParams: any
      ): Promise<Record<string, any>> =>
        await this._sendRequest(endpoint, body, additionalParams);
      const section_list = nav(response, [
        ...SINGLE_COLUMN_TAB,
        'sectionListRenderer',
      ]);
      if ('continuations' in section_list) {
        let additionalParams = getContinuationParams(section_list);
        if (ownPlaylist && (suggestionsLimitI > 0 || relatedI)) {
          const parseFunc = (
            results: any
          ): ReturnType<typeof parsePlaylistItems> =>
            parsePlaylistItems(results);
          const suggested = await requestFunc(additionalParams);
          const continuation = nav(suggested, SECTION_LIST_CONTINUATION);
          additionalParams = getContinuationParams(continuation);
          const suggestions_shelf = nav(continuation, [
            ...CONTENT,
            ...MUSIC_SHELF,
          ]);
          playlist['suggestions'] = getContinuationContents(
            suggestions_shelf,
            parseFunc
          );

          playlist['suggestions'] = playlist['suggestions']?.concat(
            await getContinuations(
              suggestions_shelf,
              'musicShelfContinuation',
              suggestionsLimitI - playlist['suggestions'].length,
              requestFunc,
              parseFunc,
              '',
              true
            )
          );
        }
        if (relatedI) {
          const response = await requestFunc(additionalParams);
          const continuation = nav(response, SECTION_LIST_CONTINUATION);
          const parse_func = (results: any): parsePlaylistReturn[] =>
            parseContentList(results, parsePlaylist);
          playlist['related'] = getContinuationContents(
            nav(continuation, [...CONTENT, ...CAROUSEL]),
            parse_func
          );
        }
      }
      if (songCount > 0) {
        playlist['tracks'] = parsePlaylistItems(results['contents']);
        const newLimit = limitI === null ? songCount : limitI;
        const songsToGet = Math.min(newLimit, songCount);

        const parseFunc = (contents: any): parsePlaylistItemsReturn =>
          parsePlaylistItems(contents);
        if ('continuations' in results) {
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
      // For some reason we are able to go over limit, so manually truncate at the end @codyduong TODO
      if (limitI) {
        playlist['tracks'] = playlist['tracks'].slice(0, limitI);
      }
      playlist['duration_seconds'] = sumTotalDuration(playlist);
      return playlist;
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
