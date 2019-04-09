import { Driver } from 'alaska';
import { EamilDriverConfig } from '.';

export default class EmailDriver<T=any, C extends EamilDriverConfig=any, D=any> extends Driver<C, D> {
  static readonly classOfEmailDriver = true;
  readonly instanceOfEmailDriver = true;
}
