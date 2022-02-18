// import os
// import platform
import * as helpers from './helpers';
import { json } from './pyLibraryMock';
import * as fs from 'fs';

// const path = os.path.dirname(os.path.realpath(__file__)) + os.sep
// Is this used for anything...? @sigma67
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _path = __filename;

export function setup(filepath: any, headers_raw: string): string {
  let contents = [];
  if (!headers_raw) {
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
    contents = headers_raw.split('\n');
  }
  let userHeaders: Record<string, any> = {};
  try {
    for (const content in contents) {
      const header = content.split(': ');
      if (header.length == 1 || header[0] == ':') {
        // nothing was split or chromium headers
        continue;
      }
      userHeaders[header[0].toLowerCase()] = header.slice(1).join(': ');
    } //': '.join(header[1:])
  } catch (e) {
    throw new Error(
      'Error parsing your input, please try again. Full error: ' + String(e)
    );
  }

  //let missing_headers = {"cookie", "x-goog-authuser"} - set(k.lower() for const k in user_headers.keys())
  const missing_headers = ['cookie', 'x-goog-authuser'].filter(
    (reqKey) => !(reqKey in Object.keys(userHeaders))
  );
  if (missing_headers) {
    throw new Error(
      `The following entries are missing in your headers: ${missing_headers.join(
        ', '
      )}\n
            Please try a different request (such as /browse) and make sure you are logged in.`
    );
  }
  const ignore_headers = ['host', 'content-length', 'accept-encoding'];
  for (const i in ignore_headers) {
    userHeaders.delete(i);
  }

  const initHeaders = helpers.initializeHeaders();
  userHeaders = { ...userHeaders, initHeaders };
  const headers = userHeaders;

  if (filepath) {
    fs.writeFile(
      filepath,
      json.dump(headers, {
        ensureAscii: true,
        indent: 4,
      }),
      (err: any) => {
        throw new Error(String(err));
      }
    );
  }

  return json.dumps(headers);
}
