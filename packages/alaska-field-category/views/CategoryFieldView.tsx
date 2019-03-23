import * as React from 'react';
import * as _ from 'lodash';
import * as immutable from 'seamless-immutable';
import * as shallowEqualWithout from 'shallow-equal-without';
import MultiLevelSelect from './MultiLevelSelect';
import { FieldViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';
import * as tr from 'grackle';
import { SelectOption } from '@samoyed/types';

interface State {
  options?: SelectOption[];
  filters: any;
}

export default class CategoryFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      filters: {}
    };
  }

  static getDerivedStateFromProps(nextProps: FieldViewProps, prevState: State): State | null {
    const { field, record } = nextProps;
    let filters = _.reduce(field.filters || {}, (res: any, v: any, key: string) => {
      res[key] = v;
      if (_.isString(v) && v[0] === ':') {
        res[key] = record[v.substr(1)];
      }
      return res;
    }, {});
    if (!_.isEqual(filters, prevState.filters)) {
      return { filters, options: null };
    }
    return null;
  }

  shouldComponentUpdate(nextProps: FieldViewProps, state: State) {
    return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
      || !shallowEqualWithout(state, this.state);
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  init() {
    if (this.state.options) return;
    let { field } = this.props;
    relationQuery({
      model: field.model,
      filters: _.assign({ _limit: 10000 }, this.state.filters)
    }).then((relation) => {
      let options = _.map(relation.results, (val) => ({
        label: val[field.modelTitleField] || val.title || val._id,
        value: val._id,
        parent: val.parent
      }));
      this.setState({ options: immutable(options) });
    });
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
        values = values.flatMap((item: SelectOption, idx: number) => {
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

  handleRemove = (index: number) => {
    const { onChange, value } = this.props;
    onChange(immutable(value).flatMap((v: any, k: number) => {
      if (k === index) return [];
      return [v];
    }));
  };

  render() {
    let {
      className, field, value, disabled, error, model
    } = this.props;
    let { help } = field;
    className += ' category-field';
    if (error) {
      className += ' is-invalid';
      help = error as string;
    }
    let helpElement = help ? <small className={error ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;
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
        onRemove={() => this.handleRemove(index)}
        options={this.state.options}
      />));
      if (!disabled) {
        inputElement.push(<button className={`btn btn-success ${value.length > 0 ? 'mt-2' : ''}`} key="add" onClick={this.handleAdd}>
          <i className="fa fa-plus" /> {tr('Add categories', model.serviceId)}
        </button>);
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
