import CaseInsensitiveObject from 'case-insensitive-object';
import { json } from './pyLibraryMock';
import { YTM_BASE_API, YTM_PARAMS } from './constants';
import * as fs from 'fs';

import * as helpers from './helpers';
import { Parser } from './parsers/browsing';
import { setup } from './setup';

import type { Headers } from './types';
import axios, { AxiosProxyConfig } from 'axios';
import https from 'https';

type _YTMusicConstructorOptions = {
  auth?: string;
  user?: string;
  httpsAgent?: boolean | https.Agent;
  proxies?: AxiosProxyConfig | false;
  language?: string;
};

import i18next from 'i18next';
import { en, de, es, it, fr, ja, ko, zh_CN } from './locales';

if (typeof process != 'undefined') {
  axios.defaults.adapter = require('axios/lib/adapters/http');
}

export class _YTMusic {
  #auth: string | null;
  #httpsAgent: https.Agent | undefined;
  _proxies?: AxiosProxyConfig | false;
  _headers: Headers;
  #context: any;
  #language: string | undefined;
  _parser: Parser;
  #sapisid: any;

  /**
   * This is an internal class, please use {@link YTMusic}
   * @param {_YTMusicConstructorOptions} [options=] Options object.
   * @param {string | object} [options.auth=]  Provide a string (raw headers), object, or path (Node only!),
   * Authentication credentials are needed to manage your library.
   * Should be an adjusted version of `headers_auth.json.example` in the project root.
   * See `setup` for how to fill in the correct credentials.
   * If not provided, a default header is used without authentication.
   * @param {string} [options.user=]  Specify a user ID string to use in requests.
   * This is needed if you want to send requests on behalf of a brand account.
   * Otherwise the default account is used. You can retrieve the user ID
   * by going to https://myaccount.google.com/brandaccounts and selecting your brand account.
   * The user ID will be in the URL: https://myaccount.google.com/b/user_id/
   * @param {} [options.httpsAgent] Optional. Define an HTTP proxy for your request.
   * @param {AxiosProxyConfig} [options.proxies] Optional. Define an HTTP proxy for your request.
   * @param {string} [options.language] Optional. Can be used to change the language of returned data.
   * English will be used by default. Available languages can be checked in
   * the ytmusicapi/locales directory.
   * @access private
   */
  constructor(options?: _YTMusicConstructorOptions) {
    const {
      auth: auth,
      user: user,
      proxies: proxies,
      language: language = 'en',
      httpsAgent,
    } = options ?? {};

    this.#auth = auth ?? null;

    if (typeof httpsAgent === 'boolean') {
      if (httpsAgent) {
        this.#httpsAgent = new https.Agent({
          timeout: 30000,
        });
      } else {
        this.#httpsAgent = undefined;
      }
    } else {
      this.#httpsAgent = httpsAgent;
    }

    this._proxies = proxies;

    // prepare headers

    this._headers = helpers.initializeHeaders();
    if (typeof auth == 'object') {
      this._headers = auth;
    } else if (auth && fs && fs.existsSync(auth)) {
      const file = auth;
      const data = fs.readFileSync(file);
      this._headers = CaseInsensitiveObject<Headers>(json.load(data));
    } else if (auth) {
      this._headers = CaseInsensitiveObject<Headers>(json.loads(auth));
    }

    //TODO check if the IIAFE breaks this or not...
    if (!this._headers?.['x-goog-visitor-id']) {
      let helpersGetVisitorId: Record<string, any> = {};
      (async (): Promise<void> => {
        helpersGetVisitorId = await helpers.getVisitorId(this._sendGetRequest);
      })();

      this._headers = {
        ...this._headers,
        ...helpersGetVisitorId,
      };
    }

    // prepare context
    this.#context = helpers.initializeContext();
    this.#context['context']['client']['hl'] = language;

    this.#language = language;
    const supportedLanguages = ['en', 'de', 'es', 'fr', 'it', 'ja'];
    if (!supportedLanguages.includes(language)) {
      console.warn(
        `The language '${language}' is not supported.\nSupported languages are ${supportedLanguages.join(
          ', '
        )}\nYTMusicAPI will still work, but some functions such as search or get_artist may not work. See https://github.com/codyduong/ytmusicapiJS/tree/main/src/locales for more details.`
      );
    }
    if (i18next.isInitialized && i18next.language != language) {
      throw new Error(
        'Multiple instances of YTMusic are not supported with different languages, please use changeLangauge instance function instead!'
      );
    } else {
      (async (): Promise<void> => {
        await i18next.init({
          lng: language ?? 'en',
          //debug: true,
          resources: {
            en,
            de,
            es,
            fr,
            it,
            ja,
            ko,
            zh_CN,
          },
        });
      })();
    }

    this._parser = new Parser();

    if (user) {
      this.#context['context']['user']['onBehalfOfUser'] = user;
    }

    // verify authentication credentials work
    if (auth) {
      const cookie = this._headers.cookie;
      if (cookie) {
        this.#sapisid = helpers.sapisidFromCookie(cookie);
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
    additionalParams = ''
  ): Promise<T> {
    body = { ...body, ...this.#context };

    if (this.#auth) {
      const origin = this._headers['origin'] ?? this._headers['x-origin'];
      this._headers['authorization'] = helpers.getAuthorization(
        this.#sapisid + ' ' + origin
      );
    }

    // console.log(YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams, body, {
    //   headers: this._headers,
    //   proxy: this._proxies,
    // });
    const response = await axios.post(
      YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams,
      JSON.stringify(body),
      {
        headers: this._headers,
        proxy: this._proxies,
        httpsAgent: this.#httpsAgent,
      }
    );
    //console.log(response);
    const responseText = response.data;

    return responseText;
  }

  async _sendGetRequest(
    url: string,
    params?: Record<string, any>
  ): Promise<string> {
    const response = await axios.get(url, {
      params: params,
      headers: this?._headers,
      proxy: this?._proxies,
      httpsAgent: this.#httpsAgent,
    });
    return response.data;
  }

  checkAuth(): this | null {
    if (!this.#auth) {
      return null;
    } else {
      return this;
    }
  }

  _checkAuth(): void {
    if (!this.#auth) {
      throw new Error(
        'Please provide authentication before using this function'
      );
    }
  }

  getAuth(): string | null {
    return this.#auth;
  }

  /**
   * Requests browser headers from the user via command line
   * and returns a string that can be passed to YTMusic()
   */
  static setup(options: { filepath?: string; headersRaw: string }): string;
  static setup(options: { filepath: string; headersRaw?: string }): string;
  static setup(options: { filepath: string; headersRaw: string }): string {
    const { filepath, headersRaw } = options;

    return setup(filepath, headersRaw);
  }

  async changeLanguage(language: string): Promise<void> {
    this.#language = language;
    this.#context['context']['client']['hl'] = language;
    const changeLanguage = new Promise<void>((resolve, reject) => {
      i18next.changeLanguage(language, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await changeLanguage;
  }

  getLanguage(): string | undefined {
    return this.#language;
  }

  getProxy(): AxiosProxyConfig | boolean | undefined {
    return this._proxies;
  }
}
