import { Field } from 'alaska-model';
import { FilterFieldOptions } from 'alaska-admin-view';

export interface DatetimeFilterOptions extends FilterFieldOptions {
  range?: boolean;
  year?: boolean;
  month?: boolean;
  format?: string;
}

export default class DatetimeField extends Field {
}
