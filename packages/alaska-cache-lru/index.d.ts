import CacheDriver, { CacheDriverOptions } from 'alaska-cache';
import * as LRU from 'lru-cache';

export interface LruCacheDriverOptions extends CacheDriverOptions, LRU.Options {
}

export default class LruCacheDriver<T> extends CacheDriver<T, LruCacheDriverOptions, LRU.Cache<string, any>> {
}
