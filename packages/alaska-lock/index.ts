import { Driver } from 'alaska';
import { LockDriverOptions } from '.';

export default class LockDriver<O extends LockDriverOptions, D> extends Driver<O, D> {
  static readonly classOfLockDriver = true;
  readonly instanceOfLockDriver = true;
  readonly locked = false;
}
