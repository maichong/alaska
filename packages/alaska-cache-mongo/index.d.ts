import CacheDriver, { CacheDriverOptions } from 'alaska-cache';
import { Collection, MongoClientOptions } from 'mongodb';

export interface MongoCacheDriverOptions extends CacheDriverOptions, MongoClientOptions {
  uri: string;
  collection: string;
}

export default class MongoCacheDriver<T> extends CacheDriver<T, MongoCacheDriverOptions, Collection> {
}
