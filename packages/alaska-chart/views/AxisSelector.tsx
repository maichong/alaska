import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import { FieldViewProps, Model, store } from 'alaska-admin-view';
import SelectFieldView from 'alaska-field-select/views/SelectFieldView';
import { SelectOption } from '@samoyed/types';

interface State {
  model?: Model;
  _keyAxisType?: any;
  options: SelectOption[];
}

export default class AxisSelector extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      options: []
    };
  }

  static getDerivedStateFromProps(nextProps: FieldViewProps, prevState: State): Partial<State> | null {
    let { record, field } = nextProps;
    let model = store.getState().settings.models[record.model];
    if (model === prevState.model && record.keyAxisType === prevState._keyAxisType) return null;
    let allowedDataPlains: Set<string> = new Set();
    if (field.path === 'keyAxis') {
      // x轴
      switch (record.keyAxisType) {
        case 'time':
        case 'cycle':
          allowedDataPlains.add('date');
          break;
        case 'category':
          allowedDataPlains.add('string');
          allowedDataPlains.add('bool');
          allowedDataPlains.add('objectid');
        // 这里不能break
        case 'value':
          allowedDataPlains.add('number');
          break;
      }
    } else {
      // y轴
      allowedDataPlains.add('number');
    }

    let options: SelectOption[] = [];
    _.forEach(model.fields, (fieldItem, path) => {
      if (path === '_id') return;
      if (!allowedDataPlains.has(fieldItem.plainName)) return;
      options.push({
        label: tr(fieldItem.label, model.serviceId),
        value: path
      });
    });
    return {
      _keyAxisType: record.keyAxisType,
      model,
      options
    };
  }

  render() {
    const { field, ...props } = this.props;
    const { options } = this.state;
    return (
      <SelectFieldView {...props} field={_.assign({}, field, { options })}>
      </SelectFieldView>
    );
  }
}
