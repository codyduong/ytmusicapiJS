import type { _YTMusic } from '../ytmusic';

type GConstructor<T = Record<string, any>> = new (...args: any[]) => T;

export type YTMusicBase = GConstructor<_YTMusic>;
