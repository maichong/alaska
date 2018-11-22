import { Driver } from 'alaska';
import { SubscribeDriverOptions } from '.';

export default class SubscribeDriver<T, O extends SubscribeDriverOptions, D> extends Driver<O, D> {
  static readonly classOfSubscribeDriver = true;
  readonly instanceOfSubscribeDriver = true;
}
