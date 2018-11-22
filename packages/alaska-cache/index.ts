import { Driver } from 'alaska';
import { CacheDriverOptions } from '.';

export default class CacheDriver<T, O extends CacheDriverOptions, D> extends Driver<O, D> {
  static readonly classOfCacheDriver = true;
  readonly instanceOfCacheDriver = true;
}
