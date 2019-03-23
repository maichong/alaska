import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import Select from '@samoyed/select';
import CheckboxGroup from '@samoyed/checkbox-group';
import Switch from '@samoyed/switch';
import { FieldViewProps } from 'alaska-admin-view';
import relationQuery from 'alaska-admin-view/utils/query';
import { SelectOption } from '@samoyed/types';

function getOptionValue(opt: any) {
  if (Array.isArray(opt)) return '';
  if (opt && typeof opt === 'object') return opt.value;
  return opt;
}

interface State {
  defaultOptions: SelectOption[];
  filters: any;
}

export default class RelationshipFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      defaultOptions: [],
      filters: {}
    };
  }

  static getDerivedStateFromProps(nextProps: FieldViewProps, prevState: State): Partial<State> | null {
    const { field, record } = nextProps;
    let filters = _.reduce(field.filters || {}, (res: any, v: any, key: string) => {
      res[key] = v;
      if (_.isString(v) && v[0] === ':') {
        res[key] = record[v.substr(1)];
      }
      return res;
    }, {});
    if (!_.isEqual(filters, prevState.filters)) {
      return { filters };
    }
    return null;
  }

  shouldComponentUpdate(nextProps: FieldViewProps, state: State) {
    return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
      || !shallowEqualWithout(state, this.state);
  }

  componentDidMount() {
    this.handleSearch('', (defaultOptions: SelectOption[]) => {
      this.setState({ defaultOptions });
    });
  }

  componentDidUpdate(nextProps: FieldViewProps, state: State) {
    if (!_.isEqual(this.state.filters, state.filters)) {
      this.handleSearch('', (defaultOptions: SelectOption[]) => {
        this.setState({ defaultOptions });
      });
    }
  }

  handleSearch = (keyword: string, callback: Function) => {
    const { field } = this.props;
    const { filters } = this.state;
    if (!field || !field.model) return;
    relationQuery({
      model: field.model,
      search: keyword,
      // TODO: 优化性能
      filters: _.assign({}, filters, { _limit: keyword ? 20 : 1000 })
    }).then((relation) => {
      let options = _.map(relation.results, (val) => ({
        label: val[field.modelTitleField] || val.title || val._id,
        value: val._id
      }));
      callback(options);
    });
  }

  handleChange = (value: any) => {
    if (this.props.onChange) {
      let val: any = null;
      if (this.props.field.multi) {
        let arr: any = [];
        if (Array.isArray(value)) _.forEach(value, (o) => arr.push(getOptionValue(o)));
        val = arr;
      } else if (value) {
        val = getOptionValue(value);
      }
      this.props.onChange(val);
    }
  };

  render() {
    let {
      className, field, value, disabled, error
    } = this.props;
    const { defaultOptions } = this.state;
    let { help } = field;
    let viewClassName = 'relationship-select';
    let View: any = Select;
    let checkbox = field.multi && Array.isArray(value) && value.length > 20;
    if (checkbox || field.checkbox) {
      View = CheckboxGroup;
      viewClassName = 'relationship-checkbox';
    } else if (field.switch) {
      View = Switch;
      viewClassName = 'relationship-switch';
    }
    className += ' relationship-field';
    if (error) {
      className += ' is-invalid';
      help = error as string;
    }
    let helpElement = help ? <small className={error ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;

    let inputElement;
    if (field.fixed) {
      let [refServiceId, refModelName] = field.model.split('.');
      let opts: any = [];
      if (defaultOptions) {
        if (typeof value === 'string') {
          value = [value];
        }
        _.forEach(value, (v) => {
          let opt: any = _.find(defaultOptions, (o) => o.value === v);
          opts.push(opt || { value: v, label: v });
        });
      }

      inputElement = <p className="form-control-plaintext">{
        opts.map((opt: any) => (<a
          key={String(opt.value)}
          href={`#/edit/${refServiceId}/${refModelName}/${String(opt.value)}`}
          style={{ paddingRight: 10 }}
        >{opt.label}
        </a>))
      }
      </p>;
    } else {
      inputElement = (
        <View
          clearable={!disabled && !field.required}
          className={viewClassName}
          multi={field.multi || false}
          value={value}
          disabled={disabled}
          onChange={this.handleChange}
          options={defaultOptions}
          defaultOptions={defaultOptions}
          loadOptions={this.handleSearch}
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
