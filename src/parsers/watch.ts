import { MENU_ITEMS, THUMBNAIL, TITLE_TEXT, TOGGLE_MENU } from '.';
import { thumbnail } from '../types';
import {
  parseLikeStatus,
  parseLikeStatusReturn,
  parseSongMenuTokens,
  parseSongMenuTokensReturn,
  parseSongRuns,
  parseSongRunsReturn,
} from './songs';
import { nav } from './utils';

export type parseWatchPlaylistReturn = (parseWatchTrackReturn & {
  counterpart?: parseWatchTrackReturn;
})[];
export function parseWatchPlaylist(
  results: Array<Record<string, any>>
): parseWatchPlaylistReturn {
  const tracks: parseWatchPlaylistReturn = [];
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

    const track: parseWatchPlaylistReturn[number] = parseWatchTrack(data);
    if (counterpart) {
      track['counterpart'] = parseWatchTrack(counterpart);
    }
    tracks.push(track);
  }

  return tracks;
}

export type parseWatchTrackReturn = {
  videoId: string;
  title: string;
  length: string;
  thumbnail: thumbnail;
  feedbackTokens: parseSongMenuTokensReturn;
  likeStatus: parseLikeStatusReturn;
} & parseSongRunsReturn;
function parseWatchTrack(data: Record<string, any>): parseWatchTrackReturn {
  let [feedbackTokens, likeStatus]: any[] = [null, null];
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

  const songInfo = parseSongRuns(data['longBylineText']['runs']);

  const track = {
    videoId: data['videoId'],
    title: nav(data, TITLE_TEXT),
    length: nav(data, ['lengthText', 'runs', 0, 'text'], null),
    thumbnail: nav(data, THUMBNAIL),
    feedbackTokens: feedbackTokens,
    likeStatus: likeStatus,
    ...songInfo,
  };
  return track;
}
