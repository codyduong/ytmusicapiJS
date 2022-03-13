import { MENU_ITEMS, THUMBNAIL, TITLE_TEXT, TOGGLE_MENU } from '.';
import { parseWatchPlaylistTrack } from '../mixins/watch.types';
import { parseLikeStatus, parseSongMenuTokens, parseSongRuns } from './songs';
import { nav } from './utils';

export function parseWatchPlaylist(results: Array<Record<string, any>>): any {
  const tracks: Array<parseWatchPlaylistTrack> = [];
  const PPVWR = 'playlistPanelVideoWrapperRenderer';
  const PPVR = 'playlistPanelVideoRenderer';
  for (let result of results) {
    let counterpart = null;
    if (PPVWR in result) {
      counterpart =
        result[PPVWR]['counterpart'][0]['counterpartRenderer'][PPVR];
      result = result[PPVWR]['primaryRenderer'];
    }
    if (!(PPVR in result)) {
      continue;
    }
    const data = result['playlistPanelVideoRenderer'];
    if ('unplayableText' in data) {
      continue;
    }

    const track = parseWatchTrack(data);
    if (counterpart) {
      track['counterpart'] = parseWatchTrack(counterpart);
    }
    tracks.push(track);
  }

  return tracks;
}

function parseWatchTrack(data: Record<string, any>): any {
  let [feedbackTokens, likeStatus] = [null, null];
  const _ = nav(data, MENU_ITEMS);
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
  return track;
}
