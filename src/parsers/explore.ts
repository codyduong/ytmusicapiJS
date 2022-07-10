import {
  TEXT_RUN_TEXT,
  TEXT_RUN,
  NAVIGATION_VIDEO_ID,
  THUMBNAILS,
  NAVIGATION_BROWSE_ID,
  NAVIGATION_PLAYLIST_ID,
  nav,
} from '.';
import { thumbnails } from '../types';
import { parseSongFlat } from './browsing';
import { parseSongArtists, parseSongArtistsReturn } from './songs';
import { getDotSeperatorIndex, getFlexColumnItem } from './utils';

const TRENDS = {
  ARROW_DROP_UP: 'up',
  ARROW_DROP_DOWN: 'down',
  ARROW_CHART_NEUTRAL: 'neutral',
};

export type parseChartSongReturn = {
  title: string;
  videoId: string | null;
  artists: parseSongArtistsReturn;
  thumbnails: thumbnails;
  isExplicit: boolean;
} & (
  | {
      album?: {
        name: string;
        id: string;
      };
    }
  | {
      views: string;
    }
);
export function parseChartSong(data: any): parseChartSongReturn {
  let parsed = parseSongFlat(data);
  parsed = { ...parsed, ...parseRanking(data) };
  return parsed;
}

export type parseChartArtistReturn = {
  title: string;
  browseId: string;
  subscribers: string | null;
  thumbnails: thumbnails;
};
export function parseChartArtist(data: any): parseChartArtistReturn {
  const flexItem: NonNullable<ReturnType<typeof getFlexColumnItem>> =
    getFlexColumnItem(data, 1) as any;
  let subscribers: string | null = null;
  if (subscribers) {
    subscribers = nav(flexItem, TEXT_RUN_TEXT).split(' ')[0];
  }
  let parsed = {
    title: nav(getFlexColumnItem(data, 0) as any, TEXT_RUN_TEXT),
    browseId: nav(data, NAVIGATION_BROWSE_ID),
    subscribers: subscribers,
    thumbnails: nav(data, THUMBNAILS),
  };
  parsed = { ...parsed, ...parseRanking(data) };
  return parsed;
}

export type parseChartTrendingReturn = {
  title: string;
  videoId: string | null;
  playlistId: string | null;
  artists: parseSongArtistsReturn;
  thumbnails: thumbnails;
  views?: string | null;
} | null;
export function parseChartTrending(data: any): parseChartTrendingReturn {
  if (data) {
    const flex_0: NonNullable<ReturnType<typeof getFlexColumnItem>> =
      getFlexColumnItem(data, 0) as any;
    const artists = parseSongArtists(data, 1);
    if (artists) {
      const index = getDotSeperatorIndex(artists);
      // last item is views for some reason
      const views =
        index == artists.length ? null : artists.pop()?.['name'].split(' ')[0];

      return {
        title: nav(flex_0, TEXT_RUN_TEXT),
        videoId: nav(flex_0, [...TEXT_RUN, ...NAVIGATION_VIDEO_ID], null),
        playlistId: nav(flex_0, [...TEXT_RUN, ...NAVIGATION_PLAYLIST_ID], null),
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
        nav(data, [
          'customIndexColumn',
          'musicCustomIndexColumnRenderer',
          'icon',
          'iconType',
        ]) as keyof typeof TRENDS
      ],
  };
}
