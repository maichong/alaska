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
    this.state = {
    };
  }

  shouldComponentUpdate(nextProps: FieldViewProps, state: State) {
    return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  componentDidMount() {
    this.handleInput('');
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

  handleInput = (keyword: string) => {
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
    }).then((relation) => {
      let options = _.map(relation.results, (val) => {
        let temp = {
          label: val[field.modelTitleField] || val.title || val._id,
          value: val._id
        };
        return temp;
      });
      this.setState({ options });
    });
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

    let inputElement;
    if (field.fixed) {
      let [refServiceId, refModelName] = field.model.split('.');
      let opts: any = [];
      if (options) {
        if (typeof value === 'string') {
          value = [value];
        }
        _.forEach(value, (v) => {
          let opt: any = _.find(options, (o) => o.value === v);
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
          className={viewClassName}
          multi={field.multi || false}
          value={value}
          disabled={disabled}
          onChange={this.handleChange}
          options={options}
          onInputChange={this.handleInput}
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
