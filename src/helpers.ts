import { re, json, time, locale, SimpleCookie } from './pyLibraryMock';
import * as utf8 from 'utf8';
import * as constants from './constants';
import type { Headers } from './types';
import { createHash } from 'crypto';

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
        clientVersion: '0.1', // '1.' + time.strftime("%Y%m%d", time.gmtime()) + '.01.00'
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

export function sapisidFromCookie(_rawCookie: any): any {
  const cookie = new SimpleCookie();
  cookie.load(_rawCookie.replace('\\', ''));
  return cookie['__Secure-3PAPISID'];
}

// SAPISID Hash reverse engineered by
// https://stackoverflow.com/a/32065323/5726546
export function getAuthorization(auth: any): string {
  const sha_1 = createHash('sha1');
  const unix_timestamp = Math.trunc(time.time()).toString();
  sha_1.update(utf8.encode(unix_timestamp + ' ' + auth));
  return 'SAPISIDHASH ' + unix_timestamp + '_' + sha_1.digest('hex');
}

export function toInt(string: string): number {
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

export function sumTotalDuration<T extends Record<string, any>>(
  item: T & { tracks: { duration_seconds?: number }[] }
): number {
  if (!('tracks' in item)) {
    return 0;
  }
  return sum(item.tracks.map((track) => track?.duration_seconds ?? 0));
}

//Removes any headers controlled by browser
export function clearUnsafeHeaders(o: Record<string, any>): void {
  if (window) {
    delete o['user-agent'];
    delete o['accept-encoding'];
    delete o['origin'];
  }
}
