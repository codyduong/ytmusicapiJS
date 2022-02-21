import { toInt } from '../helpers';
import {
  DESCRIPTION,
  MUSIC_SHELF,
  NAVIGATION_BROWSE_ID,
  RELOAD_CONTINUATION,
  SECTION_LIST_ITEM,
  SINGLE_COLUMN_TAB,
  SUBTITLE2,
  SUBTITLE3,
  THUMBNAIL_CROPPED,
  TITLE_TEXT,
} from '../parsers';
import { parsePlaylistItems } from '../parsers/playlists';
import { nav } from '../parsers/utils';
import { YTMusicBase } from './.mixin.helper';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const PlaylistMixin = <TBase extends YTMusicBase>(Base: TBase) => {
  return class PlaylistMixin extends Base {
    /**
     * Return a list of playlist items
     * @param {string} [_playlistId ] Playlist id.
     * @param {number} [_limit=100] How many songs to return.
     * @example <caption>Each item is in the following format</caption>
     * {
     *   "id": "PLQwVIlKxHM6qv-o99iX9R85og7IzF9YS_",
     *   "privacy": "PUBLIC",
     *   "title": "New EDM This Week 03/13/2020",
     *   "thumbnails": [...]
     *   "description": "Weekly r/EDM new release roundup. Created with github.com/sigma67/spotifyplaylist_to_gmusic",
     *   "author": "sigmatics",
     *   "year": "2020",
     *   "duration": "6+ hours",
     *   "duration_seconds": 52651,
     *   "trackCount": 237,
     *   "tracks": [
     *     {
     *       "videoId": "bjGppZKiuFE",
     *       "title": "Lost",
     *       "artists": [
     *         {
     *           "name": "Guest Who",
     *           "id": "UCkgCRdnnqWnUeIH7EIc3dBg"
     *         },
     *         {
     *           "name": "Kate Wild",
     *           "id": "UCwR2l3JfJbvB6aq0RnnJfWg"
     *         }
     *       ],
     *       "album": {
     *       "name": "Lost",
     *       "id": "MPREb_PxmzvDuqOnC"
     *     },
     *     "duration": "2:58",
     *     "likeStatus": "INDIFFERENT",
     *     "thumbnails": [...],
     *     "isAvailable": True,
     *     "isExplicit": False,
     *     "feedbackTokens": {
     *     "add": "AB9zfpJxtvrU...",
     *     "remove": "AB9zfpKTyZ..."
     *     }
     *   ]
     * }
     */
    async getPlaylist(
      _playlistId: string,
      _limit = 100
    ): Promise<Record<string, any>> {
      // const browseId = !playlistId.startsWith('VL')
      //   ? `VL${playlistId}`
      //   : playlistId;
      // const body: Record<string, any> = { browseId: browseId };
      // const endpoint = 'browse';
      // const response = await this._sendRequest(endpoint, body);
      // const results = nav(response, [
      //   ...SINGLE_COLUMN_TAB,
      //   ...SECTION_LIST_ITEM,
      //   'musicPlaylistShelfRenderer',
      // ]);
      // const playlist: Record<string, any> = { id: results['playlistId'] };
      // const ownPlaylist =
      //   'musicEditablePlaylistDetailHeaderRenderer' in response['header'];
      // let header;
      // if (!ownPlaylist) {
      //   header = response['header']['musicDetailHeaderRenderer'];
      //   playlist['privacy'] = 'PUBLIC';
      // } else {
      //   header =
      //     response['header']['musicEditablePlaylistDetailHeaderRenderer'];
      //   playlist['privacy'] =
      //     header['editHeader']['musicPlaylistEditHeaderRenderer']['privacy'];
      //   header = header['header']['musicDetailHeaderRenderer'];
      // }

      // playlist['title'] = nav(header, TITLE_TEXT);
      // playlist['thumbnails'] = nav(header, THUMBNAIL_CROPPED);
      // playlist['description'] = nav(header, DESCRIPTION, true);
      // const runCount = header['subtitle']['runs'].length;

      // if (runCount > 1) {
      //   playlist['author'] = {
      //     name: nav(header, SUBTITLE2),
      //     id: nav(
      //       header,
      //       ['subtitle', 'runs', 2, ...NAVIGATION_BROWSE_ID],
      //       true
      //     ),
      //   };
      //   if (runCount == 5) {
      //     playlist['year'] = nav(header, SUBTITLE3);
      //   }
      // }

      // const songCount = toInt(
      //   '' //@codyduong todo
      // );
      // if (header['secondSubtitle']['runs'].length > 1) {
      //   playlist['duration'] = header['secondSubtitle']['runs'][2]['text'];
      // }

      // playlist['trackCount'] = songCount;
      // playlist['suggestions_token'] = nav(response, [
      //   ...SINGLE_COLUMN_TAB,
      //   'sectionListRenderer',
      //   'contents',
      //   1,
      //   ...MUSIC_SHELF,
      //   ...RELOAD_CONTINUATION,
      //   true,
      // ]);

      // playlist['tracks'] = [];
      // if (songCount > 0) {
      //   playlist['tracks'] = [
      //     ...playlist['tracks'],
      //     ...parsePlaylistItems(results['contents']),
      //   ];
      //   const songsToGet = Math.min(limit, songCount);

      //   if ('continuations' in results) {
      //     const requestFunc = (additionalParams) =>
      //       await this._sendRequest(endpoint, body, additionalParams);
      //   }
      // }
      return {};
    }
  };
};
