//This file is functionally complete (except for locales)
import { re } from '../pyLibraryMock';
import {
  MRLIR,
  NAVIGATION_VIDEO_ID,
  NAVIGATION_PLAYLIST_ID,
  MENU_ITEMS,
  TOGGLE_MENU,
  NAVIGATION_BROWSE_ID,
  PLAY_BUTTON,
  BADGE_LABEL,
  THUMBNAILS,
  CAROUSEL_TITLE,
  CAROUSEL,
  MTRIR,
  SUBTITLE,
  SUBTITLE2,
  THUMBNAIL_RENDERER,
  TITLE,
  TITLE_TEXT,
  NAVIGATION_BROWSE,
  PAGE_TYPE,
  TEXT_RUN,
  TEXT_RUNS,
  TEXT_RUN_TEXT,
} from './index';
import {
  parseSongArtistsRuns,
  parseSongMenuTokens,
  parseSongRuns,
} from './songs';
import {
  findObjectByKey,
  getDotSeperatorIndex,
  getFlexColumnItem,
  getItemText,
  nav,
  parseMenuPlaylists,
} from './utils';
import * as bT from '../mixins/browsing.types';
import * as parser_bT from './browsing.types';
import _ from 'i18next';
import { Filter } from '../types';

export class Parser {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  parseSearchResults(
    results: bT.parseResults,
    resultType:
      | bT.resultType
      | bT.parseSearchResultsAdditionalResultTypes
      | null,
    category: Filter | undefined
  ): Array<any> {
    const searchResults: Array<any> = [];
    const defaultOffset = !resultType ? 2 : 0;
    for (const result of results) {
      const data = result[MRLIR];
      let searchResult: Record<string, any> = { category: category };
      if (!resultType) {
        resultType =
          (getItemText(data, 1)?.toLowerCase() as bT.resultType) ?? null;
        const resultTypes: bT.resultTypes = [
          'artist',
          'playlist',
          'song',
          'video',
          'station',
        ];
        const resultTypesLocal = [
          _.t('artist'),
          _.t('playlist'),
          _.t('song'),
          _.t('video'),
          _.t('station'),
        ];
        // default to album since it's labeled with multiple values ('Single', 'EP', etc.)
        if (resultType && !resultTypesLocal.includes(resultType)) {
          resultType = 'album';
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resultType = resultTypes[resultTypesLocal.indexOf(resultType!)];
        }
      }
      searchResult['resultType'] = resultType;

      if (resultType != 'artist') {
        searchResult['title'] = getItemText(data, 0);
      }

      if (resultType == 'artist') {
        searchResult['artist'] = getItemText(data, 0);
        parseMenuPlaylists(data, searchResult);
      } else if (resultType == 'album') {
        searchResult['type'] = getItemText(data, 1);
      } else if (resultType == 'playlist') {
        const flexItem = getFlexColumnItem(data, 1)?.['text']['runs'];
        const hasAuthor = flexItem?.length == defaultOffset + 3;
        searchResult['itemCount'] =
          flexItem &&
          nav<typeof flexItem, [number, 'text']>(flexItem, [
            defaultOffset + (hasAuthor ? 2 : 0),
            'text',
          ]).split(' ')[0];
        searchResult['author'] = !hasAuthor
          ? null
          : nav(flexItem, [defaultOffset, 'text']);
      } else if (resultType == 'station') {
        searchResult['videoId'] = nav(data, NAVIGATION_VIDEO_ID);
        searchResult['playlistId'] = nav(data, NAVIGATION_PLAYLIST_ID);
      } else if (resultType == 'song') {
        searchResult['album'] = null;
        if ('menu' in data) {
          const toggleMenu = findObjectByKey(
            nav<any>(data, MENU_ITEMS, null), //@codyduong this isn't nullable in the py library? todo discovery why...
            TOGGLE_MENU
          );
          if (toggleMenu) {
            searchResult['feedbackTokens'] = parseSongMenuTokens(toggleMenu);
          }
        }
      } else if (resultType == 'video') {
        searchResult['views'] = null;
      } else if (resultType == 'upload') {
        const browseId = nav(data, NAVIGATION_BROWSE_ID, null);
        if (!browseId) {
          // song result
          const flexItems = [0, 1].map((i) =>
            nav<any>(getFlexColumnItem(data, i), ['text', 'runs'], null)
          );

          if (flexItems[0]) {
            searchResult['videoId'] = nav(
              flexItems[0][0],
              NAVIGATION_VIDEO_ID,
              null
            );
            searchResult['playlistId'] = nav(
              flexItems[0][0],
              NAVIGATION_PLAYLIST_ID,
              null
            );
          }
          if (flexItems[1]) {
            searchResult = { ...searchResult, ...parseSongRuns(flexItems[1]) };
          }
          searchResult['resultType'] = 'song';
        } else {
          //artist or album result
          searchResult['browseId'] = browseId;
          if (searchResult['browseId'].includes('artist')) {
            searchResult['resultType'] = 'artist';
          } else {
            const flexItem2 = getFlexColumnItem(data, 1);
            // const runs = [
            //     run['text'] for i, run in enumerate(flex_item2['text']['runs'])
            //     if i % 2 == 0
            // ]
            const runs = flexItem2?.['text']['runs'].map((value, index) => {
              if (index % 2 == 0) {
                return value['text'];
              }
            });
            if (runs && runs.length > 1) {
              searchResult['artist'] = runs[1];
            }
            if (runs && runs.length > 2) {
              //# date may be missing
              searchResult['releaseDate'] = runs[2];
            }
            searchResult['resultType'] = 'album';
          }
        }
      }

      if (['song', 'video'].includes(resultType)) {
        searchResult['videoId'] = nav(
          data,
          [
            ...PLAY_BUTTON,
            'playNavigationEndpoint',
            'watchEndpoint',
            'videoId',
          ],
          null
        );
      }

      if (['song', 'video', 'album'].includes(resultType)) {
        searchResult['duration'] = null;
        searchResult['year'] = null;
        const hasOffset =
          resultType == 'album' || (defaultOffset && !!searchResult['videoId']);
        const flexItem = getFlexColumnItem(data, 1);
        const runs = flexItem?.['text']['runs'].slice(hasOffset ? 2 : 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const songInfo = parseSongRuns(runs!);
        searchResult = { ...searchResult, ...songInfo };
      }

      if (['artist', 'album', 'playlist'].includes(resultType)) {
        searchResult['browseId'] = nav(data, NAVIGATION_BROWSE_ID, null);
        if (!searchResult['browseId']) continue;
      }

      if (['song', 'album'].includes(resultType))
        searchResult['isExplicit'] = nav(data, BADGE_LABEL, null) != null;

      searchResult['thumbnails'] = nav(data, THUMBNAILS, null);
      searchResults.push(searchResult);
    }
    return searchResults;
  }

  parseArtistContents(
    results: bT.getArtistResults
  ): parser_bT.parseArtistContentsReturn {
    const categories: ['albums', 'singles', 'videos', 'playlists', 'related'] =
      ['albums', 'singles', 'videos', 'playlists', 'related'];
    const categories_local = [
      _.t('albums'),
      _.t('singles'),
      _.t('videos'),
      _.t('playlists'),
      _.t('related'),
    ];
    const categories_parser: any[] = [
      parseAlbum,
      parseSingle,
      parseVideo,
      parsePlaylist,
      parseRelatedArtist,
    ];
    const artist: parser_bT.parseArtistContentsReturn = {} as any;
    categories.forEach((category, i) => {
      const data = results
        .map((r) => {
          if (
            r['musicCarouselShelfRenderer'] &&
            nav(r, [...CAROUSEL, ...CAROUSEL_TITLE])['text'].toLowerCase() ==
              categories_local[i]
          )
            return r['musicCarouselShelfRenderer'];
        })
        .filter((x) => x);
      if (data[0]) {
        //@ts-expect-error: We set this later in flow
        artist[category] = { browseId: null, results: [] };
        if ('navigationEndpoint' in nav(data[0], CAROUSEL_TITLE)) {
          artist[category]['browseId'] = nav(data[0], [
            ...CAROUSEL_TITLE,
            ...NAVIGATION_BROWSE_ID,
          ]);
          if (['albums', 'singles', 'playlists'].includes(category)) {
            //@ts-expect-error: TS Control Flow Discrimination fails here :(
            artist[category].params = nav(data[0], CAROUSEL_TITLE)[
              'navigationEndpoint'
            ]['browseEndpoint']['params'];
          }
        }

        //@ts-expect-error: It tries it's best LOL.
        artist[category]['results'] = parseContentList(
          data[0]['contents'],
          categories_parser[i]
        );
      }
    });

    return artist;
  }

  parseHome(rows: any): parser_bT.parseHomeReturn {
    const items: parser_bT.parseHomeReturn = [];
    for (const row of rows) {
      const contents = [];
      let results;
      if (row[CAROUSEL[0]]) {
        results = nav(row, CAROUSEL);
      } else if ('musicImmersiveCarouselShelfRenderer' in row) {
        results = row['musicImmersiveCarouselShelfRenderer'];
      } else {
        continue;
      }
      for (const result of results['contents']) {
        let data = nav(result, [MTRIR], null);
        let content: parser_bT.parseHomeReturn[number]['contents'][number] =
          {} as any;
        if (data) {
          const page_type = nav(
            data,
            [...TITLE, ...NAVIGATION_BROWSE, ...PAGE_TYPE],
            null
          );
          if (!page_type) {
            content = parseSong(data);
          } else if (page_type == 'MUSIC_PAGE_TYPE_ALBUM') {
            content = parseAlbum(data);
          } else if (page_type == 'MUSIC_PAGE_TYPE_ARTIST') {
            content = parseRelatedArtist(data);
          } else if (page_type == 'MUSIC_PAGE_TYPE_PLAYLIST') {
            content = parsePlaylist(data);
          }
        } else {
          data = nav(result, [MRLIR]);
          const columns: any[] = [];
          for (let i = 0; i < data['flexColumns'].length; i++) {
            columns.push(getFlexColumnItem(data, i));
          }
          content = {
            title: nav(columns[0], TEXT_RUN_TEXT),
            videoId: nav(columns[0], [...TEXT_RUN, ...NAVIGATION_VIDEO_ID]),
            thumbnails: nav(data, THUMBNAILS) as bT.thumbnails,
            ...parseSongRuns(nav(columns[1], TEXT_RUNS)),
          };
          if (columns.length > 2 && columns[2]) {
            content['album'] = {
              title: nav(columns[2], TEXT_RUN_TEXT),
              browseId: nav(columns[2], [...TEXT_RUN, ...NAVIGATION_BROWSE_ID]),
            };
          }
        }
        Object.keys(content).length > 0 && contents.push(content);
      }
      items.push({
        title: nav(results, [...CAROUSEL_TITLE, 'text']),
        contents: contents,
      });
    }
    return items;
  }
}

export function parseContentList<T>(
  results: Array<Record<string, any>>,
  parse_func: (arg0: any) => T,
  key: string = MTRIR
): Array<T> {
  const contents = [];
  for (const result of results) {
    contents.push(parse_func(result[key]));
  }

  return contents;
}

export function parseAlbum(result: any): parser_bT.parseAlbumReturn {
  return {
    title: nav(result, TITLE_TEXT, null), //@codyduong this isn't nullable in the py library? todo discovery why...
    year: nav(result, SUBTITLE2, null),
    browseId: nav(result, [...TITLE, ...NAVIGATION_BROWSE_ID]),
    thumbnails: nav(result, THUMBNAIL_RENDERER),
  };
}

export function parseSingle(result: any): parser_bT.parseSingleReturn {
  return {
    title: nav(result, TITLE_TEXT),
    year: nav(result, SUBTITLE, null),
    browseId: nav(result, [...TITLE, ...NAVIGATION_BROWSE_ID]),
    thumbnails: nav(result, THUMBNAIL_RENDERER),
  };
}

export function parseSong(result: any): parser_bT.parseSongReturn {
  return {
    title: nav(result, TITLE_TEXT),
    videoId: nav(result, NAVIGATION_VIDEO_ID),
    playlistId: nav(result, NAVIGATION_PLAYLIST_ID, null),
    thumbnails: nav(result, THUMBNAIL_RENDERER),
    ...parseSongRuns(result['subtitle']['runs']),
  };
}

export function parseVideo(result: {
  [x: string]: { [x: string]: any };
}): parser_bT.parseVideoReturn {
  const runs: Array<Record<string, any>> = result['subtitle']['runs'];
  const artistsLen = getDotSeperatorIndex(runs);
  const video: parser_bT.parseVideoReturn = {
    title: nav(result, TITLE_TEXT),
    videoId: nav(result, NAVIGATION_VIDEO_ID),
    artists: parseSongArtistsRuns(runs.slice(0, artistsLen)),
    playlistId: nav(result, NAVIGATION_PLAYLIST_ID, null),
    thumbnails: nav(result, THUMBNAIL_RENDERER, null),
  };
  video['views'] = runs[runs.length - 1]['text'].split(' ')[0];
  return video;
}

export function parsePlaylist(data: {
  [x: string]: { [x: string]: any };
}): parser_bT.parsePlaylistReturn {
  const playlist: parser_bT.parsePlaylistReturn = {
    title: nav(data, TITLE_TEXT),
    playlistId: nav(data, [...TITLE, ...NAVIGATION_BROWSE_ID]).slice(2),
    thumbnails: nav(data, THUMBNAIL_RENDERER),
  };
  const subtitle = data['subtitle'];
  if ('runs' in subtitle) {
    //[run['text'] for run in subtitle['runs']]
    const runText = subtitle['runs'].map((run: any) => run['text']);
    playlist['description'] = runText.join('');
    if (
      subtitle['runs'].length == 3 &&
      re.search(/\d+ /, nav(data, SUBTITLE2))
    ) {
      playlist['count'] = nav(data, SUBTITLE2).split(' ')[0];
      playlist['author'] = parseSongArtistsRuns(subtitle['runs'].slice(0, 1));
    }
  }

  return playlist;
}

export function parseRelatedArtist(
  data: any
): parser_bT.parseRelatedArtistReturn {
  let subscribers = nav(data, SUBTITLE, null);
  if (subscribers) {
    subscribers = subscribers.split(' ')[0];
  }
  return {
    title: nav(data, TITLE_TEXT),
    browseId: nav(data, [...TITLE, ...NAVIGATION_BROWSE_ID]),
    subscribers: subscribers,
    thumbnails: nav(data, THUMBNAIL_RENDERER),
  };
}
