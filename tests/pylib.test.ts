import fs from 'fs';
import YTMusic from '../src/index';

const ytmusic = new YTMusic();

const query = 'edm playlist';

const readFile = (s: string): any =>
  JSON.parse(
    fs.readFileSync(`${__dirname}/pylib/results/${s}.json`, {
      encoding: 'utf8',
    })
  );

describe.skip('Browsing', () => {
  describe('Search', () => {
    test('#1', async () => {
      const results = await ytmusic.search(query);
      expect(results).toMatchObject(readFile('Search#1'));
    });
    test('#2', async () => {
      const results = await ytmusic.search(
        'Martin Stig Andersen - Deteriation',
        {
          ignoreSpelling: true,
        }
      );
      expect(results).toMatchObject(readFile('Search#2'));
    });
    test('#3', async () => {
      const results = await ytmusic.search(query, { filter: 'songs' });
      expect(results).toMatchObject(readFile('Search#3'));
    });
    test('#4', async () => {
      const results = await ytmusic.search(query, { filter: 'videos' });
      expect(results).toMatchObject(readFile('Search#4'));
    });
    test('#5', async () => {
      const results = await ytmusic.search(query, {
        filter: 'albums',
        limit: 40,
      });
      expect(results).toMatchObject(readFile('Search#5'));
    });
    test('#6', async () => {
      const results = await ytmusic.search('project-2', {
        filter: 'artists',
        ignoreSpelling: true,
      });
      expect(results).toMatchObject(readFile('Search#6'));
    });
    test('#7', async () => {
      const results = await ytmusic.search('classical music', {
        filter: 'playlists',
      });
      expect(results).toMatchObject(readFile('Search#7'));
    });
    test('#8', async () => {
      const results = await ytmusic.search('classical music', {
        filter: 'playlists',
        ignoreSpelling: true,
      });
      expect(results).toMatchObject(readFile('Search#8'));
    });
    test('#9', async () => {
      const results = await ytmusic.search('clasic rock', {
        filter: 'community_playlists',
        ignoreSpelling: true,
      });
      expect(results).toMatchObject(readFile('Search#9'));
    });
    test('#10', async () => {
      const results = await ytmusic.search('hip hop', {
        filter: 'featured_playlists',
      });
      expect(results).toMatchObject(readFile('Search#10'));
    });
  });
});
