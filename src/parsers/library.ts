import {
  SINGLE_COLUMN_TAB,
  SECTION_LIST,
  ITEM_SECTION,
  MTRIR,
  NAVIGATION_BROWSE_ID,
  SUBTITLE,
  SUBTITLE2,
  SUBTITLE3,
  THUMBNAIL_RENDERER,
  TITLE,
  TITLE_TEXT,
  GRID,
  MRLIR,
  THUMBNAILS,
  findObjectByKey,
  nav,
  SECTION_LIST_ITEM,
  MUSIC_SHELF,
  MENU_PLAYLIST_ID,
} from '.';
import { isDigit } from '../pyLibraryMock';
import { parsePlaylistItems } from './playlists';
import { getItemText, parseMenuPlaylists } from './utils';
import * as parser_lt from './library.types';
import { getContinuations } from '../continuations';

export function parseArtists(results: any, uploaded = false): Array<any> {
  const artists: Array<any> = [];
  for (const result of results) {
    const data = result[MRLIR];
    const artist: Record<string, any> = {};
    artist['browseId'] = nav(data, NAVIGATION_BROWSE_ID);
    artist['artist'] = getItemText(data, 0);
    parseMenuPlaylists(data, artist);
    if (uploaded) {
      artist['songs'] = getItemText(data, 1)?.split(' ')[0];
    } else {
      const subtitle = getItemText(data, 1);
      if (subtitle) {
        artist['subscribers'] = subtitle.split(' ')[0];
      }
    }

    artist['thumbnails'] = nav(data, THUMBNAILS, null);
    artists.push(artist);
  }

  return artists;
}

export async function parseLibraryAlbums(
  response: any,
  requestFunc: any,
  limit?: number | null
): Promise<any> {
  const results = getLibraryContents(response, GRID);
  if (!results) {
    return [];
  }
  let albums = parseAlbums(results['items']);

  if ('continuations' in results) {
    const parseFunc = (contents: any): any => parseAlbums(contents);
    const remainingLimit = limit == null ? null : limit - albums.length;
    albums = [
      ...albums,
      ...(await getContinuations(
        results,
        'gridContinuation',
        remainingLimit,
        requestFunc,
        parseFunc
      )),
    ];
  }

  return albums;
}

export function parseAlbums(results: any): parser_lt.parseAlbumsReturn {
  const albums = [];
  for (const result of results) {
    const data = result[MTRIR];
    const album: parser_lt.parseAlbumsReturn[number] = {} as any;
    album['browseId'] = nav(data, [...TITLE, ...NAVIGATION_BROWSE_ID]);
    album['playlistId'] = nav(data, MENU_PLAYLIST_ID, null) ?? undefined;
    album['title'] = nav(data, TITLE_TEXT);
    album['thumbnails'] = nav(data, THUMBNAIL_RENDERER);

    if ('runs' in data['subtitle']) {
      const runCount = data['subtitle']['runs'].length;
      let hasArtists = false;
      if (runCount == 1) {
        album['year'] = nav(data, SUBTITLE);
      } else {
        album['type'] = nav(data, SUBTITLE);
      }

      if (runCount == 3) {
        if (isDigit(nav(data, SUBTITLE2))) {
          album['year'] = nav(data, SUBTITLE2);
        } else {
          hasArtists = true;
        }
      } else if (runCount > 3) {
        album['year'] = nav(data, SUBTITLE3);
        hasArtists = true;
      }

      if (hasArtists) {
        const subtitle = data['subtitle']['runs'][2];
        album['artists'] = [];
        album['artists'].push({
          name: subtitle['text'],
          id: nav(subtitle, NAVIGATION_BROWSE_ID, null),
        });
      }
    }
    albums.push(album);
  }
  return albums;
}

export async function parseLibraryArtists(
  response: any,
  requestFunc: (arg1: any) => Promise<Record<string, any>>,
  limit?: number | null
): Promise<parser_lt.parseLibraryArtistsReturn> {
  const results = getLibraryContents(response, MUSIC_SHELF);
  if (!results) {
    return [];
  }
  let artists = parseArtists(results['contents']);

  if (results['continuations']) {
    const parseFunc = (contents: any): any => parseArtists(contents);
    const remainingLimit = limit == null ? null : limit - artists.length;
    artists = [
      ...artists,
      ...(await getContinuations(
        results,
        'musicShelfContinuation',
        remainingLimit,
        requestFunc,
        parseFunc
      )),
    ];
  }
  return artists;
}

export function parseLibrarySongs(
  response: any
): parser_lt.parseLibarySongsReturn {
  const results = getLibraryContents(response, MUSIC_SHELF);
  return {
    results: results,
    parsed: parsePlaylistItems(results['contents'].slice(1)),
  };
}

export function getLibraryContents(
  response: any,
  renderer: Readonly<(number | string)[]>
): null | any {
  const contents = nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST], true);
  if (!contents) {
    // empty library
    return null;
  }
  const results = findObjectByKey(contents, 'itemSectionRenderer');
  if (!results) {
    return nav(
      response,
      [...SINGLE_COLUMN_TAB, ...SECTION_LIST_ITEM, renderer],
      true
    );
  } else {
    return nav(results, [...ITEM_SECTION, ...renderer]);
  }
}
