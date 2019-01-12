import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import SelectFieldView from 'alaska-field-select/views/SelectFieldView';
import { FieldViewProps, Field, store } from 'alaska-admin-view';

interface FieldProps extends FieldViewProps {
  field: Field & { checkbox: boolean; switch: boolean };
}

export default class ModelFieldView extends React.Component<FieldProps> {
  render() {
    const { field, ...props } = this.props;
    let options: any[] = _.map(store.getState().settings.models, (model) => ({
      label: tr(model.label, model.serviceId),
      value: model.id
    }));
    return (
      <SelectFieldView {...props} field={_.assign({}, field, { options })}>
      </SelectFieldView>
    );
  }
}
