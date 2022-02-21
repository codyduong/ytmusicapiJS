import { MENU_ITEMS, THUMBNAIL, TITLE_TEXT, TOGGLE_MENU } from '.';
import { parseWatchPlaylistTrack } from '../mixins/watch.types';
import { parseLikeStatus, parseSongMenuTokens, parseSongRuns } from './songs';
import { nav } from './utils';

export function parseWatchPlaylist(results: Array<Record<string, any>>): any {
  const tracks: Array<parseWatchPlaylistTrack> = [];
  for (let result of results) {
    if ('playlistPanelVideoWrapperRenderer' in result) {
      result = result['playlistPanelVideoWrapperRenderer']['primaryRenderer'];
    }
    if (!result['playlistPanelVideoRenderer']) {
      continue;
    }
    const data = result['playlistPanelVideoRenderer'];
    if ('unplayableText' in data) {
      continue;
    }

    let [feedbackTokens, likeStatus] = [null, null];
    const _ = nav(data, MENU_ITEMS, true); //@codyduong this is not present in pyLib, discover why.
    if (_) {
      for (const item of _) {
        if (TOGGLE_MENU in item) {
          const service = item[TOGGLE_MENU]['defaultServiceEndpoint'];
          if ('feedbackEndpoint' in service) {
            feedbackTokens = parseSongMenuTokens(item);
          }
          if ('likeEndpoint' in service) {
            likeStatus = parseLikeStatus(service);
          }
        }
      }
    }

    const songInfo = parseSongRuns(
      data['longBylineText']['runs']
    ) as any as parseWatchPlaylistTrack;

    let track: parseWatchPlaylistTrack = {
      videoId: data['videoId'],
      title: nav(data, TITLE_TEXT),
      length: nav(data, ['lengthText', 'runs', 0, 'text'], true),
      thumbnail: nav(data, THUMBNAIL),
      feedbackTokens: feedbackTokens,
      likeStatus: likeStatus,
    };
    track = { ...track, ...songInfo };
    tracks.push(track);
  }

  return tracks;
}
