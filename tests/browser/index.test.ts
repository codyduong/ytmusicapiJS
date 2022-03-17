import YTMusic from '../../src';

test('Basic Construct', async () => {
  const ytm = new YTMusic();
  expect(ytm).toBeDefined();
  expect(await ytm.search('Red Calliope')).toBeDefined();
});
