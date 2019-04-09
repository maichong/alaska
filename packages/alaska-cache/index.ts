import { Driver } from 'alaska';
import { CacheDriverConfig } from '.';

export default class CacheDriver<T, C extends CacheDriverConfig, D> extends Driver<C, D> {
  static readonly classOfCacheDriver = true;
  readonly instanceOfCacheDriver = true;
}
