import type { YTMusic } from '../ytmusic';

type GConstructor<T = Record<string, any>> = new (...args: any[]) => T;

export type YTMusicBase = GConstructor<YTMusic>;
