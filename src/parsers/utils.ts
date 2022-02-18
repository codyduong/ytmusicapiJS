import { MENU_ITEMS } from './index';

export function parseMenuPlaylists(
  data: Record<string, any> | null,
  result: Record<string, any>
): void {
  // What... @CODYDUONG discovery
  // const watchMenu = findObjectByKey(
  //   nav(data, MENU_ITEMS),
  //   'menuNavigationItemRenderer'
  // );
  const watchMenu: Record<string, any> = nav(data, MENU_ITEMS)?.[
    'menuNavigationItemRenderer'
  ];
  if (watchMenu) {
    for (const item of watchMenu.map(
      (x: Record<string, any>) => x['menuNavigationItemRenderer']
    )) {
      const icon = nav(item, ['icon', 'iconType']);
      let watchKey;
      if (icon == 'MUSIC_SHUFFLE') {
        watchKey = 'shuffleId';
      } else if (icon == 'MIX') {
        watchKey = 'radioId';
      } else {
        continue;
      }

      let watchId = nav(
        item,
        ['navigationEndpoint', 'watchPlaylistEndpoint', 'playlistId'],
        true
      );
      if (!watchId) {
        watchId = nav(
          item,
          ['navigationEndpoint', 'watchEndpoint', 'playlistId'],
          true
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
    runs: { text: any }[];
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

// function get_fixed_column_item(item, index):
//     if 'text' not in item['fixedColumns'][index]['musicResponsiveListItemFixedColumnRenderer'] or \
//             'runs' not in item['fixedColumns'][index]['musicResponsiveListItemFixedColumnRenderer']['text']:
//         return None

//     return item['fixedColumns'][index]['musicResponsiveListItemFixedColumnRenderer']

// function get_browse_id(item, index):
//     if 'navigationEndpoint' not in item['text']['runs'][index]:
//         return None
//     else:
//         return nav(item['text']['runs'][index], NAVIGATION_BROWSE_ID)

export function getContinuations(
  results: any,
  continuation_type: string | number,
  limit: number,
  request_func: (arg1: any) => Record<string, any>,
  parse_func: any,
  ctoken_path = ''
): Array<any> {
  let items: any[] = [];
  while ('continuations' in results && items.length < limit) {
    const additionalParams = getContinuationParams(results, ctoken_path);
    const response = request_func(additionalParams);
    if ('continuationContents' in response) {
      results = response['continuationContents'][continuation_type];
    } else {
      break;
    }
    const contents = getContinuationContents(results, parse_func);
    if (contents?.length == 0) {
      break;
    }
    items = [...items, ...contents];
  }
  return items;
}

// function get_validated_continuations(results,
//                                 continuation_type,
//                                 limit,
//                                 per_page,
//                                 request_func,
//                                 parse_func,
//                                 ctoken_path=""):
//     items = []
//     while 'continuations' in results and len(items) < limit:
//         additionalParams = get_continuation_params(results, ctoken_path)
//         wrapped_parse_func = lambda raw_response: get_parsed_continuation_items(
//             raw_response, parse_func, continuation_type)
//         validate_func = lambda parsed: validate_response(parsed, per_page, limit, len(items))

//         response = resend_request_until_parsed_response_is_valid(request_func, additionalParams,
//                                                                  wrapped_parse_func, validate_func,
//                                                                  3)
//         results = response['results']
//         items.extend(response['parsed'])

//     return items

// function get_parsed_continuation_items(response, parse_func, continuation_type):
//     results = response['continuationContents'][continuation_type]
//     return {'results': results, 'parsed': get_continuation_contents(results, parse_func)}

function getContinuationParams(results: any, ctoken_path: string): string {
  const ctoken = nav(results, [
    'continuations',
    0,
    'next' + ctoken_path + 'ContinuationData',
    'continuation',
  ]);
  return getContinuationString(ctoken);
}

function getContinuationString(ctoken: string): string {
  //return "&ctoken=" + ctoken + "&continuation=" + ctoken
  return `&ctoken=${ctoken}&continuation=ctoken`;
}

function getContinuationContents<T extends any[]>(
  continuation: T,
  parse_func: (arg0: any) => T
): T | null {
  for (const term in ['contents', 'items']) {
    if (term in continuation) {
      return parse_func(continuation[term]);
    }
  }
  return null;
}

//     return []

// function resend_request_until_parsed_response_is_valid(request_func, request_additional_params,
//                                                   parse_func, validate_func, max_retries):
//     response = request_func(request_additional_params)
//     parsed_object = parse_func(response)
//     retry_counter = 0
//     while not validate_func(parsed_object) and retry_counter < max_retries:
//         response = request_func(request_additional_params)
//         attempt = parse_func(response)
//         if len(attempt['parsed']) > len(parsed_object['parsed']):
//             parsed_object = attempt
//         retry_counter += 1

//     return parsed_object

// function validate_response(response, per_page, limit, current_count):
//     remaining_items_count = limit - current_count
//     expected_items_count = min(per_page, remaining_items_count)

//     # response is invalid, if it has less items then minimal expected count
//     return len(response['parsed']) >= expected_items_count

// function validate_playlist_id(playlistId):
//     return playlistId if not playlistId.startswith("VL") else playlistId[2:]

export function nav<T extends Record<string, any>>(
  root: T | null,
  items: (string | number)[],
  nullIfAbsent = false
): null | any {
  // """Access a nested object in root by item sequence."""
  try {
    if (root) {
      for (const k of items) {
        root = root![k];
      }
      return root;
    }
  } catch (e) {
    if (nullIfAbsent && e instanceof ReferenceError) {
      return null;
    } else {
      throw e;
    }
  }

  return null;
}

//These implementations are sketch...
export function findObjectByKey<T extends Record<string, any>>(
  objectList: T | null,
  key: string,
  nested?: string,
  isKey = false
): any {
  if (objectList) {
    // eslint-disable-next-line prefer-const
    for (let [, item] of Object.entries(objectList)) {
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

//Ditto
export function findObjectsByKey<T extends Record<string, any>>(
  objectList: T,
  key: string,
  nested: null
): any {
  const objects = [];
  for (let [, item] of Object.entries(objectList)) {
    if (nested) {
      item = item[nested];
    }
    if (key in item) {
      objects.push(item);
    }
  }
  return objects;
}

// function get_dot_separator_index(runs):
//     index = len(runs)
//     try:
//         index = runs.index({'text': ' • '})
//     except ValueError:
//         len(runs)
//     return index
