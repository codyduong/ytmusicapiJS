/* eslint-disable @typescript-eslint/no-unused-vars */
import ConfigParser from 'configparser';
import path from 'path';
import YTMusic from '../src/ytmusic';

const sampleAlbum = 'MPREb_4pL8gzRtw1p'; // Eminem - Revival
const sampleVideo = 'ZrOKjDZOtkA'; // Oasis - Wonderwall (Remastered)
const samplePlaylist = 'PL6bPxvf5dW5clc3y9wAoslzqUrmkZ5c-u'; // very large playlist
const query = 'edm playlist';

const config = new ConfigParser();
config.read(`${__dirname}/test.cfg`);

const ytmusic = new YTMusic();
const ytmusicAuth = new YTMusic(config.get('auth', 'headers_file'));
// const ytmusicBrand = new YTMusic(
//   config.get('auth', 'headers'),
//   config.get('auth', 'brand_account')
// );

/**
 * BROWSING
 */
describe('Browsing', () => {
  describe('Search', () => {
    test('#1', async () => {
      const results = await ytmusic.search(query);
      expect(results.length).toBeGreaterThan(10);
      // console.log(results)
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
      const results = await ytmusic.search('classical rock', {
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
    test.skip('#1', async () => {
      const results = await ytmusicAuth.search('audiomachine', {
        scope: 'uploads',
        limit: 40,
      });
      expect(results).toBeGreaterThan(5);
    });
  });
  describe.skip('Search Library', () => {
    test('#1', async () => {
      const results = await ytmusicAuth.search('garrix', { scope: 'library' });
      expect(results).toBeGreaterThan(5);
    });
    test('#2', async () => {
      const results = await ytmusicAuth.search('bergersen', {
        scope: 'library',
        filter: 'songs',
        limit: 40,
      });
      expect(results).toBeGreaterThan(10);
    });
    test('#3', async () => {
      const results = await ytmusicAuth.search('garrix', {
        scope: 'library',
        filter: 'albums',
        limit: 40,
      });
      expect(results).toBeGreaterThanOrEqual(4);
    });
    test('#4', async () => {
      const results = await ytmusicAuth.search('garrix', {
        scope: 'library',
        filter: 'artists',
        limit: 40,
      });
      expect(results).toBeGreaterThanOrEqual(1);
    });
    test('#5', async () => {
      const results = await ytmusicAuth.search('garrix', {
        scope: 'library',
        filter: 'playlists',
      });
      expect(results).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Get Artist', () => {
    test('#1', async () => {
      try {
        const results = await ytmusic.getArtist('MPLAUCmMUZbaYdNH0bEd1PAlAqsA');
      } catch (e: any) {
        expect(e.message).toBe('Function not implemented.');
      }
      //TODO @codyduong test related artists
    });
    test('#2 (non YT Music Channel)', async () => {
      try {
        const results = await ytmusic.getArtist('UCUcpVoi5KkJmnE3bvEhHR0Q');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ReferenceError);
      }
    });
  });
  describe('Get Artist Albums', () => {
    test('#1', async () => {
      const artist = await ytmusic.getArtist('UCAeLFBCQS7FvI8PvBrWvSBg');
      const results = await ytmusic.getArtistAlbums(
        artist.albums.browseId,
        artist.albums.params
      );
      expect(results.length).toBeGreaterThan(0);
    });
  });
  describe('Get Artist Singles', () => {});
  describe('Get User', () => {
    test('#1', async () => {
      // @codyduong nav error here
      const results = await ytmusic.getUser('UC44hbeRoCZVVMVg5z0FfIww');
      expect(Object.keys(results).length).toBe(3);
    });
  });
  // describe('Get User Playlists', () => {});
  describe('Get Album Browse Id', () => {
    // this test times out and blows up LOL @codyduong
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
    // relies on auth @codyduong
    test.skip('#1', async () => {
      //const song = ytmusic.yt_auth.getSong("AjXQiKP5kMs")
      //expect(results.length).toBe(4)
    });
    test('#2', async () => {
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
  //This is resolved in 2e8c09a4307e1ea1d81306bb3b20b700be825e4c
  //and 7bc65ba15cba8d48ab8077f0dbd1be89f2402f6e
  describe.skip('Get Charts', () => {
    test('#1', async () => {
      const charts = await ytmusicAuth.getCharts();
      expect(Object.keys(charts).length).toBe(4);
    });
    test('#2', async () => {
      const charts = await ytmusicAuth.getCharts('US');
      expect(charts.length).toBe(6);
    });
    test('#3', async () => {
      const charts = await ytmusic.getCharts('BE');
      expect(charts.length).toBe(4);
    });
  });
});

/**
 * WATCH
 */
describe('Watch', () => {
  describe.skip('Get Watch Playlist', () => {
    //These all require auth @codyduong
    test('#1', async () => {
      // const playlist = await ytmusic.yt_auth.getWatchPlaylist({
      //   playlistId: 'OLAK5uy_ln_o1YXFqK4nfiNuTfhJK2XcRNCxml0fY',
      //   limit: 90,
      // });
      // expect(playlist.tracks.length).toBeGreaterThanOrEqual(90);
    });
    test('#2', async () => {});
    test('#3', async () => {});
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
      // const playlist = await ytmusic.getWatchPlaylistShuffle({
      //   playlistId: config.playlists.own;
      // })
    });
  });
});
