import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import { ObjectMap } from 'alaska';
import { query, FieldViewProps } from 'alaska-admin-view';
import Select from '@samoyed/select';
import CheckboxGroup from '@samoyed/checkbox-group';
import Switch from '@samoyed/switch';
import { PropData } from '..';

interface Props extends FieldViewProps {
  value: immutable.Immutable<PropData[]>;
}

interface State {
  props?: immutable.Immutable<PropertyRecord[]>;
  valueMap: ObjectMap<immutable.Immutable<PropData>>;
  filters: any;
  _value?: any;
}

interface PropertyRecord {
  _id: string;
  title: string;
  icon: string;
  pic: string;
  desc: string;
  parent: string;
  multi: boolean;
  sku: boolean;
  filter: boolean;
  required: boolean;
  input: boolean;
  switch: boolean;
  checkbox: boolean;
  help: string;
  values: Array<{ _id: string; title: string; }>;
  options: Array<{ value: string; label: string }>;
  valueMap: ObjectMap<{ _id: string; title: string; }>;
}

export default class PropertyEditor extends React.Component<Props, State> {
  _cat: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      valueMap: _.keyBy(props.value, 'id'),
      filters: {}
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    const { field, record } = nextProps;
    let nextState: Partial<State> = {};
    // FIXME: cats 索引bug
    let filters = _.assign({ cats: record.cat }, field.filters);
    if (!_.isEqual(filters, prevState.filters)) {
      nextState = { filters, props: null };
    }
    if (nextProps.value !== prevState._value) {
      nextState._value = nextProps.value;
      if (nextProps.value) {
        nextState.valueMap = _.keyBy(nextProps.value, 'id');
      }
    }
    return nextState;
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  init = () => {
    if (this.state.props) return;
    query({
      model: 'alaska-property.Property',
      filters: this.state.filters,
      populations: ['values']
    }).then((res) => {
      let props = res.results.map((prop: immutable.Immutable<PropertyRecord>) => {
        let options: any[] = [];
        let valueMap: any = {};
        _.forEach(prop.values, (v) => {
          let value = immutable({ label: v.title, value: v._id });
          options.push(value);
          valueMap[v._id] = v;
        });
        return prop.merge({ options, valueMap });
      });
      this.setState({
        props: immutable(props)
      });
    });
  };

  handleChange = () => {
    let { props, valueMap } = this.state;
    let value: PropData[] = [];
    _.forEach(props, (p) => {
      let prop = valueMap[p._id];
      if (prop && prop.values.length) {
        value.push(prop);
      }
    });
    this.props.onChange(immutable(value));
  };

  render() {
    const { disabled } = this.props;
    const { props, valueMap } = this.state;
    if (!props) {
      return <p className="text-center">Loading...</p>;
    }
    if (!props.length) {
      return <p className="text-center">{tr('No properties found')}</p>;
    }

    let me = this;

    let list = _.map(props, (p) => {
      if (!valueMap[p._id]) {
        valueMap[p._id] = immutable({
          id: p._id,
          title: p.title,
          sku: p.sku,
          filter: p.filter,
          values: []
        });
      }

      function handleChange(v: any) {
        if (!p.multi) {
          v = v ? [v] : [];
        }
        let values = _.map(v, (id: string) => {
          let value = p.valueMap[id];
          return value ? { id, title: value.title } : { title: id };
        });
        valueMap[p._id] = valueMap[p._id].set('values', values);
        me.setState({ valueMap }, me.handleChange);
      }

      let value: string | string[] = '';

      let values = valueMap[p._id].values;
      if (!p.multi) {
        value = values && values.length ? values[0].id || values[0].title : '';
      } else {
        value = _.map(values, (v) => v.id || v.title);
      }

      let helps = [];
      if (p.sku) {
        helps.push(tr('SKU property', 'alaska-porterty'));
      }
      if (p.required) {
        helps.push(tr('Required', 'alaska-porterty'));
      }
      if (p.multi) {
        helps.push(tr('Multipe', 'alaska-porterty'));
      }
      if (p.filter) {
        helps.push(tr('Allow filter', 'alaska-porterty'));
      }
      if (p.input) {
        helps.push(tr('Allow input', 'alaska-porterty'));
      }

      let helpElement = helps.length ? `( ${helps.join(' ')} ) ` : '';
      if (p.help) {
        helpElement += p.help;
      }

      let View = Select;
      if (!p.input && p.checkbox) {
        View = CheckboxGroup;
      } else if (!p.input && p.switch) {
        View = Switch;
      }

      return (<div className="form-group" key={p._id}>
        <label className="control-label col-xs-2">{p.title}</label>
        <div className="col-xs-10">
          <View
            value={value}
            multi={p.multi}
            options={p.options}
            allowCreate={p.input}
            disabled={disabled}
            onChange={handleChange}
          />
          <div><small className="text-muted">{helpElement}</small></div>
        </div>
      </div>);
    });

    return (
      <div>{list}</div>
    );
  }
}
