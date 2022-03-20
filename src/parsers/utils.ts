import { nav } from '@codyduong/nav';
import { MENU_ITEMS, NAVIGATION_BROWSE_ID } from './index';
import { parsePlaylistItemsReturn } from './playlists.types';

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

export async function getContinuations(
  results: any,
  continuation_type: string | number,
  limit: number,
  requestFunc: (arg1: any) => Promise<Record<string, any>>,
  parse_func: (arg1: any) => any,
  ctokenPath = ''
): Promise<Array<any>> {
  let items: any[] = [];
  while ('continuations' in results && items.length < limit) {
    const additionalParams = getContinuationParams(results, ctokenPath);
    const response = await requestFunc(additionalParams);
    if ('continuationContents' in response) {
      results = response['continuationContents'][continuation_type];
    } else {
      break;
    }
    const contents = getContinuationContents(results, parse_func);
    if (contents?.length == 0) {
      break;
    }
    items = items.concat(contents);
  }
  return items;
}

export async function getValidatedContinuations(
  results: any,
  continuation_type: any,
  limit: number,
  per_page: number,
  request_func: any,
  parse_func: any,
  ctoken_path = ''
): Promise<any> {
  let items: string | any[] = [];
  while ('continuations' in results && items.length < limit) {
    const additionalParams = getContinuationParams(results, ctoken_path);
    const wrapped_parse_func = (rawResponse: any): any =>
      getParsedContinuationItems(rawResponse, parse_func, continuation_type);
    const validateFunc = (parsed: Record<string, any>): any =>
      validateResponse(parsed, per_page, limit, items.length);

    const response = await resendRequestUntilParsedResponseIsValid(
      request_func,
      additionalParams,
      wrapped_parse_func,
      validateFunc,
      3
    );
    results = response['results'];
    items = [...items, ...response['parsed']];
  }
  return items;
}

export function getParsedContinuationItems(
  response: Record<string, any>,
  parseFunc: (arg0: any) => any,
  continuationType: string | number
): any {
  const results = response['continuationContents'][continuationType];
  return {
    results: results,
    parsed: getContinuationContents(results, parseFunc),
  };
}

function getContinuationParams(results: any, ctoken_path: string): string {
  const ctoken = nav<any>(results, [
    'continuations',
    0,
    'next' + ctoken_path + 'ContinuationData',
    'continuation',
  ]);
  return getContinuationString(ctoken);
}

export function getContinuationString(ctoken: string): string {
  return `&ctoken=${ctoken}&continuation=${ctoken}`;
}

function getContinuationContents<T extends Record<string, any>>(
  continuation: T,
  parseFunc: (arg0: any) => T
): T | null {
  for (const term of ['contents', 'items']) {
    if (term in continuation) {
      return parseFunc(continuation[term]);
    }
  }
  return [] as any;
}

export async function resendRequestUntilParsedResponseIsValid<
  T extends { parsed: parsePlaylistItemsReturn; results: unknown }
>(
  requestFunc: (additionalParams: any) => Promise<any>,
  request_additional_params: string | null,
  parse_func: (rawResponse: any) => T,
  validateFunc: (parsed: T) => boolean,
  max_retries: number
): Promise<T> {
  const response = await requestFunc(request_additional_params);
  let parsedObject = parse_func(response);
  let retryCounter = 0;
  while (!validateFunc(parsedObject) && retryCounter < max_retries) {
    const response = requestFunc(request_additional_params);
    const attempt = parse_func(response);
    if (attempt['parsed'].length > parsedObject['parsed'].length) {
      parsedObject = attempt;
      retryCounter += 1;
    }
  }

  return parsedObject;
}

export function validateResponse(
  response: Record<string, any>,
  perPage: number,
  limit: number,
  currentCount: number
): boolean {
  const remaining_items_count = limit - currentCount;
  const expected_items_count = Math.min(perPage, remaining_items_count);

  // response is invalid, if it has less items then minimal expected count
  return response['parsed'].length >= expected_items_count;
}

export function validatePlaylistId(
  playlistId: string | null | undefined
): string | null {
  return !playlistId?.startsWith('VL')
    ? playlistId ?? null
    : playlistId.slice(2);
}

export { nav } from '@codyduong/nav';

//These implementations are sketch...
export function findObjectByKey<T extends Array<Record<string, any>>>(
  objectList: T | null,
  key: string,
  nested?: string,
  isKey = false
): any {
  if (objectList) {
    for (let item of objectList) {
      if (nested) {
        item = item[nested];
      }
      if (key in item) {
        return isKey ? item[key] : item;
      }
    }
  }
  return null;
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
