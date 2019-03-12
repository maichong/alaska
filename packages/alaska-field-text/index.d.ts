import { Field } from 'alaska-model';
import { FilterFieldOptions } from 'alaska-admin-view';

export interface TextFilterOptions extends FilterFieldOptions {
  exact?: boolean;
}

export default class TextFeild extends Field {
}
