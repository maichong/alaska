import { Driver } from 'alaska';
import { SubscribeDriverConfig } from '.';

export default class SubscribeDriver<T, C extends SubscribeDriverConfig, D> extends Driver<C, D> {
  static readonly classOfSubscribeDriver = true;
  readonly instanceOfSubscribeDriver = true;
}
