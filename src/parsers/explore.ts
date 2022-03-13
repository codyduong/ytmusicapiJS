import {
  TEXT_RUN_TEXT,
  TEXT_RUN,
  NAVIGATION_VIDEO_ID,
  THUMBNAILS,
  BADGE_LABEL,
  NAVIGATION_BROWSE_ID,
  NAVIGATION_PLAYLIST_ID,
} from '.';
import { parseSongArtists } from './songs';
import { getDotSeperatorIndex, getFlexColumnItem, nav } from './utils';

const TRENDS = {
  ARROW_DROP_UP: 'up',
  ARROW_DROP_DOWN: 'down',
  ARROW_CHART_NEUTRAL: 'neutral',
};

export function parseChartSong(data: any): Record<string, any> {
  const flex_0 = getFlexColumnItem(data, 0);
  let parsed: Record<string, any> = {
    title: nav(flex_0, TEXT_RUN_TEXT),
    videoId: nav(flex_0, [...TEXT_RUN, ...NAVIGATION_VIDEO_ID], true),
    artists: parseSongArtists(data, 1),
    thumbnails: nav(data, THUMBNAILS),
    isExplicit: nav(data, BADGE_LABEL, true) != null,
  };
  const flex_2 = getFlexColumnItem(data, 2);
  if (flex_2 && 'navigationEndpoint' in nav(flex_2, TEXT_RUN)) {
    parsed['album'] = {
      name: nav(flex_2, TEXT_RUN_TEXT),
      id: nav(flex_2, [...TEXT_RUN, ...NAVIGATION_BROWSE_ID]),
    };
  } else {
    const flex_1 = getFlexColumnItem(data, 1);
    //const _ = nav(flex_1, ['text', 'runs']);
    parsed['views'] = nav(flex_1, ['text', 'runs', -1, 'text']).split(' ')[0];
  }
  parsed = { ...parsed, ...parseRanking(data) };
  return parsed;
}

export function parseChartArtist(data: any): Record<string, any> {
  let subscribers = getFlexColumnItem(data, 1);
  if (subscribers) {
    subscribers = nav(subscribers, TEXT_RUN_TEXT).split(' ')[0];
  }
  let parsed = {
    title: nav(getFlexColumnItem(data, 0), TEXT_RUN_TEXT),
    browseId: nav(data, NAVIGATION_BROWSE_ID),
    subscribers: subscribers,
    thumbnails: nav(data, THUMBNAILS),
  };
  parsed = { ...parsed, ...parseRanking(data) };
  return parsed;
}

export function parseChartTrending(data: any): Record<string, any> | null {
  if (data) {
    const flex_0 = getFlexColumnItem(data, 0);
    const artists = parseSongArtists(data, 1);
    if (artists) {
      const index = getDotSeperatorIndex(artists);
      // last item is views for some reason
      const views =
        index == artists.length ? null : artists.pop()['name'].split(' ')[0];

      return {
        title: nav(flex_0, TEXT_RUN_TEXT),
        videoId: nav(flex_0, [...TEXT_RUN, ...NAVIGATION_VIDEO_ID], true),
        playlistId: nav(flex_0, [...TEXT_RUN, ...NAVIGATION_PLAYLIST_ID], true),
        artists: artists,
        thumbnails: nav(data, THUMBNAILS),
        views: views,
      };
    }
  }
  return null;
}

export function parseRanking(data: any): Record<string, any> {
  return {
    rank: nav(data, [
      'customIndexColumn',
      'musicCustomIndexColumnRenderer',
      ...TEXT_RUN_TEXT,
    ]),
    trend:
      TRENDS[
        nav<never, keyof typeof TRENDS>(data, [
          'customIndexColumn',
          'musicCustomIndexColumnRenderer',
          'icon',
          'iconType',
        ])
      ],
  };
}
