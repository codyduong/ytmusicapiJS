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

// BrowsingMixin, WatchMixin, ExploreMixin, LibraryMixin, PlaylistsMixin, UploadsMixin
export class _YTMusic {
  auth: string;
  _session: any;
  proxies: any;
  headers: Headers;
  context: any;
  language: string;
  lang: any;
  parser: Parser;
  sapisid: any;
  /**
    Allows automated interactions with YouTube Music by emulating the YouTube web client's requests.
    Permits both authenticated and non-authenticated requests.
    Authentication header data must be provided on initialization.
     */
  constructor(
    auth: string,
    user: string,
    requests_session: boolean,
    proxies: Record<string, any>,
    language: string
  ) {
    /** 
        Create a new instance to interact with YouTube Music.
        :param auth: Optional. Provide a string or path to file.
          Authentication credentials are needed to manage your library.
          Should be an adjusted version of `headers_auth.json.example` in the project root.
          See :py:func:`setup` for how to fill in the correct credentials.
          Default: A default header is used without authentication.
        :param user: Optional. Specify a user ID string to use in requests.
          This is needed if you want to send requests on behalf of a brand account.
          Otherwise the default account is used. You can retrieve the user ID
          by going to https://myaccount.google.com/brandaccounts and selecting your brand account.
          The user ID will be in the URL: https://myaccount.google.com/b/user_id/
        :param requests_session: A Requests session object or a truthy value to create one.
          Default sessions have a request timeout of 30s, which produces a requests.exceptions.ReadTimeout.
          The timeout can be changed by passing your own Session object::
            s = requests.Session()
            s.request = functools.partial(s.request, timeout=3)
            ytm = YTMusic(session=s)
          A falsy value disables sessions.
          It is generally a good idea to keep sessions enabled for
          performance reasons (connection pooling).
        :param proxies: Optional. Proxy configuration in requests_ format_.
            .. _requests: https://requests.readthedocs.io/
            .. _format: https://requests.readthedocs.io/en/master/user/advanced/#proxies
        :param language: Optional. Can be used to change the language of returned data.
            English will be used by default. Available languages can be checked in
            the ytmusicapi/locales directory.
        */
    this.auth = auth;

    // if isinstance(requests_session, requests.Session):
    //     this._session = requests_session
    // else:
    //     if requests_session:  # Build a new session.
    //         this._session = requests.Session()
    //         this._session.request = partial(this._session.request, timeout=30)
    //     else:  # Use the Requests API module as a "session".
    //         this._session = requests.api

    this.proxies = proxies;

    // prepare headers

    //We put this before in this logic loop, since TS gets mad otherwise... Control flow inference is messed up?
    this.headers = helpers.initializeHeaders();
    if (auth && fs.existsSync(auth)) {
      const file = auth;
      fs.readFile(file, (err, data) => {
        if (err) {
          console.log(
            'Failed loading provided credentials. Make sure to provide a string or a file path.\nReason: ',
            String(err)
          );
        }
        this.headers = CaseInsensitiveObject<Headers>(json.load(data));
      });
    } else {
      this.headers = CaseInsensitiveObject<Headers>(json.loads(auth));
    }

    //@CODYDUONG TODO the CaseInsensitiveObject might have to be checked for proper implementation,
    //as we set/access a lot of keys with varying consistency in casing... god damnit.
    if (!this.headers['x-goog-visitor-id']) {
      this.headers = {
        ...this.headers,
        ...helpers.getVisitorId(this._sendGetRequest),
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
    this.language = language;
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

  _sendRequest<T extends Record<string, any>>(
    endpoint: string,
    body: Record<string, any>,
    ...additionalParams: string[]
  ): T {
    body = Object.create(body, this.context);
    if (this.auth) {
      const origin = this.headers['origin'] ?? this.headers['x-origin'];
      this.headers['authorization'] = helpers.getAuthorization(
        this.sapisid + ' ' + origin
      );
    }
    const response = this._session.post(
      YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams,
      body,
      this.headers,
      this.proxies
    );
    const response_text = json.loads(response.text);
    if (response.status_code >= 400) {
      const message =
        'Server returned HTTP ' +
        String(response.status_code) +
        ': ' +
        response.reason +
        '.\n';
      const error = response_text.get('error', {}).get('message');
      throw new Error(message + error);
    }
    return response_text;
  }

  _sendGetRequest(url: string, params?: Record<string, any>): string {
    const response = this._session.get(url, params, this.headers, this.proxies);
    return response.text;
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

export const YTMusic = ExploreMixin(WatchMixin(BrowsingMixin(_YTMusic)));
