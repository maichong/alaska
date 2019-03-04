import CacheDriver, { CacheDriverOptions } from 'alaska-cache';
import * as LRUCache from 'lru-cache';

export interface LruCacheDriverOptions<T> extends CacheDriverOptions, LRUCache.Options<string, T> {
}

export default class LruCacheDriver<T> extends CacheDriver<T, LruCacheDriverOptions<T>, LRUCache<string, T>> {
}
