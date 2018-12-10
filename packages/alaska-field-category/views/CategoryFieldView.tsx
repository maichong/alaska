import * as React from 'react';
import * as _ from 'lodash';
import * as immutable from 'seamless-immutable';
import * as shallowEqualWithout from 'shallow-equal-without';
import MultiLevelSelect from './MultiLevelSelect';
import { FieldViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';

interface Option {
  label: string;
  value: string;
  parent: undefined | string;
}
interface State {
  options: Option[];
}

export default class CategoryFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      options: immutable([])
    };
  }

  componentDidMount() {
    this.init();
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  async init() {
    let { field } = this.props;
    let relation = await relationQuery({
      model: field.model,
      filters: field.filters || {}
    });
    let options = _.map(relation.results, (val) => {
      let temp = {
        label: val[field.modelTitleField] || val.title || val._id,
        value: val._id,
        parent: val.parent
      };
      return temp;
    });
    this.setState({ options });
  }

  handleChange = (index: number, value: any) => {
    const { field, onChange, value: propValue } = this.props;
    if (!field.multi) {
      onChange(value);
    } else {
      let values: any = immutable([]);
      if (!Array.isArray(propValue)) {
        values = values.concat([propValue]);
      } else {
        values = values.concat(propValue);
      }
      if (!values.length) {
        values = values.concat([value]);
      } else {
        values = values.flatMap((item: Option, idx: number) => {
          if (index === idx) {
            return [value];
          }
          return [item];
        });
      }
      onChange(values);
    }
  };

  handleAdd = () => {
    const { onChange, value } = this.props;
    let values: any = immutable([]);
    if (!Array.isArray(value)) {
      values = values.concat([value]);
    } else {
      values = values.concat(value);
    }
    values = values.concat([null]);
    onChange(values);
  };

  render() {
    let {
      className, field, value, disabled, errorText
    } = this.props;
    let { help } = field;
    className += ' category-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.multi) {
      className += ' category-field-multi';
      if (!Array.isArray(value)) {
        value = [value];
      }
      inputElement = _.map(value, (v, index: number) => (<MultiLevelSelect
        key={index}
        value={v || ''}
        disabled={disabled}
        onChange={(val: any) => this.handleChange(index, val)}
        options={this.state.options}
      />));
      if (!disabled) {
        inputElement.push(<div className={`btn btn-success ${value.length > 0 ? 'mt-2' : ''}`} key="add" onClick={this.handleAdd}>
          <i className="fa fa-plus" />
        </div>);
      }
    } else {
      inputElement = (
        <MultiLevelSelect
          value={value || ''}
          disabled={disabled}
          onChange={(v: any) => this.handleChange(0, v)}
          options={this.state.options}
        />
      );
    }

    let label = field.nolabel ? '' : field.label;
    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
            {helpElement}
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
