//This library mocks some python libraries, using JS replacements.
//It is not a complete substitute of these libraries, but instead mocks the necessary features only.
//For ease of reading code from the original library and vice/versa

export const re = {
  findall: function (regex: RegExp, string: string): string[] {
    const hits = [];
    // Iterate hits
    let match = null;
    do {
      match = regex.exec(string);
      if (match) {
        hits.push(match[0]);
      }
    } while (match);
    return hits;
  },
  split: (regex: RegExp, string: string): string[] => string.split(regex),
  search: (regex: RegExp, string: string): RegExpMatchArray | null =>
    string.match(regex),
  match: (regex: RegExp, string: string): RegExpMatchArray | null =>
    string.match(regex),
  sub: (regex: RegExp, replaceValue: string, string: string): string =>
    string.replace(regex, replaceValue),
};

const convertToAsciiSafe = (string: string): string =>
  string.replace(/[\u007F-\uFFFF]/g, function (chr) {
    return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
  });

export const json = {
  loads: <T>(text: string): T | any => JSON.parse(text),
  //Handles buffer input
  load: <T>(text: string | Buffer): T | any => JSON.parse(text.toString()),
  dumps: (value: any): string => JSON.stringify(value),
  //Handles file output
  dump: (
    value: any,
    {
      ensureAscii = false,
      indent = 4,
    }: { ensureAscii?: boolean; indent?: number }
  ): string => {
    if (ensureAscii) {
      return convertToAsciiSafe(JSON.stringify(value, null, indent));
    } else {
      return JSON.stringify(value, null, indent);
    }
  },
};

export const time = {
  time: (): number => new Date().getTime() / 1000,
};

//I'm not sure if this implementation is the same @codyduong
export const locale = {
  atoi: (string: string): number => {
    const numbered = Number(string);
    if (isNaN(numbered)) {
      throw new TypeError('Could not convert to number');
    }
    return parseInt(numbered.toFixed(0));
  },
  setlocale: (_value: any, _value2: any): void => {
    throw new Error('Function not implemented.');
  },
};

export const CaseInsensitiveObject = <T extends Record<string, any>>(
  object: T
): T => ({
  ...(Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k.toLowerCase(), v])
  ) as T),
});

export class SimpleCookie {
  '__Secure-3PAPISID': any;

  load(cookie: string): void {
    const cookieArrayed = cookie.split('; ');
    for (const keyedPair of cookieArrayed) {
      const splitPair = keyedPair.split('=');
      if (splitPair[0] === '__Secure-3PAPISID') {
        this['__Secure-3PAPISID'] = splitPair[1];
        break;
      }
    }
  }
}

export const isDigit = (s: string): boolean => /^\d+$/.test(s);
