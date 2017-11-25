// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { api } from 'alaska-admin-view';
import Select from 'alaska-field-select/views/Select';
import SelectCheckbox from 'alaska-field-select/views/SelectCheckbox';
import Switch from 'alaska-field-select/views/Switch';

type Props = {
  value: any,
  data: any,
  onChange: Function
};

type State = {
  goodsProps: any,
  valueMap: {}
};

export default class GoodsPropsEditor extends React.Component<Props, State> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  _cat: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      goodsProps: [],
      valueMap: this.arrayToMap(props.value)
    };
  }

  componentDidMount() {
    this.fetchProps();
  }

  componentWillReceiveProps(props: Props) {
    let newState = {};
    if (props.value) {
      newState.valueMap = this.arrayToMap(props.value);
      this.setState(newState);
    }
    if (props.data.cat !== this._cat) {
      this.fetchProps(props.data.cat);
    }
  }

  onChange = () => {
    let { goodsProps, valueMap } = this.state;
    let values = [];
    _.forEach(goodsProps, (p) => {
      let prop = valueMap[p.id];
      if (prop && prop.values.length) {
        values.push(prop);
      }
    });
    this.props.onChange(values);
  };

  fetchProps = (cat: any) => {
    let me = this;
    cat = cat || this.props.data.cat;
    if (this._cat === cat) return;
    this._cat = cat;
    api.get('goods-prop', {
      query: { cat }
    }).then((res) => {
      let map = {};
      _.forEach(res.results, (prop) => {
        map[prop.id] = prop;
        prop.options = _.map(prop.values, (v) => ({ label: v.title, value: v.id }));
      });
      me.setState({
        goodsProps: res.results
      });
    });
  };

  arrayToMap(array: Object[]): Object {
    let map = {};
    _.forEach(array, (v) => {
      map[v.id] = v;
    });
    return map;
  }

  render() {
    let props = this.props;
    let data = props.data;
    const { t } = this.context;
    if (!data.cat) {
      return <p className="text-center">{t('Select goods category first!', 'alaska-goods')}</p>;
    }
    let goodsProps = this.state.goodsProps;
    if (!goodsProps || !goodsProps.length) {
      return <p className="text-center">Loading...</p>;
    }

    let valueMap = this.state.valueMap;
    let me = this;

    let list = [];
    goodsProps.forEach((p) => {
      if (!valueMap[p.id]) {
        valueMap[p.id] = {
          id: p.id,
          title: p.title,
          sku: p.sku,
          filter: p.filter,
          values: []
        };
      }

      function handleChange(value) {
        if (p.multi) {
          valueMap[p.id].values = value;
        } else {
          valueMap[p.id].values = value ? [value] : [];
        }
        me.setState({ valueMap }, me.onChange);
      }

      let value = valueMap[p.id].values;

      if (!p.multi) {
        value = value.length ? value[0] : '';
      }

      let help = [];
      if (p.required) {
        help.push(t('Required', 'alaska-goods'));
      }
      if (p.sku) {
        help.push(t('SKU', 'alaska-goods'));
      }
      if (p.multi) {
        help.push(t('Multi', 'alaska-goods'));
      }
      if (p.filter) {
        help.push(t('Filter', 'alaska-goods'));
      }
      if (p.input) {
        help.push(t('Input', 'alaska-goods'));
      }
      if (help.length) {
        help = `( ${help.join(' ')} ) `;
      } else {
        help = '';
      }
      if (p.help) {
        help += p.help;
      }

      let View = Select;
      if (!p.input && p.checkbox) {
        View = SelectCheckbox;
      } else if (!p.input && p.switch) {
        View = Switch;
      }

      list.push(<div className="form-group" key={p.id}>
        <label className="control-label col-xs-2">{p.title}</label>
        <div className="col-xs-10">
          <View
            value={value}
            multi={p.multi}
            options={p.options}
            allowCreate={p.input}
            onChange={handleChange}
          />
          <p className="help-block">{help}</p>
        </div>
      </div>);
    });

    return (
      <div>{list}</div>
    );
  }
}
