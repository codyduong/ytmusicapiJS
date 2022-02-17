// import requests
// import gettext
// import os
// from requests.structures import CaseInsensitiveDict
// from functools import partial
// from contextlib import suppress
// from typing import Dict
// from ytmusicapi.helpers import *
// from ytmusicapi.parsers import browsing
// from ytmusicapi.setup import setup
// from ytmusicapi.mixins.browsing import BrowsingMixin
// from ytmusicapi.mixins.watch import WatchMixin
// from ytmusicapi.mixins.explore import ExploreMixin
// from ytmusicapi.mixins.library import LibraryMixin
// from ytmusicapi.mixins.playlists import PlaylistsMixin
// from ytmusicapi.mixins.uploads import UploadsMixin

import { json } from './pyLibraryMock';
import * as helpers from './helpers';

// BrowsingMixin, WatchMixin, ExploreMixin, LibraryMixin, PlaylistsMixin, UploadsMixin
class _YTMusic {
  auth: string;
  _session: any;
  proxies: any;
  headers: any;
  context: any;
  language: string;
  lang: any;
  parser: any;
  sapisid: any;
  /**
    Allows automated interactions with YouTube Music by emulating the YouTube web client's requests.
    Permits both authenticated and non-authenticated requests.
    Authentication header data must be provided on initialization.
     */
  constructor(
    auth: string,
    user: string,
    _requests_session: any,
    proxies: any,
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
    if (auth) {
      try {
        // if os.path.isfile(auth) {
        if (true) {
          // const file = auth;
          // with open(file) as json_file:
          //     this.headers = CaseInsensitiveDict(json.load(json_file))
        } else {
          this.headers = CaseInsensitiveDict(json.loads(auth));
        }
      } catch (e) {
        console.log(
          'Failed loading provided credentials. Make sure to provide a string or a file path.\nReason: ',
          String(e)
        );
      }
    } else {
      // no authentication
      this.headers = helpers.initializeHeaders();
    }
    // if 'x-goog-visitor-id' not in this.headers:
    //     this.headers.update(get_visitor_id(this._send_get_request))

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
    // this.parser = browsing.Parser(this.lang)

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
  // #sendRequest(this, endpoint: str, body: Dict, additionalParams: str = "") -> Dict:
  //     body.update(this.context)
  //     if this.auth:
  //         origin = this.headers.get('origin', this.headers.get('x-origin'))
  //         this.headers["Authorization"] = get_authorization(this.sapisid + ' ' + origin)
  //     response = this._session.post(YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams,
  //                                   json=body,
  //                                   headers=this.headers,
  //                                   proxies=this.proxies)
  //     response_text = json.loads(response.text)
  //     if response.status_code >= 400:
  //         message = "Server returned HTTP " + str(
  //             response.status_code) + ": " + response.reason + ".\n"
  //         error = response_text.get('error', {}).get('message')
  //         raise Exception(message + error)
  //     return response_text

  // #sendGetRequest(this, url: str, params: Dict = None):
  //     response = this._session.get(url, params=params, headers=this.headers, proxies=this.proxies)
  //     return response.text

  // #checkAuth(this):
  //     if not this.auth:
  //         raise Exception("Please provide authentication before using this function")

  // @classmethod
  // setup(cls, filepath: str = None, headers_raw: str = None) -> Dict:
  //     /**
  //     Requests browser headers from the user via command line
  //     and returns a string that can be passed to YTMusic()
  //     :param filepath: Optional filepath to store headers to.
  //     :param headers_raw: Optional request headers copied from browser.
  //         Otherwise requested from terminal
  //     :return: configuration headers string
  //     */
  //     return setup(filepath, headers_raw)

  // def __enter__(this):
  //     return this

  // def __exit__(this, execType=None, execValue=None, trackback=None):
  //     pass
}

function CaseInsensitiveDict(_arg0: Record<string, any>): any {
  throw new Error('Function not implemented.');
}

export class YTMusic extends _YTMusic {}
