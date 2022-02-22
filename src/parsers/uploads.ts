import {
  MENU_ITEMS,
  MENU_LIKE_STATUS,
  MENU_SERVICE,
  MRLIR,
  THUMBNAILS,
} from '.';
import { parseDuration } from '../helpers';
import { parseSongAlbum, parseSongArtists } from './songs';
import { getFixedColumnItem, getItemText, nav } from './utils';

export function parseUploadedItems(results: any): any {
  const songs = [];
  for (const result of results) {
    const data = result[MRLIR];
    if (!data['menu']) {
      continue;
    }
    const entityId = nav(data, MENU_ITEMS)[-1]['menuNavigationItemRenderer'][
      'navigationEndpoint'
    ]['confirmDialogEndpoint']['content']['confirmDialogRenderer'][
      'confirmButton'
    ]['buttonRenderer']['command']['musicDeletePrivatelyOwnedEntityCommand'][
      'entityId'
    ];

    const videoId = nav(data, [...MENU_ITEMS, [0], ...MENU_SERVICE])[
      'queueAddEndpoint'
    ]['queueTarget']['videoId'];

    const title = getItemText(data, 0);
    const like = nav(data, MENU_LIKE_STATUS);
    const thumbnails = 'thumbnail' in data ? nav(data, THUMBNAILS) : null;
    const duration = getFixedColumnItem(data, 0)['text']['runs'][0]['text'];
    const song = {
      entityId: entityId,
      videoId: videoId,
      title: title,
      duration: duration,
      duration_seconds: parseDuration(duration),
      artists: parseSongArtists(data, 1),
      album: parseSongAlbum(data, 2),
      likeStatus: like,
      thumbnails: thumbnails,
    };

    songs.push(song);
  }
}
