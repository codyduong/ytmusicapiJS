import { nav } from '@codyduong/nav';
import { SECTION_LIST, MUSIC_SHELF, TITLE_TEXT } from '../parsers';
import { getSearchParams } from '../parsers/searchParams';
import { getContinuations } from '../parsers/continuations';
import { Scope, Filter, FilterSingular } from '../types';
import { _YTMusic } from '../ytmusic';
import { GConstructor, Mixin } from './.mixin.helper';
import * as st from './search.types';

export type SearchMixin = Mixin<typeof SearchMixin>;

/**
 * @module Search
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const SearchMixin = <TBase extends GConstructor<_YTMusic>>(
  Base: TBase
) => {
  return class Search extends Base {
    /**
     * Search YouTube music.
     * Returns results within the provided category.
     * @param {string} query Query string, i.e. 'Oasis Wonderwall'
     * @param {options} [options=]
     * @param {'songs'|'videos'|'albums'|'artists'|'playlists'|'community_playlists'|'featured_playlists'} [options.filter=] Filter for item types.
     *    @default: Default search, including all types of items.
     * @param {'libary'|'uploads'} [options.scope=] Search scope.
     *    @default: Search the public YouTube Music catalogue.
     * @param {number} [options.limit=20] Number of search results to return
     * @param {boolean} [ignoreSpelling=false] Whether to ignore YTM spelling suggestions.
     * If true, the exact search term will be searched for, and will not be corrected.
     * This does not have any effect when the filter is set to ``uploads``.
     * Default: false, will use YTM's default behavior of autocorrecting the search.
     * @return List of results depending on filter.
     * resultType specifies the type of item (important for default search).
     * albums, artists and playlists additionally contain a browseId, corresponding to
     * albumId, channelId and playlistId (browseId=``VL``+playlistId)
     * @example <caption> list for default search with one result per resultType for brevity. Normally
     * there are 3 results per resultType and an additional ``thumbnails`` key. </caption>
     * [
     *   {
     *     "category": "Top result",
     *     "resultType": "video",
     *     "videoId": "vU05Eksc_iM",
     *     "title": "Wonderwall",
     *     "artists": [
     *       {
     *         "name": "Oasis",
     *         "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
     *       }
     *     ],
     *     "views": "1.4M",
     *     "duration": "4:38",
     *     "duration_seconds": 278
     *   },
     *   {
     *     "category": "Songs",
     *     "resultType": "song",
     *     "videoId": "ZrOKjDZOtkA",
     *     "title": "Wonderwall",
     *     "artists": [
     *       {
     *         "name": "Oasis",
     *         "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
     *       }
     *     ],
     *     "album": {
     *       "name": "(What's The Story) Morning Glory? (Remastered)",
     *       "id": "MPREb_9nqEki4ZDpp"
     *     },
     *     "duration": "4:19",
     *     "duration_seconds": 259
     *     "isExplicit": false,
     *     "feedbackTokens": {
     *       "add": null,
     *       "remove": null
     *     }
     *   },
     *   {
     *     "category": "Albums",
     *     "resultType": "album",
     *     "browseId": "MPREb_9nqEki4ZDpp",
     *     "title": "(What's The Story) Morning Glory? (Remastered)",
     *     "type": "Album",
     *     "artist": "Oasis",
     *     "year": "1995",
     *     "isExplicit": false
     *   },
     *   {
     *     "category": "Community playlists",
     *     "resultType": "playlist",
     *     "browseId": "VLPLK1PkWQlWtnNfovRdGWpKffO1Wdi2kvDx",
     *     "title": "Wonderwall - Oasis",
     *     "author": "Tate Henderson",
     *     "itemCount": "174"
     *   },
     *   {
     *     "category": "Videos",
     *     "resultType": "video",
     *     "videoId": "bx1Bh8ZvH84",
     *     "title": "Wonderwall",
     *     "artists": [
     *       {
     *         "name": "Oasis",
     *         "id": "UCmMUZbaYdNH0bEd1PAlAqsA"
     *       }
     *     ],
     *     "views": "386M",
     *     "duration": "4:38",
     *     "duration_seconds": 278
     *   },
     *   {
     *     "category": "Artists",
     *     "resultType": "artist",
     *     "browseId": "UCmMUZbaYdNH0bEd1PAlAqsA",
     *     "artist": "Oasis",
     *     "shuffleId": "RDAOkjHYJjL1a3xspEyVkhHAsg",
     *     "radioId": "RDEMkjHYJjL1a3xspEyVkhHAsg"
     *   }
     * ]
     */
    async search(
      query: string,
      options?: {
        filter?: undefined;
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'null'>>;
    async search(
      query: string,
      options?: {
        filter?: 'songs';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'songs'>>;
    async search(
      query: string,
      options?: {
        filter?: 'videos';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'videos'>>;
    async search(
      query: string,
      options?: {
        filter?: 'albums';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'albums'>>;
    async search(
      query: string,
      options?: {
        filter?: 'artists';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'artists'>>;
    async search(
      query: string,
      options?: {
        filter?: 'playlists';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'playlists'>>;
    async search(
      query: string,
      options?: {
        filter?: 'community_playlists';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'community_playlists'>>;
    async search(
      query: string,
      options?: {
        filter?: 'featured_playlists';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'featured_playlists'>>;
    async search(
      query: string,
      options?: {
        filter?: 'uploads';
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<'uploads'>>;
    async search<T extends Filter | 'null' = 'null'>(
      query: string,
      options?: {
        filter?: Exclude<Filter, 'null'>;
        scope?: Scope;
        limit?: number;
        ignoreSpelling?: boolean;
      }
    ): Promise<st.searchReturn<T>> {
      const _options = options ?? {};
      let { filter } = _options;
      const { scope, limit = 20, ignoreSpelling } = _options;
      const body: Record<string, any> = { query: query };
      const endpoint = 'search';
      let searchResults: st.searchReturn<T> = [];
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

      const response = await this._sendRequest<st.searchResponse>(
        endpoint,
        body
      );

      // no results
      if (!response['contents']) {
        return searchResults;
      }

      let results: st.searchResults;
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

      const resultsNav = nav(results, SECTION_LIST);

      // no results
      if (
        !resultsNav ||
        (resultsNav.length == 1 && 'itemSectionRenderer' in resultsNav)
      ) {
        return searchResults;
      }

      //set filter for parser
      if (filter && filter.split('_').includes('playlists')) {
        filter = 'playlists';
      } else if (scope == 'uploads') {
        filter = 'uploads';
      }

      for (const res of resultsNav) {
        if ('musicShelfRenderer' in res) {
          const resultsMusicShelfContents =
            res['musicShelfRenderer']['contents'];
          const original_filter = filter;
          const category = nav(res, [...MUSIC_SHELF, ...TITLE_TEXT], null);
          if (!filter && scope == scopes[0]) {
            filter = category;
          }

          const type: FilterSingular | null = filter
            ? (filter.slice(undefined, -1).toLowerCase() as FilterSingular)
            : null;
          searchResults = [
            ...searchResults,
            ...this._parser.parseSearchResults(
              resultsMusicShelfContents,
              type,
              category as any
            ),
          ];
          filter = original_filter;

          if ('continuations' in res['musicShelfRenderer']) {
            const requestFunc = async (
              additionalParams: string
            ): Promise<Record<string, any>> =>
              await this._sendRequest(endpoint, body, additionalParams);

            const parseFunc = (contents: any): Record<string, any> =>
              this._parser.parseSearchResults(contents, type, category as any);

            searchResults = [
              ...searchResults,
              ...(await getContinuations(
                res['musicShelfRenderer'],
                'musicShelfContinuation',
                limit - searchResults.length,
                requestFunc,
                parseFunc
              )),
            ];
          }
        }
      }

      return searchResults;
    }
  };
};
