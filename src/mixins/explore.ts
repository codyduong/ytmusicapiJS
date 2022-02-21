import {
  CAROUSEL,
  CAROUSEL_CONTENTS,
  CAROUSEL_TITLE,
  CATEGORY_PARAMS,
  CATEGORY_TITLE,
  FRAMEWORK_MUTATIONS,
  GRID,
  GRID_ITEMS,
  MRLIR,
  MTRIR,
  MUSIC_SHELF,
  NAVIGATION_BROWSE_ID,
  SECTION_LIST,
  SINGLE_COLUMN_TAB,
  TITLE,
  TITLE_TEXT,
} from '../parsers';
import {
  parseContentList,
  parsePlaylist,
  parseVideo,
} from '../parsers/browsing';
import {
  parseChartArtist,
  parseChartSong,
  parseChartTrending,
} from '../parsers/explore';
import { nav } from '../parsers/utils';
import { YTMusicBase } from './.mixin.helper';

import * as et from './explore.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ExploreMixin = <TBase extends YTMusicBase>(Base: TBase) => {
  return class ExploreMixin extends Base {
    /**
     * Fetch "Moods & Genres" categories from YouTube Music.
     * 
     * @return Object of sections and categories
     * @example
{
  'For you': [
    {
    'params': 'ggMPOg1uX1ZwN0pHT2NBT1Fk',
    'title': '1980s'
    },
    {
    'params': 'ggMPOg1uXzZQbDB5eThLRTQ3',
    'title': 'Feel Good'
    },
    ...
  ],
  'Genres': [
    {
    'params': 'ggMPOg1uXzVLbmZnaWI4STNs',
    'title': 'Dance & Electronic'
    },
    {
    'params': 'ggMPOg1uX3NjZllsNGVEMkZo',
    'title': 'Decades'
    },
    ...
  ],
  'Moods & moments': [
    {
    'params': 'ggMPOg1uXzVuc0dnZlhpV3Ba',
    'title': 'Chill'
    },
    {
    'params': 'ggMPOg1uX2ozUHlwbWM3ajNq',
    'title': 'Commute'
    },
    ...
  ],
}
     */
    async getMoodCategories(): Promise<Record<string, any>> {
      const sections: Record<string, any> = {};
      const response = await this._sendRequest<et.getMoodCategoriesResponse>(
        'browse',
        { browseId: 'FEmusic_moods_and_genres' }
      );
      const naved = nav<typeof response, et.getMoodSectionNav>(response, [
        ...SINGLE_COLUMN_TAB,
        ...SECTION_LIST,
      ]);
      for (const section of naved) {
        const title = nav<typeof section, et.getMoodTitle>(section, [
          ...GRID,
          'header',
          'gridHeaderRenderer',
          ...TITLE_TEXT,
        ]);
        sections[title] = [];
        for (const category of nav<typeof section, et.getMoodGridItems>(
          section,
          GRID_ITEMS
        )) {
          sections[title].push({
            title: nav(category, CATEGORY_TITLE),
            params: nav(category, CATEGORY_PARAMS),
          });
        }
      }

      return sections;
    }

    /**
     * Retrieve a list of playlists for a given "Moods & Genres" category.
     * @param params params obtained by :py:func:`get_mood_categories`
     * @returns List of playlists in the format of :py:func:`get_library_playlists`
     */
    async getMoodPlaylists(params: string): Promise<Record<string, any>> {
      const playlists: Array<any> = [];
      const response = await this._sendRequest<et.getMoodPlaylists>('browse', {
        browseId: 'FEmusic_moods_and_genres_category',
        params: params,
      });
      for (const section of nav<typeof response, et.getMoodPlaylistsNav>(
        response,
        [...SINGLE_COLUMN_TAB, ...SECTION_LIST]
      )) {
        let path: Array<number | string> = [];
        if ('gridRenderer' in section) {
          path = GRID_ITEMS;
        } else if ('musicCarouselShelfRenderer' in section) {
          path = CAROUSEL_CONTENTS;
        } else if ('musicImmersiveCarouselShelfRenderer' in section) {
          path = ['musicImmersiveCarouselShelfRenderer', 'contents'];
        }
        if (path.length) {
          const results = nav(section, path);
          playlists.push(parseContentList(results, parsePlaylist));
        }
      }
      return playlists;
    }

    /**
     * Get latest charts data from YouTube Music: Top songs, top videos, top artists and top trending videos.
     * Global charts have no Trending section, US charts have an extra Genres section with some Genre charts.
     * @param {string} [country = 'ZZ'] ISO 3166-1 Alpha-2 country code.
     * @returns Dictionary containing chart songs (only if authenticated), chart videos, chart artists and trending videos.
     * @example
{
  "countries": {
    "selected": {
      "text": "United States"
    },
    "options": ["DE",
      "ZZ",
      "ZW"]
  },
  "songs": {
    "playlist": "VLPL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI",
    "items": [
      {
        "title": "Outside (Better Days)",
        "videoId": "oT79YlRtXDg",
        "artists": [
          {
            "name": "MO3",
            "id": "UCdFt4Cvhr7Okaxo6hZg5K8g"
          },
          {
            "name": "OG Bobby Billions",
            "id": "UCLusb4T2tW3gOpJS1fJ-A9g"
          }
        ],
        "thumbnails": [...],
        "isExplicit": true,
        "album": {
          "name": "Outside (Better Days)",
          "id": "MPREb_fX4Yv8frUNv"
        },
        "rank": "1",
        "trend": "up"
      }
    ]
  },
  "videos": {
    "playlist": "VLPL4fGSI1pDJn69On1f-8NAvX_CYlx7QyZc",
    "items": [
      {
        "title": "EVERY CHANCE I GET (Official Music Video) (feat. Lil Baby & Lil Durk)",
        "videoId": "BTivsHlVcGU",
        "playlistId": "PL4fGSI1pDJn69On1f-8NAvX_CYlx7QyZc",
        "thumbnails": [],
        "views": "46M"
      }
    ]
  },
  "artists": {
    "playlist": null,
    "items": [
      {
        "title": "YoungBoy Never Broke Again",
        "browseId": "UCR28YDxjDE3ogQROaNdnRbQ",
        "subscribers": "9.62M",
        "thumbnails": [],
        "rank": "1",
        "trend": "neutral"
      }
    ]
  },
  "genres": [
    {
      "title": "Top 50 Pop Music Videos United States",
      "playlistId": "PL4fGSI1pDJn77aK7sAW2AT0oOzo5inWY8",
      "thumbnails": []
    }
  ],
  "trending": {
    "playlist": "VLPLrEnWoR732-DtKgaDdnPkezM_nDidBU9H",
    "items": [
      {
        "title": "Permission to Dance",
        "videoId": "CuklIb9d3fI",
        "playlistId": "PLrEnWoR732-DtKgaDdnPkezM_nDidBU9H",
        "artists": [
          {
            "name": "BTS",
            "id": "UC9vrvNSL3xcWGSkV86REBSg"
          }
        ],
        "thumbnails": [],
        "views": "108M"
      }
    ]
  }
  }
     */
    async getCharts(country = 'ZZ'): Promise<Record<string, any>> {
      const body: Record<string, any> = { browseId: 'FEmusic_charts' };
      if (country) {
        body['formData'] = { selectedValues: [country] };
      }
      const endpoint = 'browse';
      const response = await this._sendRequest(endpoint, body);
      const results = nav(response, [...SINGLE_COLUMN_TAB, ...SECTION_LIST]);
      const charts: Record<string, any> = { countries: {} };
      const menu = nav(results[0], [
        ...MUSIC_SHELF,
        'subheaders',
        0,
        'musicSideAlignedItemRenderer',
        'startItems',
        0,
        'musicSortFilterButtonRenderer',
      ]);
      charts['countries']['selected'] = nav(menu, TITLE);
      charts['countries']['options'] = nav<never, Array<any>>(
        response,
        FRAMEWORK_MUTATIONS
      )
        .map((m) =>
          nav(m, ['payload', 'musicFormBooleanChoice', 'opaqueToken'], true)
        )
        .filter((x) => x);
      const chartsCategories = ['videos', 'artists'];

      const hasSongs = !!this.getAuth();
      const hasGenres = country == 'US';
      const hasTrending = country != 'ZZ';
      if (hasSongs) {
        chartsCategories.splice(0, 0, 'songs');
      }
      if (hasGenres) {
        chartsCategories.push('genres');
      }
      if (hasTrending) {
        chartsCategories.push('trending');
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const parseChart = (i: number, parseFunc: any, key: string) => {
        parseContentList(
          nav(results[i + (hasSongs ? 1 : 0)], CAROUSEL_CONTENTS),
          parseFunc,
          key
        );
      };
      for (const [i, c] of chartsCategories.entries()) {
        charts[c] = {
          playlist: nav(
            results[1 + i],
            [...CAROUSEL, ...CAROUSEL_TITLE, ...NAVIGATION_BROWSE_ID],
            true
          ),
        };
      }

      if (hasSongs) {
        charts['songs'] = {
          ...charts['songs'],
          ...{
            items: parseChart(0, parseChartSong, MRLIR),
          },
        };
      }

      charts['videos']['items'] = parseChart(1, parseVideo, MTRIR);
      charts['artists']['items'] = parseChart(2, parseChartArtist, MRLIR);

      if (hasGenres) {
        charts['genres'] = parseChart(3, parsePlaylist, MTRIR);
      }

      if (hasTrending) {
        charts['trending']['items'] = parseChart(
          3 + (hasGenres ? 1 : 0),
          parseChartTrending,
          MRLIR
        );
      }

      return charts;
    }
  };
};
