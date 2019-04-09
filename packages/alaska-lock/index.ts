import { Driver } from 'alaska';
import { LockDriverConfig } from '.';

export default class LockDriver<C extends LockDriverConfig, D> extends Driver<C, D> {
  static readonly classOfLockDriver = true;
  readonly instanceOfLockDriver = true;
  readonly locked = false;
}
