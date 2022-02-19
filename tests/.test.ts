/* eslint-disable @typescript-eslint/no-unused-vars */
import YTMusic from '../src/ytmusic';

const sampleAlbum = 'MPREb_4pL8gzRtw1p'; // Eminem - Revival
const sampleVideo = 'ZrOKjDZOtkA'; // Oasis - Wonderwall (Remastered)
const samplePlaylist = 'PL6bPxvf5dW5clc3y9wAoslzqUrmkZ5c-u'; // very large playlist

const ytmusic = new YTMusic();
const query = 'edm playlist';

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
    test('#1', async () => {
      try {
        const results = await ytmusic.getArtist('MPLAUCmMUZbaYdNH0bEd1PAlAqsA');
      } catch (e: any) {
        expect(e.message).toBe('Function not implemented.');
      }
    });
  });
  // These tests require auth, which is not yet implemented... TODO @codyduong
  // describe('Search Library', () => {
  //   test('#1', async () => {
  //     const results = await ytmusic.search('garrix', {scope: 'library'})
  //     expect(results).toBeGreaterThan(5)
  //   })
  //   test('#2', async () => {
  //     const results = await ytmusic.search('bergersen', {scope: 'library', filter: 'songs', limit: 40})
  //     expect(results).toBeGreaterThan(10)
  //   })
  //   test('#3', async () => {
  //     const results = await ytmusic.search('garrix', {scope: 'library', filter: 'albums', limit: 40})
  //     expect(results).toBeGreaterThanOrEqual(4)
  //   })
  //   test('#4', async () => {
  //     const results = await ytmusic.search('garrix', {scope: 'library', filter: 'artists', limit: 40})
  //     expect(results).toBeGreaterThanOrEqual(1)
  //   })
  //   test('#5', async () => {
  //     const results = await ytmusic.search('garrix', {scope: 'library', filter: 'playlists'})
  //     expect(results).toBeGreaterThanOrEqual(1)
  //   })
  // });
  describe('Get Artist', () => {});
  describe('Get Artist (non YT Music Channel)', () => {});
  describe('Get Artist Albums', () => {});
  describe('Get Artist Singles', () => {});
  describe('Get User', () => {});
  describe('Get User Playlists', () => {});
  describe('Get Album Browse Id', () => {});
  describe('Get Album', () => {});
  describe('Get Song', () => {});
  describe('Get Lyrics', () => {});
  describe('Get Signature Timestamp', () => {});
});
