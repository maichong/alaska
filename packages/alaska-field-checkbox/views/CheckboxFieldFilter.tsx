import * as React from 'react';
import { FilterViewProps } from 'alaska-admin-view';
import Checkbox from '@samoyed/checkbox';

export default function (props: FilterViewProps) {
  let { className, field, onChange, value } = props;
  return (
    <div className={`${className} checkbox-field-filter form-check col-auto`}>
      <Checkbox
        onChange={(v: boolean) => onChange(v || undefined)}
        value={value === true || value === 'true'}
        label={field.label}
      />
    </div>
  );
}
