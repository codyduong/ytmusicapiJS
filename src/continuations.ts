import { nav } from '@codyduong/nav';
import { parsePlaylistItemsReturn } from './parsers/playlists.types';

export async function getContinuations(
  results: any,
  continuation_type: string | number,
  limit: number | undefined | null,
  requestFunc: (arg1: any) => Promise<Record<string, any>>,
  parse_func: (arg1: any) => any,
  ctokenPath = ''
): Promise<Array<any>> {
  let items: any[] = [];
  while ('continuations' in results && (!limit || items.length < limit)) {
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
