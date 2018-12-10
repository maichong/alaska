
import * as React from 'react';
import Select from '@samoyed/select';
import { SelectValue, SelectOption } from '@samoyed/types';
import { FilterViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';
import * as _ from 'lodash';
import { Filter, FilterValue, FilterObject } from 'alaska-model';
import * as tr from 'grackle';

function getFilters(filters?: Object) {
  if (!filters) return {};
  return _.reduce(filters, (res: { [key: string]: any }, value, key) => {
    if (!_.isString(value) || value[0] !== ':') {
      res[key] = value;
    }
    return res;
  }, {});
}

interface FilterState {
  _value: any;
  value: SelectValue;
  inverse: boolean;
  error: boolean;
  options: SelectOption[];
}

export default class RelationshipFieldFilter extends React.Component<FilterViewProps, FilterState> {
  constructor(props: FilterViewProps) {
    super(props);
    this.state = {
      _value: '',
      value: '',
      inverse: false,
      error: false,
      options: []
    };
  }

  static getDerivedStateFromProps(nextProps: FilterViewProps, prevState: FilterState) {
    if (nextProps.value !== prevState._value) {
      let value: SelectValue;
      let inverse = false;
      let error = false;
      if (nextProps.value && typeof nextProps.value === 'object') {
        let condition: FilterObject = nextProps.value as FilterObject;
        if (condition.$eq) {
          value = condition.$eq.toString();
        } else if (condition.$ne) {
          value = condition.$ne.toString();
          inverse = true;
        }
      } else {
        // @ts-ignore
        value = nextProps.value;
      }
      if (!value) {
        error = true;
      }
      return {
        _value: nextProps.value,
        value,
        inverse,
        error
      };
    }
    return null;
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleSearch = (keyword: string) => {
    let { field } = this.props;
    const ref: string = field.model;
    if (!ref) return;
    relationQuery({
      model: field.model,
      search: keyword,
      ...getFilters(field.filters)
    }).then((res) => {
      let options = _.map(res.results || [], (val) => ({
        label: val[field.modelTitleField] || val.title || val._id,
        value: val._id
      }));
      this.setState({ options });
    });
  };

  handleChange = (value: SelectValue) => {
    this.setState({ value }, () => this.handleBlur());
  };

  handleBlur = () => {
    let { value, inverse } = this.state;
    if (typeof value === 'undefined') {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let tag = '$eq';
    if (inverse) {
      tag = '$ne';
    }
    this.props.onChange({ [tag]: value });
  };

  render() {
    let { className, field, onClose } = this.props;
    const {
      value, inverse, error, options
    } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    className += ' relationship-field-filter align-items-center' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="form-inline col-10">
          <div className="form-group" style={{ minWidth: 230 }}>
            <Select
              className="Select"
              options={options}
              onInputChange={this.handleSearch}
              value={value}
              onChange={this.handleChange}
            />
          </div>
          <a
            className={inverse ? buttonClassNameActive : buttonClassName}
            onClick={this.handleInverse}
          >{tr('inverse')}
          </a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
