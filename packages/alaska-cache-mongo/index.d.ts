import CacheDriver, { CacheDriverConfig } from 'alaska-cache';
import { Collection, MongoClientOptions } from 'mongodb';

export interface MongoCacheDriverConfig extends CacheDriverConfig, MongoClientOptions {
  uri: string;
  collection: string;
}

export default class MongoCacheDriver<T> extends CacheDriver<T, MongoCacheDriverConfig, Collection> {
}
