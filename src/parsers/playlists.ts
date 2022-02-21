import {
  MRLIR,
  MENU_ITEMS,
  MENU_SERVICE,
  TOGGLE_MENU,
  PLAY_BUTTON,
  MENU_LIKE_STATUS,
  THUMBNAILS,
  BADGE_LABEL,
} from '.';
import { parseDuration } from '../helpers';
import { parseSongAlbum, parseSongArtists, parseSongMenuTokens } from './songs';
import { getFixedColumnItem, getItemText, nav } from './utils';

export function parsePlaylistItems(
  results: any,
  menuEntries?: Array<any> | null | undefined
): any {
  const songs = [];
  let count = 1;
  for (const result of results) {
    count += 1;
    if (!result[MRLIR]) {
      continue;
    }
    const data = result[MRLIR];

    try {
      let [videoId, setVideoId, like, feedbackTokens] = Array(4).fill(null);

      // if the item has a menu, find its setVideoId
      if (data['menu']) {
        for (const item of nav(data, MENU_ITEMS)) {
          if (item['menuServiceItemRenderer']) {
            const menuService = nav(item, MENU_SERVICE);
            if ('playlistEditEndpoint' in menuService) {
              setVideoId =
                menuService['playlistEditEndpoint']['actions'][0]['setVideoId'];
              videoId =
                menuService['playlistEditEndpoint']['actions'][0][
                  'removedVideoId'
                ];
            }
          }
          if (TOGGLE_MENU in item) {
            feedbackTokens = parseSongMenuTokens(item);
          }
        }
      }
      // if item is not playable, the videoId was retrieved above
      if ('playNavigationEndpoint' in nav(data, PLAY_BUTTON)) {
        videoId = nav(data, PLAY_BUTTON)['playNavigationEndpoint'][
          'watchEndpoint'
        ]['videoId'];

        if (data['menu']) {
          like = nav(data, MENU_LIKE_STATUS, true);
        }
      }
      const title = getItemText(data, 0);
      if (title == 'Song deleted') continue;

      const artists = parseSongArtists(data, 1);

      const album = parseSongAlbum(data, 2);

      let duration = null;
      if (data['fixedColumns']) {
        if ('simpleText' in getFixedColumnItem(data, 0)['text']) {
          duration = getFixedColumnItem(data, 0)['text']['simpleText'];
        } else {
          duration = getFixedColumnItem(data, 0)['text']['runs'][0]['text'];
        }
      }
      let thumbnails = null;
      if (data['thumbnail']) {
        thumbnails = nav(data, THUMBNAILS);
      }

      let isAvailable = true;
      if (data['musicItemRendererDisplayPolicy']) {
        isAvailable =
          data['musicItemRendererDisplayPolicy'] !=
          'MUSIC_ITEM_RENDERER_DISPLAY_POLICY_GREY_OUT';
      }

      const isExplicit = !!nav(data, BADGE_LABEL, true);

      const song: Record<string, any> = {
        videoId: videoId,
        title: title,
        artists: artists,
        album: album,
        likeStatus: like,
        thumbnails: thumbnails,
        isAvailable: isAvailable,
        isExplicit: isExplicit,
      };
      if (duration) {
        song['duration'] = duration;
        song['duration_seconds'] = parseDuration(duration);
      }
      if (setVideoId) {
        song['setVideoId'] = setVideoId;
      }
      if (feedbackTokens) {
        song['feedbackTokens'] = feedbackTokens;
      }

      if (menuEntries) {
        for (const menuEntry of menuEntries) {
          song[menuEntry.slice(undefined, -1)] = nav(data, [
            ...MENU_ITEMS,
            ...menuEntry,
          ]);
        }
      }

      songs.push(song);
    } catch (e) {
      console.log(`Item ${count}: ${e}`);
    }
  }
  return songs;
}
