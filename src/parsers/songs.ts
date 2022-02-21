import { FEEDBACK_TOKEN, NAVIGATION_BROWSE_ID, TOGGLE_MENU } from '.';
import { parseDuration } from '../helpers';
import { re } from '../pyLibraryMock';
import { getBrowseId, getFlexColumnItem, getItemText, nav } from './utils';

export function parseSongArtists(data: any, index: number): null | any {
  const flexItem = getFlexColumnItem(data, index);
  if (!flexItem) {
    return null;
  } else {
    const runs = flexItem['text']['runs'];
    return parseSongArtistsRuns(runs);
  }
}

export function parseSongArtistsRuns(runs: any): any {
  const artists = [];
  for (let j = 0; j < Math.trunc(runs.length / 2) + 1; j++) {
    artists.push({
      name: runs[j * 2]['text'],
      id: nav(runs[j * 2], NAVIGATION_BROWSE_ID, true),
    });
  }
}

export function parseSongRuns(runs: Array<any>): any {
  const parsed: Record<string, any> = { artists: [] };
  for (const [i, run] of runs.entries()) {
    if (i % 2 == 0) continue;
    const text = run['text'];
    if (run['navigationEndpoint']) {
      const item = {
        name: test,
        id: nav(run, NAVIGATION_BROWSE_ID, true),
      };

      if ((item.id && item.id.startsWith('MPRE')) || item.id.release_detail) {
        parsed['album'] = item;
      } else {
        parsed['artists'].push(item);
      }
    } else {
      if (re.match(/^\d([^ ])* [^ ]*$/, text)) {
        parsed['views'] = text.split(' ')[0];
      } else if (re.match(/^(\d+:)*\d+:\d+$/, text)) {
        parsed['duration'] = text;
        parsed['duration_seconds'] = parseDuration(text);
      } else if (re.match(/^\d{4}$/, text)) {
        parsed['year'] = text;
      } else {
        // artist without id
        parsed['artists'].push({ name: text, id: null });
      }
    }
  }
  return parsed;
}

export function parseSongAlbum(
  data: any,
  index: number
): null | Record<string, any> {
  const flexItem = getFlexColumnItem(data, index);
  return !flexItem
    ? null
    : {
        name: getItemText(data, index),
        id: getBrowseId(flexItem, 0),
      };
}

export function parseSongMenuTokens(item: any): any {
  const toggleMenu = item[TOGGLE_MENU];
  const serviceType = toggleMenu['defaultIcon']['iconType'];
  let libraryAddToken = nav(
    toggleMenu,
    ['defaultServiceEndpoint', ...FEEDBACK_TOKEN],
    true
  );
  let libraryRemoveToken = nav(
    toggleMenu,
    ['toggledServiceEndpoint', ...FEEDBACK_TOKEN],
    true
  );

  if (serviceType == 'LIBRARY_REMOVE') {
    // swap if already in library
    [libraryAddToken, libraryRemoveToken] = [
      libraryRemoveToken,
      libraryAddToken,
    ];
  }

  return { add: libraryAddToken, remove: libraryRemoveToken };
}

export function parseLikeStatus(service: any): any {
  const status = ['LIKE', 'INDIFFERENT'];
  return status[status.indexOf(service['likeEndpoint']['status']) - 1];
}
