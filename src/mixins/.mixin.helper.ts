import type { _YTMusic } from '../ytmusic';

//https://www.bryntum.com/blog/the-mixin-pattern-in-typescript-all-you-need-to-know/
type AnyFunction<A = any> = (...input: any[]) => A;
export type GConstructor<T> = new (...args: any[]) => T;
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;
