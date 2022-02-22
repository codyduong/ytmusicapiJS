import {
  prepareLikeEndpoint,
  prepareOrderParams,
  validateOrderParameters,
} from '../helpers';
import {
  SINGLE_COLUMN_TAB,
  SECTION_LIST,
  ITEM_SECTION,
  GRID,
  MUSIC_SHELF,
  TITLE,
  MENU_SERVICE,
  FEEDBACK_TOKEN,
  TITLE_TEXT,
} from '../parsers';
import { parseContentList, parsePlaylist } from '../parsers/browsing';
import {
  parseLibraryAlbums,
  parseLibraryArtists,
  parseLibrarySongs,
} from '../parsers/library';
import { parsePlaylistItems } from '../parsers/playlists';
import {
  validateResponse as validateResponseFunc,
  findObjectByKey,
  getContinuations,
  nav,
  resendRequestUntilParsedResponseIsValid,
  getValidatedContinuations,
} from '../parsers/utils';
import { YTMusicBase } from './.mixin.helper';

import * as lt from './library.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const LibraryMixin = <TBase extends YTMusicBase>(Base: TBase) => {
  return class LibraryMixin extends Base {
    /**
     * Retrieves the playlists in the user's library.
     * @param {number} [limit = 25] Number of playlists to retrieve.
     * @return Array of owned playlists.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   'playlistId': 'PLQwVIlKxHM6rz0fDJVv_0UlXGEWf-bFys',
     *   'title': 'Playlist title',
     *   'thumbnails: [...],
     *   'count': 5
     * }
     */
    async getLibraryPlaylists(limit = 25): Promise<Array<Record<string, any>>> {
      this._checkAuth();
      const body = { browseId: 'FEmusic_liked_playlists' };
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);

      let results = findObjectByKey(
        nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]),
        'itemSectionRenderer'
      );
      results = nav(results, [...ITEM_SECTION, ...GRID]);
      let playlists: Array<any> = parseContentList(
        results['items'].slice(1),
        parsePlaylist
      );

      if ('continuations' in results) {
        const requestFunc = async (additionalParams: string): Promise<any> =>
          await this._sendRequest(endpoint, body, additionalParams);
        const parseFunc = (contents: Record<string, any>[]): any =>
          parseContentList(contents, parsePlaylist);
        playlists = [
          ...playlists,
          ...(await getContinuations(
            results,
            'gridContinuation',
            limit - playlists.length,
            requestFunc,
            parseFunc
          )),
        ];
      }

      return playlists;
    }

    /**
     * Gets the songs in the user's library (liked videos are not included).
     * To get liked songs and videos, use `getLikedSongs`.
     * @param {Object} [options=]
     * @param {number} [options.limit = 25] Limit number of songs to retrieve.
     * @param {boolean} [options.validateResponse = false] Flag indicating if responses from YTM should be validated and retried in case when some songs are missing.
     * @param {lt.Order} [options.order=] Order of songs to return. Allowed values: 'a_to_z', 'z_to_a', 'recently_added'.
     * @return List of songs. Same format as `getPlaylist`
     */
    async getLibrarySongs(options?: {
      limit?: number;
      validateResponse?: boolean;
      order?: lt.Order;
    }): Promise<Array<Record<string, any>>> {
      this._checkAuth();
      const { limit = 25, validateResponse = false, order } = options ?? {};

      const body: Record<string, any> = { browseId: 'FEmusic_liked_videos' };

      validateOrderParameters(order);
      if (order) {
        body['params'] = prepareOrderParams(order);
      }
      const endpoint = 'browse';
      const perPage = 25;

      const requestFunc = async (_additionalParams: any): Promise<any> =>
        await this._sendRequest(endpoint, body); //additionalParams doesnt do anything? @codyduong PR this.
      const parseFunc = (rawResponse: any): any =>
        parseLibrarySongs(rawResponse);

      let response: Record<string, any>;
      if (validateResponse) {
        const validateFunc = (parsed: any): any =>
          validateResponseFunc(parsed, perPage, limit, 0);
        response = await resendRequestUntilParsedResponseIsValid(
          requestFunc,
          null,
          parseFunc,
          validateFunc,
          3
        );
      } else {
        response = parseFunc(requestFunc(null));
      }

      const results = response['results'];
      let songs = response['parsed'];

      if ('continuations' in results) {
        const requestContinuationsFunc = async (
          additionalParams: string
        ): Promise<any> =>
          await this._sendRequest(endpoint, body, additionalParams);
        const parseContinuationsFunc = (contents: any): any =>
          parsePlaylistItems(contents);

        if (validateResponse) {
          songs = {
            ...songs,
            ...(await getValidatedContinuations(
              results,
              'musicShelfContinuation',
              limit - songs.length,
              perPage,
              requestContinuationsFunc,
              parseContinuationsFunc
            )),
          };
        } else {
          songs = [
            ...songs,
            ...(await getContinuations(
              results,
              'musicShelfContinuation',
              limit - songs.length,
              requestContinuationsFunc,
              parseContinuationsFunc
            )),
          ];
        }
      }
      return songs;
    }

    /**
     * Gets the albums in the user's library.
     * @param {Object} [options=]
     * @param {number} [options.limit = 25] Number of albums to return.
     * @param {lt.Order} [options.order=] Order of albums to return. Allowed values: 'a_to_z', 'z_to_a', 'recently_added'.
     * @return List of albums.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "browseId": "MPREb_G8AiyN7RvFg",
     *   "title": "Beautiful",
     *   "type": "Album",
     *   "thumbnails": [...],
     *   "artists": [{
     *     "name": "Project 46",
     *     "id": "UCXFv36m62USAN5rnVct9B4g"
     *   }],
     *     "year": "2015"
     * }
     */
    async getLibraryAlbums(options?: {
      limit?: number;
      order?: lt.Order;
    }): Promise<Array<Record<string, any>>> {
      this._checkAuth();
      const { limit = 25, order } = options ?? {};
      const body: Record<string, any> = { browseId: 'FEmusic_liked_albums' };
      if (order) {
        body['params'] = prepareOrderParams(order);
      }

      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      return await parseLibraryAlbums(
        response,
        async (additionalParams: string) =>
          await this._sendRequest(endpoint, body, additionalParams),
        limit
      );
    }

    /**
     * Gets the artists of the songs in the user's library.
     * @param {Object} [options=]
     * @param {number} [options.limit = 25] Number of artists to return.
     * @param {lt.Order} [options.order=] Order of artists to return.
     * @return List of artists.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "browseId": "UCxEqaQWosMHaTih-tgzDqug",
     *   "artist": "WildVibes",
     *   "subscribers": "2.91K",
     *   "thumbnails": [...]
     * }
     */
    async getLibraryArtists(options?: {
      limit: number;
      order?: lt.Order;
    }): Promise<Array<Record<string, any>>> {
      this._checkAuth();
      const body = { browseId: 'FEmusic_library_corpus_track_artists' };
      const { limit = 25, order } = options ?? {};
      validateOrderParameters(order);
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      return await parseLibraryArtists(
        response,
        async (additionalParams: any): Promise<any> =>
          await this._sendRequest(endpoint, body, additionalParams),
        limit
      );
    }

    /**
     * Gets the artists the user has subscribed to.
     * @param options
     * @param {number} [options.limit=25] Number of artists to return.
     * @param {lt.Order} [options.order=]  Order of artists to return. Allowed values: 'a_to_z', 'z_to_a', 'recently_added'.
     * @return List of artists. Same format as `getLibraryArtists`
     */
    async getLibrarySubscriptions(options?: {
      limit?: number;
      order?: lt.Order;
    }): Promise<Array<Record<string, any>>> {
      this._checkAuth();
      const { limit = 25, order } = options ?? {};
      const body: Record<string, any> = {
        browseId: 'FEmusic_library_corpus_artists',
      };
      validateOrderParameters(order);
      if (order) {
        body['params'] = prepareOrderParams(order);
      }
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      return parseLibraryArtists(
        response,
        async (additionalParams) =>
          await this._sendRequest(endpoint, body, additionalParams),
        limit
      );
    }

    /**
     * Gets playlist items for the 'Liked Songs' playlist.
     * @param {number} [limit=100] How many items to return.
     * @return List of playlistItem dictionaries. See `getPlaylist`
     */
    async getLikedSongs(limit = 100): Promise<Record<string, any>> {
      //@ts-expect-error: Mix this in @codyduong
      return await this.getPlaylist('LM', limit);
    }

    /**
     * Gets your play history in reverse chronological order.
     *
     * @return List of playlistItems, see `getPlaylist`.
     *
     * The additional property ``played`` indicates when the playlistItem was played.
     *
     * The additional property ``feedbackToken`` can be used to remove items with `removeHistoryItems`.
     */
    async getHistory(): Promise<Record<string, any>[]> {
      this._checkAuth();
      const body = { browseId: 'FEmusic_history' };
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      const results = nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]);
      let songs: any[] = [];
      for (const content of results) {
        const data = nav(content, [...MUSIC_SHELF, 'contents'], true);
        if (!data) {
          const error = nav(
            content,
            ['musicNotifierShelfRenderer', ...TITLE],
            true
          );
          throw new Error(error);
        }
        const menuEntries = [-1, ...MENU_SERVICE, ...FEEDBACK_TOKEN];
        const songlist = parsePlaylistItems(data, menuEntries);
        for (const song of songlist) {
          song['played'] = nav(content['musicShelfRenderer'], TITLE_TEXT);
        }
        songs = [...songs, ...songlist];
      }
      return songs;
    }

    /**
     * Remove an item from the account's history. This method does currently not work with brand accounts.
     * @param feedbackTokens  Token to identify the item to remove, obtained from `getHistory`.
     * @return Full response.
     */
    async removeHistoryItems(
      feedbackTokens: string[]
    ): Promise<Record<string, any>> {
      this._checkAuth();
      const body = { feedbackTokens };
      const endpoint = 'feedback';
      const response = await this._sendRequest(endpoint, body);

      return response;
    }

    /**
     * Rates a song ("thumbs up"/"thumbs down" interactions on YouTube Music).
     * @param {string} [videoId] Video id.
     * @param {string} [rating='INDIFFERENT'] One of 'LIKE', 'DISLIKE', 'INDIFFERENT'.
     * 'INDIFFERENT' removes the playlist/album from the library
     * @return Full response.
     */
    async rateSong(
      videoId: string,
      rating: lt.Rating = 'INDIFFERENT'
    ): Promise<Record<string, any> | void> {
      this._checkAuth();
      const body = { target: { videoId } };
      const endpoint = prepareLikeEndpoint(rating);
      if (!endpoint) {
        return;
      }

      return await this._sendRequest(endpoint, body);
    }

    /**
     * Adds or removes a song from your library depending on the token provided.
     * @param {string[]} [feedbackTokens] List of feedbackTokens obtained from authenticated requests
     * to endpoints that return songs (i.e. `get_album`).
     * @return Full response.
     */
    async editSongLibraryStatus(
      feedbackTokens: string[]
    ): Promise<Record<string, any>> {
      this._checkAuth();
      const body = { feedbackTokens };
      const endpoint = 'feedback';
      return await this._sendRequest(endpoint, body);
    }

    /**
     * Rates a playlist/album ("Add to library"/"Remove from library" interactions on YouTube Music)
     * You can also dislike a playlist/album, which has an effect on your recommendations
     * @param {string} [videoId] Playlist id.
     * @param {string} [rating='INDIFFERENT'] One of 'LIKE', 'DISLIKE', 'INDIFFERENT'.
     * 'INDIFFERENT' removes the playlist/album from the library.
     * @return Full response.
     */
    async ratePlaylist(
      playlistId: string,
      rating: lt.Rating = 'INDIFFERENT'
    ): Promise<Record<string, any> | null> {
      this._checkAuth();
      const body = { target: { playlistId } };
      const endpoint = prepareLikeEndpoint(rating);
      return endpoint ? await this._sendRequest(endpoint, body) : null;
    }

    /**
     * Subscribe to artists. Adds the artists to your library.
     * @param channelIds Artist channel ids.
     * @return Full response.
     */
    async subscribeArtists(channelIds: string[]): Promise<Record<string, any>> {
      this._checkAuth();
      const body = { channelIds };
      const endpoint = 'subscription/subscribe';
      return await this._sendRequest(endpoint, body);
    }

    /**
     * Unsubscribe to artists. Removes the artists to your library.
     * @param channelIds Artist channel ids.
     * @return Full response.
     */
    async unsubscribeArtists(
      channelIds: string[]
    ): Promise<Record<string, any>> {
      this._checkAuth();
      const body = { channelIds: channelIds };
      const endpoint = 'subscription/unsubscribe';
      return await this._sendRequest(endpoint, body);
    }
  };
};
