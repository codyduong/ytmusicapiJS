// import re
// import json
// from http.cookies import SimpleCookie
// from hashlib import sha1
// import time
// from datetime import date
// from functools import wraps
// import locale
// from ytmusicapi.constants import *

import { re, json, time, locale } from './pyLibraryMock';
import * as utf8 from 'utf8';
import * as constants from './constants';
import * as crypto from 'crypto';

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

// This validation function is not needed in TypeScript
// function validate_order_parameter(order):
//     const orders = ['a_to_z', 'z_to_a', 'recently_added']
//     if order and order not in orders:
//         raise Exception(
//             "Invalid order provided. Please use one of the following orders or leave out the parameter: "
//             + ', '.join(orders))

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
export function initializeHeaders(): any {
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
export function getVisitorId(requestFunc: (value: string) => any): any {
  const response = requestFunc(constants.YTM_DOMAIN);
  const matches = re.findall(/ytcfg\.set\s*\(\s*({.+?})\s*\)\s*;/, response);
  let visitorId = '';
  if (matches.length > 0) {
    const ytcfg = json.loads(matches[0]);
    visitorId = ytcfg?.VISITOR_DATA;
  }
  return { 'X-Goog-Visitor-Id': visitorId };
}

// @CODYDUONG TODO type better
export function htmlToText(htmlText: string): any {
  const tags = re.findall(/<[^>]+>/, htmlText);
  for (const tag in tags) {
    htmlText = htmlText.replace(tag, '');
  }
  return htmlText;
}

// TODO
export function sapisidFromCookie(_rawCookie: any): any {
  // cookie = SimpleCookie()
  // cookie.load(raw_cookie)
  // return cookie['__Secure-3PAPISID'].value
}

// // SAPISID Hash reverse engineered by
// // https://stackoverflow.com/a/32065323/5726546
export function getAuthorization(auth: any): any {
  const sha_1 = crypto.createHash('sha1');
  const unix_timestamp = Math.round(time.time()).toString();
  sha_1.update(utf8.encode(unix_timestamp + ' ' + auth));
  return 'SAPISIDHASH ' + unix_timestamp + '_' + sha_1.digest('hex');
}

export function getDatestamp(): any {
  return Math.floor(Date.now() / 8.64e7);
}

export function toInt(string: string): any {
  const numberString = re.split(/[\x20\xa0]/, string)[0];
  // try:
  const intValue = locale.atoi(numberString);
  // except ValueError:
  //     number_string = number_string.replace(',', '')
  //     int_value = int(number_string)
  return intValue;
}

function zip<T, U>(arr1: Array<T>, arr2: Array<U>): Array<[T, U]> {
  return arr1.map((k, i) => [k, arr2[i]]);
}
function sum(arr: Array<number>): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function parse_duration(duration: string | undefined): any {
  if (!duration) {
    return duration;
  }
  const mappedIncrements = zip([1, 60, 3600], duration.split(':').reverse());
  const seconds = sum(
    mappedIncrements.map(([multiplier, time]) => multiplier * parseInt(time))
  );
  return seconds;
}

export function sumTotalDuration(item: any): any {
  return sum(
    item.tracks.map(
      ({ track }: { track: { duration_seconds?: number } }) =>
        track.duration_seconds ?? 0
    )
  );
}

// function i18n(method):
//     @wraps(method)
//     def _impl(self, *method_args, **method_kwargs):
//         method.__globals__['_'] = self.lang.gettext
//         return method(self, *method_args, **method_kwargs)

//     return _impl
