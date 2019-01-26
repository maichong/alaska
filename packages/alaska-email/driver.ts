import { Driver } from 'alaska';
import { EamilDriverOptions } from '.';

export default class EmailDriver<T=any, O extends EamilDriverOptions=any, D=any> extends Driver<O, D> {
  static readonly classOfEmailDriver = true;
  readonly instanceOfEmailDriver = true;
}
