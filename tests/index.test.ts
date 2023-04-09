/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ConfigParser from 'configparser';
import YTMusic from '../src/index';
import { json } from '../src/pyLibraryMock';

const sampleAlbum = 'MPREb_4pL8gzRtw1p'; // Eminem - Revival
const sampleVideo = 'hpSrLjc5SMs'; // Oasis - Wonderwall (Remastered)
const samplePlaylist = 'PL6bPxvf5dW5clc3y9wAoslzqUrmkZ5c-u'; // very large playlist
const query = 'edm playlist';

const config = new ConfigParser();

const ytmusic = new YTMusic();
let ytmusicAuth: InstanceType<typeof YTMusic>;
let ytmusicBrand: InstanceType<typeof YTMusic>;
let headersRaw = '';
let playlistsOwn = '';
if (process.env.CI !== 'true') {
  config.read(`${__dirname}/test.cfg`);
  ytmusicAuth = new YTMusic({ auth: config.get('auth', 'headers_file') });
  ytmusicBrand = new YTMusic({
    auth: config.get('auth', 'headers'),
    user: config.get('auth', 'brand_account'),
  });
  headersRaw = config.get('auth', 'headers') as string;
  playlistsOwn = config.get('private', 'brand_account_playlist') as string;
} else {
  ytmusicAuth = new YTMusic({ auth: process.env.AUTH });
  ytmusicBrand = new YTMusic({
    auth: process.env.HEADERS,
    user: process.env.BRAND_ACCOUNT,
  });
  headersRaw = process.env.HEADERS as string;
  playlistsOwn = process.env.PLAYLISTS_OWN as string;
}

/**
 * SETUP
 */
describe('Setup', () => {
  test('Write', () => {
    YTMusic.setup({ filepath: 'TEST_setup.json', headersRaw });
  });
  test('No Write', () => {
    YTMusic.setup({ headersRaw });
  });
  test('No Cookies', () => {
    try {
      const removeCookie = json.loads(headersRaw);
      delete removeCookie.cookie;
      const removedCookie = json.dumps(removeCookie);
      YTMusic.setup({ filepath: 'TEST_setup.json', headersRaw: removedCookie });
    } catch (e) {
      expect(e instanceof Error).toBe(true);
    }
  });
  test('No X-Goog-Authuser', () => {
    try {
      const removeAuthUser = json.loads(headersRaw);
      delete removeAuthUser['x-goog-authuser'];
      const removedAuthUser = json.dumps(removeAuthUser);
      YTMusic.setup({
        filepath: 'TEST_setup.json',
        headersRaw: removedAuthUser,
      });
    } catch (e) {
      expect(e instanceof Error).toBe(true);
    }
  });
});
/**
 * BROWSING
 */
