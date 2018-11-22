import { Driver } from 'alaska';
import { SmsDriverOptions } from '.';

export default class SmsDriver<T, O extends SmsDriverOptions> extends Driver<O, null> {
  static readonly classOfSmsDriver = true;
  readonly instanceOfSmsDriver = true;
}
