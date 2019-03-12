import { Field } from 'alaska-model';
import { FilterFieldOptions } from 'alaska-admin-view';

export interface NumberFilterOptions extends FilterFieldOptions {
  range?: boolean;
}


export default class NumberField extends Field {
}