describe('Browsing', () => {
  describe('Get Home', () => {
    test('#1', async () => {
      //This is broken right now, for some reason we are only able to see up to 2 (when it is 6+ on a browser)
      const result = await ytmusic.getHome(2);
      expect(result.length).toBeGreaterThanOrEqual(2); //6
    });
    test('(Auth) #2', async () => {
      const result = ytmusicAuth.getHome(6);
      expect((await result).length).toBeGreaterThanOrEqual(2); //15
    });
  });
  describe('Search', () => {
    test('#1', async () => {
      const results = await ytmusic.search(query);
      expect(results.length).toBeGreaterThan(10);
    });
    test('#2', async () => {
      const results = await ytmusic.search(
        'Martin Stig Andersen - Deteriation',
        {
          ignoreSpelling: true,
        }
      );
      expect(results.length).toBeGreaterThan(0);
    });
    test('#3', async () => {
      const results = await ytmusic.search(query, { filter: 'songs' });
      expect(results.length).toBeGreaterThan(10);
    });
    test('#4', async () => {
      const results = await ytmusic.search(query, { filter: 'videos' });
      expect(results.length).toBeGreaterThan(10);
    });
    test('#5', async () => {
      const results = await ytmusic.search(query, {
        filter: 'albums',
        limit: 40,
      });
      expect(results.length).toBeGreaterThanOrEqual(20); //@codyduong, the pylib has this running at > only, did we accidentally explode one?
    });
    test('#6', async () => {
      const results = await ytmusic.search('project-2', {
        filter: 'artists',
        ignoreSpelling: true,
      });
      expect(results.length).toBeGreaterThan(0);
    });
    test('#7', async () => {
      const results = await ytmusic.search('classical music', {
        filter: 'playlists',
      });
      expect(results.length).toBeGreaterThan(5);
    });
    test('#8', async () => {
      const results = await ytmusic.search('classical music', {
        filter: 'playlists',
        ignoreSpelling: true,
      });
      expect(results.length).toBeGreaterThan(5);
    });
    test('#9', async () => {
      const results = await ytmusic.search('clasic rock', {
        filter: 'community_playlists',
        ignoreSpelling: true,
      });
      expect(results.length).toBeGreaterThan(5);
    });
    test('#10', async () => {
      const results = await ytmusic.search('hip hop', {
        filter: 'featured_playlists',
      });
      expect(results.length).toBeGreaterThan(5);
    });
  });
  describe('Search Uploads', () => {
    test('(Auth) #1', async () => {
      const results = await ytmusicAuth.search('CHOCOLAT', {
        scope: 'uploads',
        limit: 40,
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
    test('#2', async () => {
      try {
        const _results = await ytmusicAuth.search('audiomachine', {
          scope: 'uploads',
          filter: 'songs',
          limit: 40,
        });
      } catch (e: any) {
        expect(e).toBeInstanceOf(TypeError);
        expect(e.message).toBe(
          'No filter can be set when searching uploads. Please unset the filter parameter when scope is set to uploads.'
        );
      }
    });
  });
  describe('(Auth) Search Library', () => {
    test('#1', async () => {
      const results = await ytmusicBrand.search('yea', { scope: 'library' });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
    test('#2', async () => {
      const results = await ytmusicBrand.search('red', {
        scope: 'library',
        filter: 'songs',
        limit: 40,
      });
      expect(results.length).toBeGreaterThanOrEqual(4);
    });
    test('#3', async () => {
      const results = await ytmusicBrand.search('true colors', {
        scope: 'library',
        filter: 'albums',
        limit: 40,
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
    test('#4', async () => {
      const results = await ytmusicBrand.search('calliope', {
        scope: 'library',
        filter: 'artists',
        limit: 40,
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
    test('#5', async () => {
      const results = await ytmusicBrand.search('everything', {
        scope: 'library',
        filter: 'playlists',
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Get Artist', () => {
    test('#1', async () => {
      const results = await ytmusic.getArtist('MPLAUCmMUZbaYdNH0bEd1PAlAqsA');
      expect(Object.keys(results).length).toBe(14);

      // test corectness of related artists
      const related = results['related']?.['results'];
      expect(
        related?.filter(
          (x) =>
            Object.prototype.hasOwnProperty.call(x, 'browseId') &&
            Object.prototype.hasOwnProperty.call(x, 'subscribers') &&
            Object.prototype.hasOwnProperty.call(x, 'title') &&
            Object.prototype.hasOwnProperty.call(x, 'thumbnails')
        ).length
      ).toBe(related?.length ?? 0);
    });
    test('#2', async () => {
      const results = await ytmusic.getArtist('UCLZ7tlKC06ResyDmEStSrOw');
      expect(Object.keys(results).length).toBeGreaterThanOrEqual(11);
    });
    test('#3 (non YT Music Channel)', async () => {
      try {
        const _results = await ytmusic.getArtist('UCUcpVoi5KkJmnE3bvEhHR0Q');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ReferenceError);
      }
    });
  });
  describe('Get Artist Albums', () => {
    // Currently the _sendRequest function is not accepting the parameter correctly. @codyduong TODO
    test.skip('#1', async () => {
      const artist = await ytmusic.getArtist('UCAeLFBCQS7FvI8PvBrWvSBg');
      const results =
        artist.albums?.browseId &&
        artist.albums?.params &&
        (await ytmusic.getArtistAlbums(
          artist.albums?.browseId,
          artist.albums?.params
        ));
      expect(results?.length).toBeGreaterThan(0);
    });
  });
  describe('Get Song Related Content', () => {
    test('#1', async () => {
      const song = await ytmusic.getWatchPlaylist({ videoId: sampleVideo });
      const song2 = await ytmusic.getSongRelated(song['related']);
      expect(song2.length).toBeGreaterThanOrEqual(5);
    });
  });
  describe('(Auth) Get Artist Singles', () => {
    // @codyduong TODO investigate this failure
    test.skip('#1', async () => {
      const artist = (await ytmusicAuth.getArtist(
        'UCAeLFBCQS7FvI8PvBrWvSBg'
      )) as any;
      const results = await ytmusic.getArtistAlbums(
        artist['singles']['browseId'],
        artist['singles']['params']
      );
      expect(results.length).toBeGreaterThan(0);
    });
  });
  describe('Get User', () => {
    test('#1', async () => {
      const results = await ytmusic.getUser('UC44hbeRoCZVVMVg5z0FfIww');
      expect(Object.keys(results).length).toBe(3);
    });
  });
  describe('Get User Playlists', () => {
    // Currently the _sendRequest function is not accepting the parameter correctly. @codyduong TODO
    test.skip('#1', async () => {
      const results = await ytmusic.getUser('UCPVhZsC2od1xjGhgEc2NEPQ');
      const results2 = await ytmusic.getUserPlaylists(
        'UCPVhZsC2od1xjGhgEc2NEPQ',
        results['playlists']?.['params'] ?? ''
      );
      expect(results2.length).toBeGreaterThan(100);
    });
  });
  describe('Get Album Browse Id', () => {
    // this test times out and blows up @codyduong TODO
    test.skip('#1', async () => {
      const browseId = await ytmusic.getAlbumBrowseId(
        'OLAK5uy_nMr9h2VlS-2PULNz3M3XVXQj_P3C2bqaY'
      );
      expect(browseId).toBe(sampleAlbum);
    });
  });
  describe('Get Album', () => {
    test('#1', async () => {
      const results = await ytmusic.getAlbum(sampleAlbum);
      expect(Object.keys(results).length).toBeGreaterThan(9);
      expect(results.tracks[0].isExplicit).toBe(true);
      expect(results.tracks[0].feedbackTokens).toBeDefined;
    });
    test('#2', async () => {
      const results = await ytmusic.getAlbum('MPREb_BQZvl3BFGay');
      expect(results.tracks.length).toBe(7);
    });
  });
  describe('Get Song', () => {
    test('(Auth) #1', async () => {
      const song = await ytmusicAuth.getSong('AjXQiKP5kMs');
      expect(Object.keys(song).length).toBe(1);
      expect(song.playabilityStatus.status).toBe('ERROR');
    });
    test('(Auth) #2', async () => {
      //Actually a public song.
      const song = await ytmusicAuth.getSong('6Gf55K06NfI');
      expect(Object.keys(song).length).toBe(4);
    });
    test('#3', async () => {
      const song = await ytmusic.getSong(sampleVideo);
      expect(song.streamingData.adaptiveFormats.length).toBeGreaterThan(10);
    });
  });
  describe('Get Lyrics', () => {
    test('#1', async () => {
      const playlist = await ytmusic.getWatchPlaylist({ videoId: sampleVideo });
      const lyricsSong = await ytmusic.getLyrics(playlist['lyrics']);
      expect(lyricsSong.lyrics).toBeDefined;
      expect(lyricsSong.source).toBeDefined;
    });
    test('#2', async () => {
      const playlist = await ytmusic.getWatchPlaylist({
        videoId: '9TnpB8WgW4s',
      });
      expect(playlist.lyrics).toBeNull;
      try {
        await ytmusic.getLyrics(playlist.lyrics);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
  describe('Get Signature Timestamp', () => {
    test('#1', async () => {
      const signatureTimestamp = await ytmusic.getSignatureTimestamp();
      expect(signatureTimestamp).toBeTruthy;
    });
  });
  describe('Set Tasteprofile', () => {
    test('#1', async () => {
      try {
        await ytmusic.setTasteprofile(['not an artist']);
      } catch (e) {
        expect(e instanceof TypeError).toBe(true);
      }
    });
    test('#2', async () => {
      const tasteProfile = await ytmusic.getTasteprofile();
      expect(
        await ytmusic.setTasteprofile(
          Object.keys(tasteProfile).slice(0, 5),
          tasteProfile
        )
      ).toBeUndefined();
    });
    test('#3', async () => {
      try {
        await ytmusic.setTasteprofile(['test', 'test2']);
      } catch (e) {
        expect(e instanceof TypeError).toBe(true);
      }
    });
    test('#4', async () => {
      const tasteProfile = await ytmusic.getTasteprofile();
      expect(
        await ytmusic.setTasteprofile(
          Object.keys(tasteProfile).slice(0, 1),
          tasteProfile
        )
      ).toBeUndefined();
    });
  });
});

/**
 * EXPLORE
 */
describe('Explore', () => {
  describe('Get Mood Playlists', () => {
    test('#1', async () => {
      const categories = await ytmusic.getMoodCategories();
      const catListed = Object.keys(categories);
      expect(catListed.length).toBeGreaterThan(0);
      const cat = catListed[0];
      const playlists = await ytmusic.getMoodPlaylists(
        categories[cat][0]['params']
      );
      expect(playlists.length).toBeGreaterThan(0);
    });
  });
  describe('Get Charts', () => {
    test('(Auth) #1', async () => {
      const charts = await ytmusicAuth.getCharts();
      expect(Object.keys(charts).length).toBe(4);
    });
    test('(Auth) #2', async () => {
      const charts = await ytmusicAuth.getCharts('US');
      expect(Object.keys(charts).length).toBe(6);
    });
    test('#3', async () => {
      const charts = await ytmusic.getCharts('BE');
      expect(Object.keys(charts).length).toBe(4);
    });
  });
});

/**
 * WATCH
 */
describe('Watch', () => {
  describe('(Auth) Get Watch Playlist', () => {
    // Requires authentication & private playlist
    test('#1', async () => {
      const playlist = await ytmusicAuth.getWatchPlaylist({
        playlistId: 'OLAK5uy_ln_o1YXFqK4nfiNuTfhJK2XcRNCxml0fY',
        limit: 90,
      });
      expect(playlist.tracks.length).toBeGreaterThanOrEqual(90);
    });
    test('#2', async () => {
      const playlist = await ytmusicAuth.getWatchPlaylist({
        videoId: '9mWr4c_ig54',
        limit: 50,
      });
      expect(playlist.tracks.length).toBeGreaterThan(45);
    });
    test('#3', async () => {
      const playlist = await ytmusicAuth.getWatchPlaylist({
        videoId: 'UoAf_y9Ok4k',
      });
      expect(playlist.tracks.length).toBeGreaterThanOrEqual(25);
    });
  });
  describe('Get Watch Playlist Shuffle', () => {
    test('#1', async () => {
      const playlist = await ytmusic.getWatchPlaylistShuffle({
        playlistId: 'OLAK5uy_lKgoGvlrWhX0EIPavQUXxyPed8Cj38AWc',
      });
      expect(playlist.tracks.length).toBe(12);
    });
  });
  describe('Get Watch Playlist Shuffle Playlist', () => {
    test('#1', async () => {
      const playlist = await ytmusicBrand.getWatchPlaylistShuffle({
        playlistId: playlistsOwn,
      });
      expect(playlist['tracks'].length).toBeGreaterThanOrEqual(1);
    });
  });
});

/**
 * LIBRARY
 */
describe('(Auth) Library', () => {
  describe('Get Library Playlists', () => {
    test('#1', async () => {
      const playlists = await ytmusicAuth.getLibraryPlaylists(50);
      expect(playlists.length).toBeGreaterThan(5);
    });
  });
  describe('Get All Library Playlists', () => {
    test('#1', async () => {
      let currentLength = (await ytmusicAuth.getLibraryPlaylists(25)).length;
      let expectedLength = currentLength;
      while (expectedLength <= currentLength) {
        expectedLength = currentLength + 1;
        currentLength = (await ytmusicAuth.getLibraryPlaylists(expectedLength))
          .length;
      }
      expectedLength -= 1;

      const playlists = ytmusicAuth.getLibraryPlaylists();
      expect(playlists).toHaveLength(expectedLength);
    });
  });
  describe('Get Library Songs', () => {
    test('#1', async () => {
      try {
        await ytmusicBrand.getLibrarySongs({
          limit: null,
          validateResponses: true,
        });
      } catch (e: any) {
        expect(e instanceof TypeError).toBe(true);
        expect(e.message).toBe(
          'Validation is not supported without a limit parameter.'
        );
      }
    });
    test('#2', async () => {
      const songs = await ytmusicBrand.getLibrarySongs({ limit: 100 });
      expect(songs.length).toBeGreaterThanOrEqual(100);
    });
    test('#3', async () => {
      const songs = await ytmusicBrand.getLibrarySongs({
        limit: 200,
        validateResponse: true,
      });
      // TODO
      // eslint-disable-next-line prettier/prettier
      // expect(songs.length).toBeGreaterThanOrEqual(config.getInt('limits', 'library_songs'));
      expect(songs.length).toBeGreaterThanOrEqual(200);
    });
    test('#4', async () => {
      const songs = await ytmusicAuth.getLibrarySongs({ order: 'a_to_z' });
      expect(songs.length).toBeGreaterThanOrEqual(25);
    });
    // TODO
    test.skip('#5', async () => {
      const songs = await ytmusicAuth.getLibrarySongs({ order: 'z_to_a' });
      expect(songs.length).toBeGreaterThanOrEqual(25);
    });
    // TODO
    test.skip('#6', async () => {
      const songs = await ytmusicAuth.getLibrarySongs({
        order: 'recently_added',
      });
      expect(songs.length).toBeGreaterThanOrEqual(25);
    });
  });
  describe('Get Library Albums', () => {
    test('#1', async () => {
      const albums = await ytmusicBrand.getLibraryAlbums({ limit: 100 });
      expect(albums.length).toBeGreaterThanOrEqual(1);
    });
    test('#2', async () => {
      const albums = await ytmusicBrand.getLibraryAlbums({
        limit: 100,
        order: 'a_to_z',
      });
      expect(albums.length).toBeGreaterThanOrEqual(1);
    });
    test('#3', async () => {
      const albums = await ytmusicBrand.getLibraryAlbums({
        limit: 100,
        order: 'z_to_a',
      });
      expect(albums.length).toBeGreaterThanOrEqual(1);
    });
    test('#4', async () => {
      const albums = await ytmusicBrand.getLibraryAlbums({
        limit: 100,
        order: 'recently_added',
      });
      expect(albums.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Get Library Artists', () => {
    test('#1', async () => {
      const artists = await ytmusicBrand.getLibraryArtists({ limit: 50 });
      expect(artists.length).toBeGreaterThanOrEqual(40);
    });
    test('#2', async () => {
      const artists = await ytmusicBrand.getLibraryArtists({
        order: 'a_to_z',
        limit: 50,
      });
      expect(artists.length).toBeGreaterThanOrEqual(40);
    });
    test('#3', async () => {
      const artists = await ytmusicBrand.getLibraryArtists({
        limit: undefined,
      });
      expect(artists.length).toBeGreaterThanOrEqual(40);
    });
    // TODO
    test.skip('#4', async () => {
      const artists = await ytmusicBrand.getLibraryArtists({ order: 'z_to_a' });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
    // TODO
    test.skip('#5', async () => {
      const artists = await ytmusicBrand.getLibraryArtists({
        order: 'recently_added',
      });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
  });
  describe('Get Library Subscriptions', () => {
    test('#1', async () => {
      const artists = await ytmusicBrand.getLibrarySubscriptions({ limit: 50 });
      expect(artists.length).toBeGreaterThanOrEqual(25);
    });
    // TODO
    test.skip('#2', async () => {
      const artists = await ytmusicBrand.getLibrarySubscriptions({
        order: 'a_to_z',
      });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
    test('#3', async () => {
      const artists = await ytmusicBrand.getLibrarySubscriptions({
        order: 'z_to_a',
      });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
    // TODO
    test.skip('#4', async () => {
      const artists = await ytmusicBrand.getLibrarySubscriptions({
        order: 'recently_added',
      });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
    test('#5', async () => {
      const artists = await ytmusicBrand.getLibrarySubscriptions({
        limit: undefined,
      });
      expect(artists.length).toBeGreaterThanOrEqual(20);
    });
  });
  describe('Get Liked Songs', () => {
    test('#1', async () => {
      const songs = await ytmusicBrand.getLikedSongs(200);
      expect(songs['tracks'].length).toBeGreaterThanOrEqual(100);
    });
  });
  describe('Get History', () => {
    test('#1', async () => {
      const songs = await ytmusicBrand.getHistory();
      expect(songs.length).toBeGreaterThan(0);
    });
  });
  //Don't remove history items...
  // describe.skip('Remove History Items', () => {
  //   test('#1', async () => {
  //     const songs = await ytmusicAuth.getHistory();
  //     const response = await ytmusicAuth.removeHistoryItems([
  //       songs[0]['feedbackToken'],
  //       songs[1]['feedbackToken'],
  //     ]);
  //     expect(response['feedbackResponses']).toBeTruthy();
  //   });
  // });
  describe('Rate Song', () => {
    test('#1', async () => {
      const response = await ytmusicAuth.rateSong(sampleVideo, 'LIKE');
      expect(response['actions']).toBeTruthy();
    });
    test('#2', async () => {
      const response = await ytmusicAuth.rateSong(sampleVideo, 'INDIFFERENT');
      expect(response['actions']).toBeTruthy();
    });
  });
  describe('Edit Song Library Status', () => {
    test('#1', async () => {
      const album = await ytmusicBrand.getAlbum(sampleAlbum);
      const response = await ytmusicBrand.editSongLibraryStatus(
        album['tracks']['2']['feedbackTokens']['add']
      );
      expect(response['feedbackResponses'][0]['isProcessed']).toBe(true);
    });
    test('#2', async () => {
      const album = await ytmusicBrand.getAlbum(sampleAlbum);
      const response = await ytmusicBrand.editSongLibraryStatus(
        album['tracks']['2']['feedbackTokens']['remove']
      );
      expect(response['feedbackResponses'][0]['isProcessed']).toBe(true);
    });
  });
  describe('Rate Playlist', () => {
    const PLAYLIST_TO_RATE = 'OLAK5uy_l3g4WcHZsEx_QuEDZzWEiyFzZl6pL0xZ4';
    test('#1', async () => {
      const response = await ytmusicAuth.ratePlaylist(PLAYLIST_TO_RATE, 'LIKE');
      expect(response['actions']).toBeTruthy();
    });
    test('#2', async () => {
      const response = await ytmusicAuth.ratePlaylist(PLAYLIST_TO_RATE, 'LIKE');
      expect(response['actions']).toBeTruthy();
    });
  });
  describe('Subscribe Artist', () => {
    const ARTISTS_TO_SUBSCRIBE = [
      'UCUDVBtnOQi4c7E8jebpjc9Q',
      'UCiMhD4jzUqG-IgPzUmmytRQ',
    ];
    test('#1', async () => {
      const _subscribe = await ytmusicAuth.subscribeArtists(
        ARTISTS_TO_SUBSCRIBE
      );
    });
    test('#2', async () => {
      const _unsubscribe = await ytmusicAuth.unsubscribeArtists(
        ARTISTS_TO_SUBSCRIBE
      );
    });
  });
});

/**
 * PLAYLISTS
 */
describe('Playlists', () => {
  describe('Get Foreign Playlist', () => {
    test('#1', async () => {
      const playlist = await ytmusic.getPlaylist(samplePlaylist, 300);
      expect(playlist['tracks'].length).toBeGreaterThan(200);
    });
    test('#2', async () => {
      const playlist = await ytmusic.getPlaylist(
        'RDCLAK5uy_kpxnNxJpPZjLKbL9WgvrPuErWkUxMP6x4',
        null
      );
      expect(playlist['tracks'].length).toBeGreaterThan(100);
    });
  });
  describe('(Auth) Get Owned Playlist', () => {
    test('#1', async () => {
      const playlist = await ytmusicBrand.getPlaylist(playlistsOwn);
      expect(playlist['tracks'].length).toBeLessThanOrEqual(100);
      if (playlist['suggestions_token']) {
        const suggestions = await ytmusicBrand.getPlaylistSuggestions(
          playlist['suggestions_token']
        );
        expect(suggestions['tracks'].length).toBeGreaterThan(5);
        const refresh = await ytmusicBrand.getPlaylistSuggestions(
          playlist['suggestions_token']
        );
        expect(refresh['tracks'].length).toBeGreaterThan(5);
      }
    });
  });
  test('(Auth) Edit Playlist', async () => {
    const playlist = await ytmusicBrand.getPlaylist(
      'PLdu3sa6Om8hGjimJ92G2CJmnm548Oxivh'
    );
    const response = await ytmusicBrand.editPlaylist(playlist['id'], {
      title: playlist['title'],
      description: playlist['description'],
      privacyStatus: playlist['privacy'],
      moveItem: [
        playlist['tracks'][1]['setVideoId']!,
        playlist['tracks'][0]['setVideoId']!,
      ],
    });
    expect(['STATUS_SUCCEEDED', 'Playlist edit failed']).toContain(response);
    const response2 = await ytmusicBrand.editPlaylist(playlist['id'], {
      title: playlist['title'],
      description: playlist['description'],
      privacyStatus: playlist['privacy'],
      moveItem: [
        playlist['tracks'][1]['setVideoId']!,
        playlist['tracks'][0]['setVideoId']!,
      ],
    });
    expect(['STATUS_SUCCEEDED', 'Playlist edit failed']).toContain(response2);
  });
  jest.setTimeout(10000);
  test('(Auth) E2E', async () => {
    const playlistId = (await ytmusicAuth.createPlaylist(
      'test',
      'testDescription',
      {
        sourcePlaylist: 'OLAK5uy_lGQfnMNGvYCRdDq9ZLzJV2BJL2aHQsz9Y',
      }
    )) as unknown as string;
    expect([34, 'Playlist creation failed']).toContain(playlistId.length);
    const response = (await ytmusicAuth.addPlaylistItems(playlistId, {
      videoIds: ['y0Hhvtmv0gk', sampleVideo],
      sourcePlaylist: 'OLAK5uy_nvjTE32aFYdFN7HCyMv3cGqD3wqBb4Jow',
      duplicates: true,
    })) as unknown as Record<string, any>;
    expect(['STATUS_SUCCEEDED', 'Adding playlist item failed']).toContain(
      response['status']
    );
    expect(response['playlistEditResults'].length).toBeGreaterThan(0);
    const playlist = (await ytmusicAuth.getPlaylist(
      playlistId
    )) as unknown as Record<string, any>;
    expect(playlist['tracks'].length).toBe(46);
    const response2 = (await ytmusicAuth.removePlaylistItems(
      playlistId,
      playlist['tracks']
    )) as unknown as Record<string, any>;
    expect(['STATUS_SUCCEEDED', 'Playlist item removal failed']).toContain(
      response2
    );
    const response3 = (await ytmusicAuth.deletePlaylist(
      playlistId
    )) as unknown as Record<string, any>;
    expect([playlistId, 'Playlist removal failed']).toContain(
      response3['command']['handlePlaylistDeletionCommand']['playlistId']
    );
  });
});

/**
 * UPLOADS
 */
describe('(Auth) Uploads', () => {
  describe('Get Library Upload Songs', () => {
    test('#1', async () => {
      const results = await ytmusicAuth.getLibraryUploadSongs(50, 'z_to_a');
      expect(results.length).toBeGreaterThanOrEqual(10);
    });
    test('#2 (Empty)', async () => {
      const results = await ytmusicAuth.getLibraryUploadSongs(100);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
    // TODO
    test.skip('#3', async () => {
      const results = await ytmusicAuth.getLibraryUploadSongs(undefined);
      expect(results.length).toBeGreaterThanOrEqual(1000);
    });
  });
  describe('Get Library Upload Albums', () => {
    test('#1', async () => {
      const results = await ytmusicAuth.getLibraryUploadAlbums(50, 'z_to_a');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });
    test('#2 (Empty)', async () => {
      const results = await ytmusicAuth.getLibraryUploadAlbums(100);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
    // TODO
    test.skip('#3', async () => {
      const albums = await ytmusicAuth.getLibraryUploadAlbums(undefined);
      expect(albums.length).toBeGreaterThanOrEqual(
        config.getInt('limits', 'library_upload_albums')!
      );
    });
  });
  describe('Get Library Upload Artists', () => {
    test('#1', async () => {
      const results = await ytmusicAuth.getLibraryUploadArtists(undefined);
      expect(results.length).toBeGreaterThan(5);
    });
    test('#2', async () => {
      const results = await ytmusicAuth.getLibraryUploadArtists(
        50,
        'recently_added'
      );
      expect(results.length).toBeGreaterThanOrEqual(25);
    });
  });
  // These tests need to occur before we try to upload
  // Otherwise YTM will throw 400
  test('Get Library Upload Album', async () => {
    const library = await ytmusicAuth.getLibraryUploadSongs();
    const album = await ytmusicAuth.getLibraryUploadAlbum(library[0].album!.id);
    expect(album.tracks.length).toBeGreaterThan(0);
  });
  test('Get Library Upload Artist', async () => {
    const library = await ytmusicAuth.getLibraryUploadSongs();
    const artist = await ytmusicAuth.getLibraryUploadArtist(
      library[0].artists![0].id!
    );
    expect(artist.length).toBeGreaterThan(0);
  });
  describe('Test Upload Song', () => {
    test('#1', async () => {
      try {
        await ytmusicAuth.uploadSong('songToUpload.mp3');
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
    test('#2', async () => {
      try {
        await ytmusicAuth.uploadSong('tests/test.ts');
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
    test('#3', async () => {
      //Interestingly enough, this fails but the status is OK
      //So nothing gets uploaded
      const response = await ytmusicAuth.uploadSong('tests/empty.mp3');
      if (typeof response == 'object') {
        expect(response['status']).toBeTruthy();
      } else {
        expect(response).toBe('STATUS_SUCCEEDED');
      }
    });
  });
  //Don't delete uploads
  test.skip('Delete Upload Entity', async () => {
    const results = await ytmusicAuth.getLibraryUploadSongs();
    const response = await ytmusicAuth.deleteUploadEntity(
      results[0]['entityId']
    );
    expect(response).toBe('STATUS_SUCCEEDED');
  });
});
