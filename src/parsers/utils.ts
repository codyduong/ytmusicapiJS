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
      const icon = nav<never, any>(item, ['icon', 'iconType']);
      let watchKey;
      if (icon == 'MUSIC_SHUFFLE') {
        watchKey = 'shuffleId';
      } else if (icon == 'MIX') {
        watchKey = 'radioId';
      } else {
        continue;
      }

      let watchId = nav<never, any>(
        item,
        ['navigationEndpoint', 'watchPlaylistEndpoint', 'playlistId'],
        true
      );
      if (!watchId) {
        watchId = nav<never, any>(
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
    runs: { text: string }[];
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
  const ctoken = nav<never, any>(results, [
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

export function validatePlaylistId(playlistId: string): string {
  return !playlistId.startsWith('VL') ? playlistId : playlistId.slice(2);
}

// Need so many goddamn support types
// God bless: https://stackoverflow.com/questions/61624719/how-to-conditionally-detect-the-any-type-in-typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// If T is `any` a union of both side of the condition is returned.
type UnionForAny<T> = T extends never ? 'A' : 'B';

// Returns true if type is any, or false for any other type.
// type IsStrictlyAny<T> = UnionToIntersection<UnionForAny<T>> extends never
//   ? true
//   : false;

// Good enough recursive type... Correctly places all keys at correct depth,
// but is still possible to call keys on the wrong values.
// This is a limitation of the keyof T, which unions all the properties at that depth.
type navNode<T> = UnionToIntersection<UnionForAny<T>> extends never
  ? any
  : T extends Array<infer Item>
  ? //@ts-expect-error: This works
    [number?, ...isNavNodeable<Item>]
  : T extends Record<string, any>
  ? [(keyof T)?, ...isNavNodeable<T[keyof T]>]
  : [];
type isNavNodeable<T> = T extends Array<any>
  ? navNode<T>
  : T extends Record<string, any>
  ? navNode<T>
  : unknown;

type navNodeTestObj = {
  matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  nestedObj: {
    nestedObj2a: 'a';
    nestedObj2b: 'b';
  };
  objectInArray: Array<{ object: { objectChild: 'deep!' } }>;
  unknown: unknown;
  arrayUnknown: [unknown];
};
type navNodeTest = navNode<navNodeTestObj>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const navNodeTest1: navNodeTest = ['matrix', 1, 2];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const navNodeTest2: navNodeTest = ['nestedObj', 'nestedObj2a'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const navNodeTest3: navNodeTest = ['objectInArray', 1, 'object', 'objectChild'];

export function nav<T extends Record<string, any> | Array<any>, U = any>(
  root: T,
  items: navNode<T>,
  nullIfAbsent?: boolean
): U;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function nav<T extends never, U = any>(
  root: any | null,
  items: (string | number)[],
  nullIfAbsent?: boolean
): U;
export function nav(
  root: any | null,
  items: (string | number)[],
  nullIfAbsent?: boolean
): any;
export function nav<T extends Record<string, any> | Array<any> | never, U>(
  root: T | null,
  items: (string | number)[] | navNode<T>,
  nullIfAbsent = false
): U | null {
  // """Access a nested object in root by item sequence."""
  try {
    if (root) {
      for (const k of items) {
        //@ts-expect-error: There's no real good way to type this function
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        root = root![k];
      }
      return root as any;
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
