import CacheDriver, { CacheDriverConfig } from 'alaska-cache';
import * as LRUCache from 'lru-cache';

export interface LruCacheDriverConfig<T> extends CacheDriverConfig, LRUCache.Options<string, T> {
}

export default class LruCacheDriver<T> extends CacheDriver<T, LruCacheDriverConfig<T>, LRUCache<string, T>> {
}
