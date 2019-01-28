import { Driver } from 'alaska';
import { SmsDriverOptions } from '.';

export default class SmsDriver<T, O extends SmsDriverOptions, D> extends Driver<O, D> {
  static readonly classOfSmsDriver = true;
  readonly instanceOfSmsDriver = true;
}
