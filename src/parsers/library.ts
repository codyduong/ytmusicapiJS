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
} from '.';
import { parsePlaylistItems } from './playlists';
import {
  findObjectByKey,
  getContinuations,
  getItemText,
  nav,
  parseMenuPlaylists,
} from './utils';

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

    artist['thumbnails'] = nav(data, THUMBNAILS, true);
    artists.push(artist);
  }

  return artists;
}

export async function parseLibraryAlbums(
  response: any,
  requestFunc: any,
  limit: number
): Promise<any> {
  let results = findObjectByKey(
    nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]),
    'itemSectionRenderer'
  );
  results = nav(results, ITEM_SECTION);
  if (!results['gridRenderer']) {
    return [];
  }
  results = nav(results, GRID);
  const albums = parseAlbums(results['items']);

  if (results['continuations']) {
    const parseFunc = (contents: any): any => parseAlbums(contents);
    albums.extend(
      await getContinuations(
        results,
        'gridContinuation',
        limit - albums.length,
        requestFunc,
        parseFunc
      )
    );
  }

  return albums;
}

export function parseAlbums(results: any): any {
  const albums = [];
  for (const result of results) {
    const data = result[MTRIR];
    const album: Record<string, any> = {};
    album['browseId'] = nav(data, [...TITLE, ...NAVIGATION_BROWSE_ID]);
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
        if (nav(data, SUBTITLE2).isdigit()) {
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
          id: nav(subtitle, NAVIGATION_BROWSE_ID, true),
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
  limit: number
): Promise<any> {
  let results = findObjectByKey(
    nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]),
    'itemSectionRenderer'
  );
  results = nav(results, ITEM_SECTION);
  if (!results['musicShelfRenderer']) return [];
  results = results['musicShelfRenderer'];
  let artists = parseArtists(results['contents']);

  if (results['continuations']) {
    const parseFunc = (contents: any): any => parseArtists(contents);
    artists = [
      ...artists,
      ...(await getContinuations(
        results,
        'musicShelfContinuation',
        limit - artists.length,
        requestFunc,
        parseFunc
      )),
    ];
  }
  return artists;
}

export function parseLibrarySongs(response: any): any {
  let results = findObjectByKey(
    nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]),
    'itemSectionRenderer'
  );
  results = nav(results, ITEM_SECTION);
  const songs: Record<string, any> = { results: [], parsed: [] };
  if (results['musicShelfRenderer']) {
    songs['results'] = results['musicShelfRenderer'];
    songs['parsed'] = parsePlaylistItems(songs['results']['contents'].slice(1));
  }
  return songs;
}
