import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import Select from '@samoyed/select';
import Checkbox from '@samoyed/checkbox';
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
  options?: SelectOption[];
}

export default class RelationshipFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps: FieldViewProps) {
    // 只有 fixed 字段需要在此组件中加载options
    if (nextProps.value !== this.props.value && nextProps.field.fixed) {
      if (_.find(this.state.options, (o) => o.value === nextProps.value)) return;
      this.setState({ options: [] }, this.handleSearch);
    }
    if (!nextProps.field.fixed && this.state.options) {
      // eslint-disable-next-line
      this.setState({ options: undefined });
    }
  }

  shouldComponentUpdate(nextProps: FieldViewProps, state: State) {
    if (nextProps.record !== this.props.record && nextProps.field.fixed) {
      if (
        _.find(
          nextProps.field.filters,
          (v) => (_.isString(v) && v[0] === ':' && nextProps.record[v.substr(1)] !== this.props.record[v.substr(1)])
        )
      ) {
        setTimeout(this.handleSearch);
        return true;
      }
    }
    return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
      || this.state.options !== state.options;
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

  handleSearch = async (keyword?: string, callback?: Function) => {
    keyword = keyword || '';
    const { field, record } = this.props;
    if (!field || !field.model) return;
    let filters = _.reduce(field.filters || {}, (res: any, v: any, key: string) => {
      res[key] = v;
      if (_.isString(v) && v[0] === ':') {
        res[key] = record[v.substr(1)];
      }
      return res;
    }, {});
    relationQuery({
      model: field.model,
      search: keyword,
      filters
    }).then((res: any) => {
      let { results } = res;
      callback(null, {
        options: _.map(results || [], (val) => ({
          label: val[field.modelTitleField] || val.title || val._id,
          value: val._id
        }))
      }, callback);
    });
    let relation: any = [];
    let options: SelectOption[] = [];
    try {
      relation = await relationQuery({
        model: field.model,
        search: keyword,
        filters
      });
      let options = _.map(relation.results, (val) => {
        let temp = {
          label: val[field.modelTitleField] || val.title || val._id,
          value: val._id
        };
        return temp;
      });
      callback(null, { options });
    } catch (error) {
      callback(error, null);
    }

    this.setState({ options });
  };

  render() {
    let {
      className, field, value, disabled, errorText
    } = this.props;
    const { options } = this.state;
    let { help } = field;
    let viewClassName = 'Select';
    let View: any = Select;
    if (field.checkbox) {
      View = Checkbox;
      viewClassName = 'Checkbox';
    } else if (field.switch) {
      View = Switch;
      viewClassName = 'Switch';
    }
    className += ' relationship-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let refServiceId = '';
    let refModelName = '';
    // @ts-ignore 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (ref) {
      [refServiceId, refModelName] = ref.split('.');
    }

    let inputElement;
    if (field.fixed) {
      let opts: any = [];
      if (options) {
        if (typeof value === 'string') {
          value = [value];
        }
        _.forEach(value, (v) => {
          let opt: any = _.find(options, (o) => o.value === v);
          opts.push(opt || { value: v, label: v });
        });
      } else {
        this.handleSearch();
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
          className={viewClassName}
          multi={field.multi || false}
          value={value}
          disabled={disabled}
          onChange={this.handleChange}
          options={options}
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
