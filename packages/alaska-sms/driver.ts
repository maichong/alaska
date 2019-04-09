import { Driver } from 'alaska';
import { SmsDriverConfig } from '.';

export default class SmsDriver<T, C extends SmsDriverConfig, D> extends Driver<C, D> {
  static readonly classOfSmsDriver = true;
  readonly instanceOfSmsDriver = true;
}
