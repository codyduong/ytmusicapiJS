import * as helpers from './helpers';
import { json } from './pyLibraryMock';
import * as fs from 'fs';

// const path = os.path.dirname(os.path.realpath(__file__)) + os.sep
// Is this used for anything...? @sigma67
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _path = __filename;

export function setup(filepath: any, headersRaw: string): string {
  const contents = [];
  let userHeaders: Record<string, any> = {};
  if (!headersRaw) {
    if (process) {
      const eof =
        // eslint-disable-next-line prettier/prettier
        process.platform != 'win32' ? 'Ctrl-D' : '\'Enter, Ctrl-Z, Enter\'';
      console.log(
        `Please paste the request headers from Firefox and press ${eof} to continue:`
      );
      // eslint-disable-next-line no-constant-condition
      while (true) {
        //@CODYDUONG TODO double-check setup behavior
        let line;
        try {
          line = prompt('');
        } catch (e: any) {
          if (e) break;
          else throw new Error(e.toString());
        }
        contents.push(line);
      }
    } else {
      throw new Error('headersRaw must be provided in jsdom!');
    }
    try {
      for (const content of contents) {
        const header = content?.split(': ') ?? [];
        if (header.length == 1 || header[0] == ':') {
          // nothing was split or chromium headers
          continue;
        }
        userHeaders[header[0].toLowerCase()] = header.slice(1).join(': ');
      }
    } catch (e) {
      throw new Error(
        'Error parsing your input, please try again. Full error: ' + String(e)
      );
    }
  }

  userHeaders = json.load(headersRaw);
  for (const key of Object.keys(userHeaders)) {
    userHeaders[key.toLowerCase()] = userHeaders[key];
  }
  const missing_headers = ['cookie', 'x-goog-authuser'].filter(
    (reqKey) => !(reqKey in userHeaders)
  );
  if (missing_headers.length > 0) {
    throw new Error(
      `The following entries are missing in your headers: ${missing_headers.join(
        ', '
      )}\n
            Please try a different request (such as /browse) and make sure you are logged in.`
    );
  }
  const ignore_headers = [
    'host',
    'content-length',
    'accept-encoding',
    'Host',
    'Content-Length',
    'Accept-Encoding',
  ];
  for (const i of ignore_headers) {
    delete userHeaders[i];
  }

  const initHeaders = helpers.initializeHeaders();
  userHeaders = { ...userHeaders, initHeaders };
  const headers = userHeaders;

  if (filepath) {
    if (fs) {
      fs.writeFile(
        filepath,
        json.dump(headers, {
          ensureAscii: true,
          indent: 4,
        }),
        (err: any) => {
          if (err) {
            throw new Error(String(err));
          }
        }
      );
    } else {
      console.warn(
        `Setup with filepath is not supported in jsdom! This parameter filepath: ${filepath} will not do anything.`
      );
    }
  }

  return json.dumps(headers);
}
