import {
  HEADER_DETAIL,
  MENU,
  NAVIGATION_PLAYLIST_ID,
  NAVIGATION_WATCH_PLAYLIST_ID,
  SUBTITLE,
  THUMBNAIL_CROPPED,
  TITLE_TEXT,
  nav,
} from '.';
import { toInt } from '../helpers';
import { parseLikeStatus, parseSongRuns } from './songs';
import * as parser_aT from './albums.types';

export function parseAlbumHeader(
  response: any
): parser_aT.parseAlbumHeaderReturn {
  const header = nav(response, HEADER_DETAIL);
  let album: parser_aT.parseAlbumHeaderReturn = {
    title: nav(header, TITLE_TEXT),
    type: nav(header, SUBTITLE),
    thumbnails: nav(header, THUMBNAIL_CROPPED),
  } as any;
  if ('description' in header) {
    album['description'] = header['description']['runs'][0]['text'];
  }

  const albumInfo = parseSongRuns(header['subtitle']['runs'].slice(2));
  album = { ...album, ...albumInfo };

  if (header['secondSubtitle']['runs'].length > 1) {
    album['trackCount'] = toInt(header['secondSubtitle']['runs'][0]['text']);
    album['duration'] = header['secondSubtitle']['runs'][2]['text'];
  } else {
    album['duration'] = header['secondSubtitle']['runs'][0]['text'];
  }

  // add to library/uploaded
  const menu = nav(header, MENU);
  const toplevel = menu['topLevelButtons'];
  album['audioPlaylistId'] = nav(
    toplevel,
    [0, 'buttonRenderer', ...NAVIGATION_WATCH_PLAYLIST_ID],
    null
  );
  if (!album['audioPlaylistId']) {
    album['audioPlaylistId'] = nav(
      toplevel,
      [0, 'buttonRenderer', ...NAVIGATION_PLAYLIST_ID],
      null
    );
  }
  const service = nav(
    toplevel,
    [1, 'buttonRenderer', 'defaultServiceEndpoint'],
    null
  );
  if (service) {
    album['likeStatus'] = parseLikeStatus(service);
  }

  return album;
}
