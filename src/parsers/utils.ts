import { nav } from '@codyduong/nav';
import { MENU_ITEMS, NAVIGATION_BROWSE_ID } from './index';

export function parseMenuPlaylists(
  data: Record<string, any> | null,
  result: Record<string, any>
): void {
  // What... @CODYDUONG discovery
  // const watchMenu = findObjectByKey(
  //   nav(data, MENU_ITEMS),
  //   'menuNavigationItemRenderer'
  // );
  const watchMenu: Record<string, any> = nav<any>(data, MENU_ITEMS)?.[ //this isn't nullable in pylib todo @codyduong discovery
    'menuNavigationItemRenderer'
  ];
  if (watchMenu) {
    for (const item of watchMenu.map(
      (x: Record<string, any>) => x['menuNavigationItemRenderer']
    )) {
      const icon = nav<any>(item, ['icon', 'iconType']);
      let watchKey;
      if (icon == 'MUSIC_SHUFFLE') {
        watchKey = 'shuffleId';
      } else if (icon == 'MIX') {
        watchKey = 'radioId';
      } else {
        continue;
      }

      let watchId = nav<any>(
        item,
        ['navigationEndpoint', 'watchPlaylistEndpoint', 'playlistId'],
        null
      );
      if (!watchId) {
        watchId = nav<any>(
          item,
          ['navigationEndpoint', 'watchEndpoint', 'playlistId'],
          null
        );
      }
      if (watchId) {
        result[watchKey] = watchId;
      }
    }
  }
}

type FlexItem = {
  text: {
    runs: {
      text: string;
      navigationEndpoint: {
        watchEndpoint: { videoId: string; playlistId: string };
        browseEndpoint: { browseId: string };
      };
    }[];
  };
};

export function getItemText(
  item: any,
  index: number,
  run_index = 0,
  none_if_absent = false
): string | null {
  const column = getFlexColumnItem(item, index);
  if (!column) {
    return null;
  }
  if (none_if_absent && column['text']['runs'].length < run_index + 1) {
    return null;
  }
  return column['text']['runs'][run_index]['text'];
}

export function getFlexColumnItem(item: any, index: number): FlexItem | null {
  if (
    item['flexColumns'].length <= index ||
    !(
      'text' in
      item['flexColumns'][index]['musicResponsiveListItemFlexColumnRenderer']
    ) ||
    !(
      'runs' in
      item['flexColumns'][index]['musicResponsiveListItemFlexColumnRenderer'][
        'text'
      ]
    )
  ) {
    return null;
  }

  return item['flexColumns'][index][
    'musicResponsiveListItemFlexColumnRenderer'
  ];
}

export function getFixedColumnItem(
  item: { [x: string]: { [x: string]: { [x: string]: any } } },
  index: number
): any {
  if (
    !item['fixedColumns'][index]['musicResponsiveListItemFixedColumnRenderer'][
      'text'
    ] ||
    !item['fixedColumns'][index]['musicResponsiveListItemFixedColumnRenderer'][
      'text'
    ]['runs']
  )
    return null;

  return item['fixedColumns'][index][
    'musicResponsiveListItemFixedColumnRenderer'
  ];
}

export function getBrowseId(
  item: Record<string, any>,
  index: string | number
): null | any {
  if (!item['text']['runs'][index]['navigationEndpoint']) {
    return null;
  } else {
    return nav(item['text']['runs'][index], NAVIGATION_BROWSE_ID);
  }
}

export function validatePlaylistId(
  playlistId: string | null | undefined
): string | null {
  return !playlistId?.startsWith('VL')
    ? playlistId ?? null
    : playlistId.slice(2);
}

export function getDotSeperatorIndex(runs: Record<string, any>[]): number {
  let index = runs.length;
  // cheap workaround rather than deep equality
  const indexOf = runs.findIndex((v) => v['text'] == ' • ');
  if (indexOf !== -1) {
    index = indexOf;
  }
  return index;
}
