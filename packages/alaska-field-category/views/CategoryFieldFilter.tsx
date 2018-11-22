import * as _ from 'lodash';
import * as React from 'react';
import MultiLevelSelect from './MultiLevelSelect';
import * as tr from 'grackle';
import { FilterViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';

interface State {
  value: any;
  inverse: boolean;
  error: string | boolean;
  options: Object[];
}

export default class CategoryFieldFilter extends React.Component<FilterViewProps, State> {
  constructor(props: FilterViewProps) {
    super(props);
    let value: any = props.value || {};
    if (typeof value !== 'object') {
      value = { value };
    }
    this.state = {
      value: value.value,
      inverse: value.inverse === true || value.inverse === 'true',
      error: typeof value.value === 'undefined',
      options: []
    };
  }

  componentWillMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps: FilterViewProps) {
    let value: any = nextProps.value || {};
    if (nextProps.value !== this.props.value) {
      if (typeof value !== 'object') {
        value = { value };
      }
      this.setState(value);
    }
  }

  async init() {
    let { field, model } = this.props;
    if (!model) return;
    let relation = await relationQuery({
      model: model.id,
      filters: field.filters || {}
    });
    let options = _.map(relation.results, (val) => {
      let temp = {
        label: val[field.path] || val.title || val._id,
        value: val[field.path][0]
      };
      return temp;
    });
    this.setState({ options });
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleChange = (value: any) => {
    this.setState({ value }, this.handleBlur);
  };

  handleBlur = () => {
    let { value, inverse } = this.state;
    if (typeof value === 'undefined') {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });

    this.props.onChange(inverse ? { value, inverse } : value);
  };

  render() {
    let { className, field, onClose } = this.props;
    const {
      value, inverse, error, options
    } = this.state;
    const buttonClassName = 'btn btn-light';
    const buttonClassNameActive = 'btn btn-success';
    className += ' category-field-filter' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="col-10">
          <MultiLevelSelect
            options={options}
            value={value}
            onChange={this.handleChange}
          />
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
