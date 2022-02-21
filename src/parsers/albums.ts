import {
  HEADER_DETAIL,
  MENU,
  NAVIGATION_PLAYLIST_ID,
  NAVIGATION_WATCH_PLAYLIST_ID,
  SUBTITLE,
  THUMBNAIL_CROPPED,
  TITLE_TEXT,
} from '.';
import { toInt } from '../helpers';
import { parseLikeStatus, parseSongRuns } from './songs';
import { nav } from './utils';

export function parseAlbumHeader(response: any): any {
  const header = nav(response, HEADER_DETAIL);
  let album: Record<string, any> = {
    title: nav(header, TITLE_TEXT),
    type: nav(header, SUBTITLE),
    thumbnails: nav(header, THUMBNAIL_CROPPED),
  };
  if ('description' in header) {
    album['description'] = header['description']['runs'][0]['text'];
  }

  const albumInfo = parseSongRuns(header['subtitle']['runs'].slice(2));
  album = { ...album, albumInfo };

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
    true
  );
  if (!album['audioPlaylistId']) {
    album['audioPlaylistId'] = nav(
      toplevel,
      [0, 'buttonRenderer', ...NAVIGATION_PLAYLIST_ID],
      true
    );
  }
  const service = nav(
    toplevel,
    [1, 'buttonRenderer', 'defaultServiceEndpoint'],
    true
  );
  if (service) {
    album['likeStatus'] = parseLikeStatus(service);
  }

  return album;
}
