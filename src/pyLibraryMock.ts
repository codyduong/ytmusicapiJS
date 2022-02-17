//This library mocks some python libraries, using JS replacements.
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
};

export const json = {
  loads: (text: string): Record<string, any> => JSON.parse(text),
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
