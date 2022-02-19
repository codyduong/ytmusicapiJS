import { CaseInsensitiveObject, json } from './pyLibraryMock';
import { YTM_BASE_API, YTM_PARAMS } from './constants';
import * as fs from 'fs';

import * as helpers from './helpers';
import { Parser } from './parsers/browsing';
import { setup } from './setup';
import { BrowsingMixin } from './mixins/browsing';
import { WatchMixin } from './mixins/watch';
import { ExploreMixin } from './mixins/explore';

import type { Headers } from './types';
import axios from 'axios';

// BrowsingMixin, WatchMixin, ExploreMixin, LibraryMixin, PlaylistsMixin, UploadsMixin
export class _YTMusic {
  auth: string | null;
  // _agent: https.Agent;
  proxies: any;
  headers: Headers;
  context: any;
  language: string;
  lang: any;
  parser: Parser;
  sapisid: any;

  /**
   * Create a new instance to interact with YouTube Music.
   * @param {string} [auth=]  Provide a string or path to file.
Authentication credentials are needed to manage your library.
Should be an adjusted version of `headers_auth.json.example` in the project root.
See :py:func:`setup` for how to fill in the correct credentials.
Default: A default header is used without authentication.
   * @param {string} [user=]  Specify a user ID string to use in requests.
This is needed if you want to send requests on behalf of a brand account.
Otherwise the default account is used. You can retrieve the user ID
by going to https://myaccount.google.com/brandaccounts and selecting your brand account.
The user ID will be in the URL: https://myaccount.google.com/b/user_id/
   * @param proxies Optional. Proxy configuration in requests_ format_.

_requests: https://requests.readthedocs.io/ 

_format: https://requests.readthedocs.io/en/master/user/advanced/#proxies
   * @param {string} [language] Optional. Can be used to change the language of returned data.
English will be used by default. Available languages can be checked in
the ytmusicapi/locales directory.
   * @returns 
   */
  constructor(
    auth?: string,
    user?: string,
    // https_agent?: boolean | https.Agent,
    proxies?: Record<string, any>,
    language?: string
  ) {
    this.auth = auth ?? null;

    // if (https_agent instanceof https.Agent) {
    //   this._https = https_agent;
    // } else {
    //   if (https_agent) {
    //     // Build a new session.
    //     this._https = new https.Agent({
    //       timeout: 30000,
    //     });
    //   } else {
    //     // Use the Requests API module as a "session".
    //     this._https = https.api;
    //   }
    // }

    this.proxies = proxies;

    // prepare headers

    this.headers = helpers.initializeHeaders();
    if (auth && fs.existsSync(auth)) {
      const file = auth;
      fs.readFile(file, (err, data) => {
        if (err) {
          console.warn(
            'Failed loading provided credentials. Make sure to provide a string or a file path.\nReason: ',
            String(err)
          );
        }
        this.headers = CaseInsensitiveObject<Headers>(json.load(data));
      });
    } else if (auth) {
      this.headers = CaseInsensitiveObject<Headers>(json.loads(auth));
    }

    //TODO check if the IIAFE breaks this or not...
    if (!this.headers['x-goog-visitor-id']) {
      let helpersGetVisitorId: Record<string, any> = {};
      (async (): Promise<void> => {
        helpersGetVisitorId = await helpers.getVisitorId(this._sendGetRequest);
      })();

      this.headers = {
        ...this.headers,
        ...helpersGetVisitorId,
      };
    }

    // prepare context
    this.context = helpers.initializeContext();
    this.context['context']['client']['hl'] = language;
    // locale_dir = os.path.abspath(os.path.dirname(__file__)) + os.sep + 'locales'
    // const supported_languages = [f for f in os.listdir(locale_dir)]
    // if (language not in supported_languages) {
    //     raise Exception("Language not supported. Supported languages are "
    //                     ', '.join(supported_languages))
    //                   }
    this.language = language ?? ''; //todo @codyduong
    try {
      // locale.setlocale(locale.LC_ALL, this.language);
    } catch (e) {
      // with suppress(locale.Error):
      // locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    }

    // this.lang = gettext.translation('base',
    //                                 localedir=locale_dir,
    //                                 languages=[language])
    this.parser = new Parser(this.lang);

    if (user) {
      this.context['context']['user']['onBehalfOfUser'] = user;
    }

    // verify authentication credentials work
    if (auth) {
      const cookie = this.headers.cookie;
      if (cookie) {
        this.sapisid = helpers.sapisidFromCookie(cookie);
      } else {
        throw new Error(
          'Your cookie is missing the required value __Secure-3PAPISID'
        );
      }
    }
  }

  async _sendRequest<T extends Record<string, any>>(
    endpoint: string,
    body: Record<string, any>,
    ...additionalParams: string[]
  ): Promise<T> {
    body = { ...body, ...this.context };
    if (this.auth) {
      const origin = this.headers['origin'] ?? this.headers['x-origin'];
      this.headers['authorization'] = helpers.getAuthorization(
        this.sapisid + ' ' + origin
      );
    }

    // console.log(YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams, body, {
    //   headers: this.headers,
    //   proxy: this.proxies,
    // });
    const response = await axios.post(
      YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams,
      JSON.stringify(body),
      {
        headers: this.headers,
        proxy: this.proxies,
      }
    );
    const responseText = response.data;
    if (response.status >= 400) {
      const message =
        'Server returned HTTP ' +
        String(response.status) +
        ': ' +
        response.statusText +
        '.\n';
      const error = responseText.error?.message;
      throw new Error(message + error);
    }
    return responseText;
  }

  async _sendGetRequest(
    url: string,
    params?: Record<string, any>
  ): Promise<string> {
    const response = await axios.get(url, {
      params: params,
      headers: this?.headers,
      proxy: this?.proxies,
    });
    return response.data;
  }

  _checkAuth(): void {
    if (!this.auth) {
      throw new Error(
        'Please provide authentication before using this function'
      );
    }
  }

  // @classmethod
  static setup(
    // cls,
    filepath: string,
    headers_raw: string
  ): string {
    /**
      Requests browser headers from the user via command line
      and returns a string that can be passed to YTMusic()
      :param filepath: Optional filepath to store headers to.
      :param headers_raw: Optional request headers copied from browser.
          Otherwise requested from terminal
      :return: configuration headers string
      */
    return setup(filepath, headers_raw);
  }

  // def __enter__(this):
  //     return this

  // def __exit__(this, execType=None, execValue=None, trackback=None):
  //     pass
}

const YTMusic = ExploreMixin(WatchMixin(BrowsingMixin(_YTMusic)));
export default YTMusic;
