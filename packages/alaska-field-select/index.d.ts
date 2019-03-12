import { Field } from 'alaska-model';
import { FilterFieldOptions } from 'alaska-admin-view';

export interface SelectFilterOptions extends FilterFieldOptions {
  select?: boolean;
  checkbox?: boolean;
  switch?: boolean;
}

export default class SelectField extends Field {
}
