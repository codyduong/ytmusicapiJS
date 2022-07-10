/**
 * @module Uploads
 */

import { sumTotalDuration } from '../helpers';
import {
  SINGLE_COLUMN_TAB,
  SECTION_LIST,
  ITEM_SECTION,
  MUSIC_SHELF,
  SECTION_LIST_ITEM,
  findObjectByKey,
  nav,
} from '../parsers';
import { parseAlbumHeader } from '../parsers/albums';
import { parseLibraryArtists, parseLibraryAlbums } from '../parsers/library';
import { parseUploadedItems } from '../parsers/uploads';
import { getContinuations } from '../parsers/continuations';
import { GConstructor, Mixin } from './.mixin.helper';
import { existsSync, readFileSync, statSync } from 'fs';
import { extname, basename } from 'path';

import * as ut from './uploads.types';
import utf8 from 'utf8';
import axios from 'axios';
import { LibraryMixin } from './library';
import { validateOrderParameters, prepareOrderParams } from './_utils';

export type UploadsMixin = Mixin<typeof UploadsMixin>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const UploadsMixin = <TBase extends GConstructor<LibraryMixin>>(
  Base: TBase
) => {
  return class UploadsMixin extends Base {
    /**
     * Returns a list of uploaded songs
     * @param {ut.uploadsOptions} [options=] Options object.
     * @param {number} [options.limit=25] How many songs to return.
     * @param {ut.Order} [options.order] Order of songs to return.
     * @return Array of uploaded songs.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "entityId": "t_po_CICr2crg7OWpchDpjPjrBA",
     *   "videoId": "Uise6RPKoek",
     *   "artists": [{
     *     'name': 'Coldplay',
     *     'id': 'FEmusic_library_privately_owned_artist_detaila_po_CICr2crg7OWpchIIY29sZHBsYXk',
     *   }],
     *   "title": "A Sky Full Of Stars",
     *   "album": "Ghost Stories",
     *   "likeStatus": "LIKE",
     *   "thumbnails": [...]
     * }
     */
    async getLibraryUploadSongs(
      options?: ut.uploadsOptions
    ): Promise<ut.getLibraryUploadSongsReturn>;
    /**
     * Returns a list of uploaded songs
     * @param {number} [limit=25] How many songs to return.
     * @param {ut.Order} [order=] Order of songs to return.
     * @return Array of uploaded songs.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "entityId": "t_po_CICr2crg7OWpchDpjPjrBA",
     *   "videoId": "Uise6RPKoek",
     *   "artists": [{
     *     'name': 'Coldplay',
     *     'id': 'FEmusic_library_privately_owned_artist_detaila_po_CICr2crg7OWpchIIY29sZHBsYXk',
     *   }],
     *   "title": "A Sky Full Of Stars",
     *   "album": "Ghost Stories",
     *   "likeStatus": "LIKE",
     *   "thumbnails": [...]
     * }
     */
    async getLibraryUploadSongs(
      limit?: number,
      order?: ut.Order
    ): Promise<ut.getLibraryUploadSongsReturn>;
    async getLibraryUploadSongs(
      options?: ut.uploadsOptions | number,
      order?: never
    ): Promise<ut.getLibraryUploadSongsReturn> {
      this._checkAuth();
      const { limit = 25, order: _order } =
        typeof options == 'object' ? options : { limit: options, order: order };
      const endpoint = 'browse';
      const body: Record<string, any> = {
        browseId: 'FEmusic_library_privately_owned_tracks',
      };
      validateOrderParameters(_order);
      if (_order) {
        body['params'] = prepareOrderParams(_order);
      }
      const response = await this._sendRequest(endpoint, body);
      let results = findObjectByKey(
        nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]),
        'itemSectionRenderer'
      );
      results = nav(results, ITEM_SECTION);
      if (!results['musicShelfRenderer']) {
        return [];
      } else {
        results = results['musicShelfRenderer'];
      }

      let songs = [];

      songs = [...parseUploadedItems(results['contents'].slice(1))];

      if ('continuations' in results) {
        const requestFunc = async (additionalParams: string): Promise<any> =>
          await this._sendRequest(endpoint, body, additionalParams);
        songs = [
          ...songs,
          ...(await getContinuations(
            results,
            'musicShelfContinuation',
            limit - songs.length,
            requestFunc,
            parseUploadedItems
          )),
        ];
      }
      return songs;
    }

    /**
     * Gets the albums of uploaded songs in the user's library.
     * @param {ut.uploadsOptions} [options=] Options object.
     * @param {number} [options.limit=25] How many songs to return.
     * @param {ut.Order} [options.order] Order of songs to return.
     * @return Array of albums as returned by `getLibraryAlbums`
     */
    async getLibraryUploadAlbums(
      options?: ut.uploadsOptions
    ): Promise<ut.getLibraryUploadAlbumsReturn>;
    /**
     * Gets the albums of uploaded songs in the user's library.
     * @param {number} [limit=25] How many albums  to return.
     * @param {ut.Order} [order=] Order of albums  to return.
     * @return Array of albums as returned by `getLibraryAlbums`
     */
    async getLibraryUploadAlbums(
      limit?: number,
      order?: ut.Order
    ): Promise<ut.getLibraryUploadAlbumsReturn>;
    async getLibraryUploadAlbums(
      options?: ut.uploadsOptions | number,
      order?: never
    ): Promise<ut.getLibraryUploadAlbumsReturn> {
      this._checkAuth();
      const { limit = 25, order: _order } =
        typeof options == 'object' ? options : { limit: options, order: order };
      const body: Record<string, any> = {
        browseId: 'FEmusic_library_privately_owned_releases',
      };
      validateOrderParameters(_order);
      if (_order) {
        body['params'] = prepareOrderParams(_order);
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
     * Gets the artists of uploaded songs in the user's library.
     * @param {ut.uploadsOptions} [options=] Options object.
     * @param {number} [options.limit=25] How many songs to return.
     * @param {ut.Order} [options.order] Order of songs to return.
     * @return Array of artists as returned by `getLibraryArtists`
     */
    async getLibraryUploadArtists(
      options?: ut.uploadsOptions
    ): Promise<ut.getLibraryUploadArtistsReturn>;
    /**
     * Gets the artists of uploaded songs in the user's library.
     * @param {number} [limit=25] How many albums  to return.
     * @param {ut.Order} [order=] Order of albums  to return.
     * @return Array of albums as returned by `getLibraryAlbums`
     */
    async getLibraryUploadArtists(
      limit?: number,
      order?: ut.Order
    ): Promise<ut.getLibraryUploadArtistsReturn>;
    async getLibraryUploadArtists(
      options?: ut.uploadsOptions | number,
      order?: never
    ): Promise<ut.getLibraryUploadArtistsReturn> {
      this._checkAuth();
      const { limit = 25, order: _order } =
        typeof options == 'object' ? options : { limit: options, order: order };
      const body: Record<string, any> = {
        browseId: 'FEmusic_library_privately_owned_artists',
      };
      validateOrderParameters(_order);
      if (_order) {
        body['params'] = prepareOrderParams(_order);
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
     * Returns a list of uploaded tracks for the artist.
     * @param {string} [browseId] Browse id of the upload artist, i.e. from `get_library_upload_songs`.
     * @param {number} [limit=25]  Number of songs to return (increments of 25).
     * @example
     * [
     *   {
     *     "entityId": "t_po_CICr2crg7OWpchDKwoakAQ",
     *     "videoId": "Dtffhy8WJgw",
     *     "title": "Hold Me (Original Mix)",
     *     "artists": [
     *       {
     *         "name": "Jakko",
     *         "id": "FEmusic_library_privately_owned_artist_detaila_po_CICr2crg7OWpchIFamFra28"
     *       }
     *     ],
     *     "album": null,
     *     "likeStatus": "LIKE",
     *     "thumbnails": [...]
     *   }
     * ]
     */
    async getLibraryUploadArtist(
      browseId: string,
      limit = 25
    ): Promise<ut.getLibraryUploadArtistReturn> {
      this._checkAuth();
      const body = { browseId: browseId };
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        ...MUSIC_SHELF,
      ]);
      if (results['contents'].results > 1) {
        results['contents'].pop(0);
      }

      let items = parseUploadedItems(results['contents']);

      if ('continuations' in results) {
        const requestFunc = async (additionalParams: string): Promise<any> =>
          await this._sendRequest(endpoint, body, additionalParams);
        const parseFunc = (contents: any): any => parseUploadedItems(contents);
        items = [
          ...items,
          ...(await getContinuations(
            results,
            'musicShelfContinuation',
            limit,
            requestFunc,
            parseFunc
          )),
        ];
      }

      return items;
    }

    /**
     * Get information and tracks of an album associated with uploaded tracks
     * @param {string} [browseId] Browse id of the upload album, i.e. from `getLibraryUploadSongs`
     * @return Object with title, description, artist, and tracks.
     * @example
     * {
     *   "title": "18 Months",
     *   "type": "Album",
     *   "thumbnails": [...],
     *   "trackCount": 7,
     *   "duration": "24 minutes",
     *   "audioPlaylistId": "MLPRb_po_55chars",
     *   "tracks": [
     *     {
     *       "entityId": "t_po_22chars",
     *       "videoId": "FVo-UZoPygI",
     *       "title": "Feel So Close",
     *       "duration": "4:15",
     *       "duration_seconds": 255,
     *       "artists": None,
     *       "album": {
     *         "name": "18 Months",
     *         "id": "FEmusic_library_privately_owned_release_detailb_po_55chars"
     *       },
     *       "likeStatus": "INDIFFERENT",
     *       "thumbnails": None
     *     }
     *   ]
     * }
     */
    async getLibraryUploadAlbum(
      browseId: string
    ): Promise<ut.getLibraryUploadAlbumReturn> {
      this._checkAuth();
      const body = { browseId: browseId };
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      const album = parseAlbumHeader(
        response
      ) as unknown as ut.getLibraryUploadAlbumReturn;
      const results = nav(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST_ITEM,
        ...MUSIC_SHELF,
      ]);
      album['tracks'] = parseUploadedItems(results['contents']);
      album['duration_seconds'] = sumTotalDuration(album);
      return album;
    }

    /**
     * Uploads a song to YouTube Music.
     * @param filepath Path to the music file (mp3, m4a, wma, flac or ogg).
     * @returns Status String or full response.
     */
    async uploadSong(
      filepath: string
    ): Promise<'STATUS_SUCCEEDED' | Record<string, any>> {
      this._checkAuth();
      if (!existsSync(filepath)) {
        throw new Error('The provided file does not exist.');
      }
      const supportedFiletypes = ['mp3', 'm4a', 'wma', 'flac', 'ogg'];
      if (supportedFiletypes.includes(extname(filepath))) {
        throw new Error(
          'The provided file type is not supported by YouTube Music. Supported file types are ' +
            supportedFiletypes.join(', ')
        );
      }
      const headers: any = this._headers;
      let uploadUrl = `https://upload.youtube.com/upload/usermusic/http?authuser=${headers['x-goog-authuser']}`;
      const filesize = statSync(filepath).size;
      const body = 'filename=' + utf8.encode(basename(filepath));
      delete headers['content-encoding'];
      headers['content-type'] =
        'application/x-www-form-urlencoded;charset=utf-8';
      headers['X-Goog-Upload-Command'] = 'start';
      headers['X-Goog-Upload-Header-Content-Length'] = filesize;
      headers['X-Goog-Upload-Protocol'] = 'resumable';
      const response = await axios.post(uploadUrl, body, {
        headers: headers,
        proxy: this._proxies,
      });
      headers['X-Goog-Upload-Command'] = 'upload, finalize';
      headers['X-Goog-Upload-Offset'] = '0';
      uploadUrl =
        response.headers['X-Goog-Upload-URL'] ??
        response.headers['x-goog-upload-url'];
      const data = readFileSync(filepath);
      const response2: any = await axios.post(uploadUrl, data, {
        headers: headers,
        proxy: this._proxies,
      });
      if (response2.status == 200) {
        return 'STATUS_SUCCEEDED';
      } else {
        return response2;
      }
    }

    /**
     * Deletes a previously uploaded song or album.
     * @param entityId The entity id of the uploaded song or album,
     * e.g. retrieved from `getLibraryUploadSongs`
     * @return Status String or error.
     */
    async deleteUploadEntity(
      entityId: string
    ): Promise<'STATUS_SUCCEEDED' | Record<string, any>> {
      this._checkAuth();
      const endpoint = 'music/delete_privately_owned_entity';
      if (entityId.includes('FEmusic_library_privately_owned_release_detail')) {
        entityId = entityId.replace(
          'FEmusic_library_privately_owned_release_detail',
          ''
        );
      }

      const body = { entityId: entityId };
      const response = await this._sendRequest(endpoint, body);

      if (!response['error']) {
        return 'STATUS_SUCCEEDED';
      } else {
        return response['error'];
      }
    }
  };
};
