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

//I'm not sure if this implementation is the same
export const locale = {
  atoi: (string: string): number => parseInt(string),
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
  ...(Object.fromEntries(
    Object.entries(object).map(([k, v]) => [
      `${k.slice(0, 1).toUpperCase}${k.slice(1)}`,
      v,
    ])
  ) as T),
});
