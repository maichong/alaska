import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';
import * as tr from 'grackle';
import { ObjectMap } from 'alaska';
import { Record, query, FieldViewProps } from 'alaska-admin-view';
import Select from '@samoyed/select';
import CheckboxGroup from '@samoyed/checkbox-group';
import Switch from '@samoyed/switch';

interface Props extends FieldViewProps {
  value: Prop[];
};

type State = {
  props: Record[],
  valueMap: ObjectMap<Prop>
};

interface Prop {
  id: string;
  title: string;
  sku: boolean;
  filter: boolean;
  values: PropValue[];
}

interface PropValue {
  id: string;
  title: string;
}

export default class PropertyEditor extends React.Component<Props, State> {
  static contextTypes = {
    views: PropTypes.object
  };

  _cat: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      props: [],
      valueMap: _.keyBy(props.value, 'id')
    };
  }

  componentDidMount() {
    let { record } = this.props;
    if (record.cat) {
      this.fetchProps(record.cat);
    }
  }

  componentWillReceiveProps(props: Props) {
    let newState: State = {} as State;
    if (props.value) {
      newState.valueMap = _.keyBy(props.value, 'id');
      this.setState(newState);
    }
    if (props.record.cat !== this._cat) {
      this.fetchProps(props.record.cat);
    }
  }

  handleChange = () => {
    let { props, valueMap } = this.state;
    let values: Prop[] = [];
    _.forEach(props, (p) => {
      let prop = valueMap[p.id];
      if (prop && prop.values.length) {
        values.push(prop);
      }
    });
    this.props.onChange(values);
  };

  fetchProps = (cat: any) => {
    cat = cat || this.props.record.cat;
    if (this._cat === cat) return;
    this._cat = cat;
    query({
      model: 'alaska-property.Property',
      filters: {
        cat
      },
      populations: ['values']
    }).then((res) => {
      let props = res.results.map((prop) => {
        return prop.set('options', _.map(prop.values, (v) => ({ label: v.title, value: v._id })));
      });
      this.setState({
        props,
      });
    });
  };

  render() {
    const { record, model } = this.props;
    if (!record.cat) {
      return <p className="text-center">{tr('Select category first!', model.serviceId)}</p>;
    }
    let props = this.state.props;
    if (!props || !props.length) {
      return <p className="text-center">Loading...</p>;
    }

    let valueMap = this.state.valueMap;
    let me = this;

    let list = _.map(props, (p) => {
      if (!valueMap[p.id]) {
        valueMap[p.id] = {
          id: p.id,
          title: p.title,
          sku: p.sku,
          filter: p.filter,
          values: []
        };
      }

      function handleChange(v: any) {
        if (p.multi) {
          valueMap[p.id].values = v;
        } else {
          valueMap[p.id].values = v ? [v] : [];
        }
        me.setState({ valueMap }, me.handleChange);
      }

      let value = valueMap[p.id].values;

      if (!p.multi && Array.isArray(value)) {
        // @ts-ignore
        value = value.length ? value[0] : '';
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
            onChange={handleChange}
          />
          <p className="help-block">{helpElement}</p>
        </div>
      </div>);
    });

    return (
      <div>{list}</div>
    );
  }
}
