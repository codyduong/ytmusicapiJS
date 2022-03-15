import i18next from 'i18next';
import YTMusic from '../src';

const ytm = new YTMusic({ language: 'en' });
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const quickQuery = async (c: InstanceType<typeof YTMusic>) => {
  return {
    artist: await c.search('edm', { limit: 1, filter: 'artists' }),
    // playlist: await c.search<'playlists'>('edm', {
    //   limit: 1,
    //   filter: 'playlists',
    // }),
    song: await c.search('edm', { limit: 1, filter: 'songs' }),
    video: await c.search('edm', { limit: 1, filter: 'videos' }),
    // station: await c.search<'artists'>('edm', {limit: 1, filter: 'artists'}),
  };
};

test('Multiple instances different languages', async () => {
  try {
    const _ = new YTMusic({ language: 'de' });
  } catch (e) {
    const error = e as any;
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe(
      'Multiple instances of YTMusic are not supported with different languages, please use changeLangauge instance function instead!'
    );
  }
});
/**
 * LOCALE
 * Currently it's quite hard to test locale while using ytm class, maybe
 * better to mock the class. TODO @codyduong
 */
describe('Locales', () => {
  //artist
  //song
  //videos
  test('de', async () => {
    await ytm.changeLanguage('de');
    const { artist, song, video } = await quickQuery(ytm);
    expect(artist[0]['category'].toLowerCase()).toBe(i18next.t('artist'));
    //expect(playlist[0]).toBe(i18next.t('playlist'));
    expect(song[0]['category'].toLowerCase()).toBe(i18next.t('song'));
    expect(video[0]['category'].toLowerCase()).toBe(i18next.t('videos'));
    //todo @codyduong test more locale keys
  });
  test.skip('es', async () => {
    await ytm.changeLanguage('es');
    const { video } = await quickQuery(ytm);
    //expect(artist[0]['category'].toLowerCase()).toBe(i18next.t('artist'));
    //expect(song[0]['category'].toLowerCase()).toBe(i18next.t('song'));
    expect(video[0]['category'].toLowerCase()).toBe(i18next.t('videos'));
  });
  test.skip('fr', async () => {
    await ytm.changeLanguage('fr');
    const { artist, song, video } = await quickQuery(ytm);
    expect(artist[0]['category'].toLowerCase()).toBe(i18next.t('artist'));
    expect(song[0]['category'].toLowerCase()).toBe(i18next.t('song'));
    expect(video[0]['category'].toLowerCase()).toBe(i18next.t('videos'));
  });
  test.skip('it', async () => {
    await ytm.changeLanguage('it');
    const { artist, song, video } = await quickQuery(ytm);
    expect(artist[0]['category'].toLowerCase()).toBe(i18next.t('artist'));
    expect(song[0]['category'].toLowerCase()).toBe(i18next.t('song'));
    expect(video[0]['category'].toLowerCase()).toBe(i18next.t('videos'));
  });
  test.skip('ja', async () => {
    await ytm.changeLanguage('ja');
    const { artist, song, video } = await quickQuery(ytm);
    expect(artist[0]['category'].toLowerCase()).toBe(i18next.t('artist'));
    expect(song[0]['category'].toLowerCase()).toBe(i18next.t('song'));
    expect(video[0]['category'].toLowerCase()).toBe(i18next.t('videos'));
  });
});
