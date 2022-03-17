import { re, json, time, locale, SimpleCookie } from './pyLibraryMock';
import * as utf8 from 'utf8';
import * as constants from './constants';
import { createHash } from 'crypto';

import type { Headers } from './types';

// @CODYDUONG TODO type better
export function prepareLikeEndpoint(rating: any): string | null {
  if (rating === 'LIKE') {
    return 'like/like';
  } else if (rating === 'DISLIKE') {
    return 'like/dislike';
  } else if (rating === 'INDIFFERENT') {
    return 'like/removelike';
  } else {
    return null;
  }
}

// This validation function is not needed in TypeScript?
export function validateOrderParameters(order: string | undefined): void {
  const orders = ['a_to_z', 'z_to_a', 'recently_added'];
  if (order && !orders.includes(order)) {
    throw Error(
      'Invalid order provided. Please use one of the following orders or leave out the parameter: ' +
        orders.join(', ')
    );
  }
}

// @CODYDUONG TODO type better
export function prepareOrderParams(order: any): string | undefined {
  const orders = ['a_to_z', 'z_to_a', 'recently_added'];
  if (order) {
    // determine order_params via `.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[1].itemSectionRenderer.header.itemSectionTabbedHeaderRenderer.endItems[1].dropdownRenderer.entries[].dropdownItemRenderer.onSelectCommand.browseEndpoint.params` of `/youtubei/v1/browse` response
    const orderParams = ['ggMGKgQIARAA', 'ggMGKgQIARAB', 'ggMGKgQIABAB'];
    return orderParams[orders.indexOf(order)];
  }
}

// @CODYDUONG TODO type better
export function initializeHeaders(): Headers {
  return {
    'user-agent': constants.USER_AGENT,
    accept: '*/*',
    'accept-encoding': 'gzip, deflate',
    'content-type': 'application/json',
    'content-encoding': 'gzip',
    origin: constants.YTM_DOMAIN,
  };
}

// @CODYDUONG TODO type better
export function initializeContext(): any {
  return {
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion: '0.1',
      },
      user: {},
    },
  };
}

// @CODYDUONG TODO type better
export async function getVisitorId(
  requestFunc: (
    this: any,
    url: string,
    params?: Record<string, any>
  ) => Promise<string>
): Promise<{ 'X-Goog-Visitor-Id': string }> {
  const response = await requestFunc(constants.YTM_DOMAIN);
  const matches = re.findall(/ytcfg\.set\s*\(\s*({.+?})\s*\)\s*;/, response);
  let visitorId = '';
  if (matches.length > 0) {
    const ytcfg = json.loads(matches[0]);
    visitorId = ytcfg?.VISITOR_DATA;
  }
  return { 'X-Goog-Visitor-Id': visitorId };
}

export function htmlToText(htmlText: string): any {
  const tags = re.findall(/<[^>]+>/, htmlText);
  for (const tag in tags) {
    htmlText = htmlText.replace(tag, '');
  }
  return htmlText;
}

export function sapisidFromCookie(_rawCookie: any): any {
  const cookie = new SimpleCookie();
  cookie.load(_rawCookie);
  return cookie['__Secure-3PAPISID'];
}

// // SAPISID Hash reverse engineered by
// // https://stackoverflow.com/a/32065323/5726546
export function getAuthorization(auth: any): string {
  const sha_1 = createHash('sha1');
  const unix_timestamp = Math.trunc(time.time()).toString();
  sha_1.update(utf8.encode(unix_timestamp + ' ' + auth));
  return 'SAPISIDHASH ' + unix_timestamp + '_' + sha_1.digest('hex');
}

export function getDatestamp(): any {
  return Math.floor(Date.now() / 8.64e7);
}

export function toInt(string: string): any {
  const numberString = re.sub(/^\\d/, '', string);
  let intValue: number;
  try {
    intValue = locale.atoi(numberString);
  } catch (e) {
    if (e instanceof TypeError) {
      const numberString2 = numberString.replace(',', '');
      intValue = parseInt(numberString2);
    } else {
      throw e;
    }
  }

  return intValue;
}

function zip<T, U>(arr1: Array<T>, arr2: Array<U>): Array<[T, U]> {
  return arr1.map((k, i) => [k, arr2[i]]);
}
function sum(arr: Array<number>): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function parseDuration(duration: string | undefined): number {
  if (!duration) {
    return Number(duration);
  }
  const mappedIncrements = zip([1, 60, 3600], duration.split(':').reverse());
  const seconds = sum(
    mappedIncrements.map(([multiplier, time]) => multiplier * parseInt(time))
  );
  return seconds;
}

export function sumTotalDuration(item: any): number {
  return sum(
    item.tracks.map(
      ({ track }: { track?: { duration_seconds?: number } }) =>
        track?.duration_seconds ?? 0
    )
  );
}
