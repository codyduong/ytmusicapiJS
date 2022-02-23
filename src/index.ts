import { _YTMusic } from './ytmusic';
import { BrowsingMixin } from './mixins/browsing';
import { WatchMixin } from './mixins/watch';
import { ExploreMixin } from './mixins/explore';
import { LibraryMixin } from './mixins/library';
import { PlaylistsMixin } from './mixins/playlists';
import { UploadsMixin } from './mixins/uploads';

/**
 * Allows automated interactions with YouTube Music by emulating the YouTube web client's requests.
 * Permits both authenticated and non-authenticated requests.
 * Authentication header data must be provided on initialization.
 * @class
 * @param {string} [auth=]  Provide a string or path to file.
 * Authentication credentials are needed to manage your library.
 * Should be an adjusted version of `headers_auth.json.example` in the project root.
 * See `setup` for how to fill in the correct credentials.
 * If not provided, a default header is used without authentication.
 * @param {string} [user=]  Specify a user ID string to use in requests.
 * This is needed if you want to send requests on behalf of a brand account.
 * Otherwise the default account is used. You can retrieve the user ID
 * by going to https://myaccount.google.com/brandaccounts and selecting your brand account.
 * The user ID will be in the URL: https://myaccount.google.com/b/user_id/
 * @param proxies Optional. No usage in current API
 * @param {string} [language] Optional. Can be used to change the language of returned data.
 * English will be used by default. Available languages can be checked in
 * the ytmusicapi/locales directory.
 */
const YTMusic = UploadsMixin(
  PlaylistsMixin(
    LibraryMixin(ExploreMixin(WatchMixin(BrowsingMixin(_YTMusic))))
  )
);

export default YTMusic;
