import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import * as immutable from 'seamless-immutable';
import { ObjectMap } from 'alaska';
import { FieldViewProps, ImageData, query, views } from 'alaska-admin-view';
import { PropData, PropValueData } from 'alaska-property';

interface PropMapData extends PropData {
  valueMap: ObjectMap<PropValueData>;
}

interface SkuData {
  _id?: string;
  key: string;
  desc: string;
  pic?: ImageData;
  goods: string;
  price?: number;
  discount?: number;
  inventory?: number;
  volume?: number;
  props: PropData[];
  createdAt?: string;
}

interface Props extends FieldViewProps {
  value: immutable.Immutable<SkuData[]>;
}

interface State {
  _record: any;
  props: PropMapData[];
  propsMap: ObjectMap<PropMapData>;
  list: immutable.Immutable<SkuData[]>;
  oldSkus: ObjectMap<SkuData>;
}

interface SkuItemProps {
  disabled: boolean;
  value: immutable.Immutable<SkuData>;
  onChange: Function;
}

interface SkuItemState {
  opened?: boolean;
}

function createPropsMap(props: PropData[]): ObjectMap<PropMapData> {
  let map: ObjectMap<PropMapData> = {};
  _.forEach(props, (p) => {
    if (!p.sku) return;
    let item: PropMapData = Object.assign({ valueMap: {} }, p);
    _.forEach(p.values, (v) => {
      item.valueMap[v.id] = v;
    });
    map[item.id] = item;
  });
  return map;
}

/**
 * 将 props.value 转换为 state.list
 */
function valueToList(
  value: immutable.Immutable<SkuData[]>,
  props: PropMapData[],
  propsMap: ObjectMap<PropMapData>,
  oldSkus: ObjectMap<SkuData>,
  record: any
): immutable.Immutable<SkuData[]> {
  value = value || immutable([]);
  if (!record._id || !props.length) return value;
  let valueMap = _.keyBy(value, 'key');
  let defaultPic = record.pic;
  if (record.pics && Array.isArray(record.pics) && record.pics.length) {
    defaultPic = record.pics[0];
  }

  /**
   * 生成属性组合的列表
   */
  function createList(index?: number, res?: ObjectMap<string>[]): ObjectMap<string>[] {
    if (!props.length) return [];
    index = index | 0;
    res = res || [];

    let prop = props[index];

    if (!index) {
      _.forEach(prop.values, (v) => {
        res.push({
          [prop.id]: v.id
        });
      });
    } else {
      _.forEach(res, (item) => {
        _.forEach(prop.values, (v) => {
          if (!item[prop.id]) {
            item[prop.id] = v.id;
          } else {
            let newItem = Object.assign({}, item, {
              [prop.id]: v.id
            });
            res.push(newItem);
          }
        });
      });
    }

    index += 1;

    if (index < props.length) {
      return createList(index, res);
    }

    return res;
  }

  let itemList = createList();

  let result: immutable.Immutable<SkuData>[] = itemList.map((item) => {
    let keyItems: string[] = [];
    let descItems: string[] = [];
    let skuProps: PropData[] = [];
    _.keys(item).sort().forEach((pid) => {
      let vid = item[pid];
      keyItems.push(`${pid}:${vid}`);
      let prop = propsMap[pid];
      let propValue = prop.valueMap[vid];
      descItems.push(`${prop.title}:${propValue.title}`);
      skuProps.push({
        id: pid,
        title: prop.title,
        values: [{ id: vid, title: propValue.title }]
      });
    });
    let key = keyItems.join(';');
    let sku: immutable.Immutable<SkuData> = immutable(valueMap[key] || oldSkus[key] || {
      key,
      desc: descItems.join(';'),
      goods: record._id,
      props: skuProps
    });
    if (defaultPic && !sku.pic) {
      sku = sku.set('pic', defaultPic);
    }
    return sku;
  });

  return immutable(result);
}

class SkuItem extends React.Component<SkuItemProps, SkuItemState> {
  state = { opened: false };
  handlePic = (e: any) => {
    // TODO: 选择或上传图片
  };

  handleInventory = (e: any) => {
    const { onChange, value } = this.props;
    onChange(value.set('inventory', e.target.value));
  };

  handlePrice = (e: any) => {
    const { onChange, value } = this.props;
    onChange(value.set('price', e.target.value));
  };

  handleDiscount = (e: any) => {
    const { onChange, value } = this.props;
    onChange(value.set('discount', e.target.value));
  };

  handleOpen = () => {
    this.setState({ opened: true });
  };

  handleClose = () => {
    this.setState({ opened: false });
  };

  render() {
    const { value, disabled } = this.props;
    const { opened } = this.state;
    let thumbUrl = '';
    if (value.pic) {
      thumbUrl = value.pic.thumbUrl;
    }
    let CreateInventoryModal = views.components['CreateInventoryModal'];
    let inventoryBtn;
    if (value._id && CreateInventoryModal) {
      inventoryBtn = <>
        <button className="btn btn-primary btn-sm" onClick={this.handleOpen}>
          {tr('Input Inventory')}
        </button>
        {opened && <CreateInventoryModal
          modelId="alaska-sku.Sku"
          goods={value.goods}
          sku={value._id}
          onClose={this.handleClose}
        />}
      </>;
    }
    return (
      <tr>
        <td className="sku-pic">
          <img alt="" src={thumbUrl} onClick={this.handlePic} />
        </td>
        <td className="sku-desc" dangerouslySetInnerHTML={{ __html: value.desc.replace(/\;/g, '<br/>') }} />
        <td className="sku-price">
          <input
            className={value.price > 0 ? '' : 'is-invalid'}
            type="number"
            disabled={disabled}
            value={value.price || 0}
            onChange={this.handlePrice}
          />
        </td>
        <td className="sku-discount">
          <input type="number" disabled={disabled} value={value.discount || 0} onChange={this.handleDiscount} />
        </td>
        <td className="sku-volume">{value.volume}</td>
        <td className="sku-inventory">
          {(disabled || !!inventoryBtn) ? value.inventory : <input
            type="number"
            disabled={disabled || !!inventoryBtn}
            value={value.inventory || 0}
            onChange={this.handleInventory}
          />}
        </td>
        <td className="sku-actions">{inventoryBtn}</td>
      </tr>
    );
  }
}

export default class SkuEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      _record: null,
      props: [],
      propsMap: {},
      list: immutable([]),
      oldSkus: {}
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.record.isNew) return null;
    if (nextProps.record !== prevState._record) {
      let propsMap = createPropsMap(nextProps.record.props);
      let props = _.values(propsMap);
      return {
        _record: nextProps.record,
        props,
        propsMap,
        list: valueToList(nextProps.value, props, propsMap, prevState.oldSkus, nextProps.record)
      };
    }
    return null;
  }

  componentDidMount() {
    const { record, value } = this.props;
    if (record.isNew) return;
    // TODO: 保存goods后，清除Sku查询缓存
    query({
      model: 'alaska-sku.Sku',
      filters: {
        goods: record._id
      }
    }).then((res) => {
      let propsMap = createPropsMap(record.props);
      let props = _.values(propsMap);
      let oldSkus = _.keyBy(res.results, 'key');
      this.setState({
        _record: record,
        props,
        propsMap,
        list: valueToList(value, props, propsMap, oldSkus, record),
        oldSkus
      });
    });
  }

  componentDidUpdate() {
    // 当商品属性列表变化后（去掉/新增了一些SKU属性），需要去除、新增某些原来存在的sku
    const { value, onChange, record } = this.props;
    if (!value || record.isNew) return;
    const { list, propsMap } = this.state;
    let skuMap: ObjectMap<SkuData> = {};
    let newValue = value.flatMap((sku) => {
      if (_.find(sku.props, (p) => {
        if (!propsMap[p.id]) return true;
        if (!propsMap[p.id].valueMap[p.values[0].id]) return true;
        return false;
      })) {
        // 删除了属性，去除原来存在的sku
        return [];
      }
      skuMap[sku.key] = sku;
      return [sku];
    });
    list.forEach((sku) => {
      if (!skuMap[sku.key] &&
        (sku._id || sku.price || sku.inventory || sku.discount) // 非空SKU（用户有过编辑）
      ) {
        // 新增了属性，需要增加新SKU
        // @ts-ignore
        newValue = newValue.concat([sku]);
      }
    });
    if (value.length !== newValue.length) {
      onChange(newValue);
    }
  }

  handleChange = (sku: SkuData) => {
    const { value, onChange } = this.props;
    let found = false;
    let newValue = value.map((s) => {
      if (s.key === sku.key) {
        found = true;
        return sku;
      }
      return s;
    });
    if (!found) {
      newValue = newValue.concat([sku]);
    }
    onChange(newValue);
  };

  handleRemove(sku: SkuData) {
    const { value, onChange } = this.props;
    onChange(value.flatMap((s) => {
      if (s.key === sku.key) {
        return [];
      }
      return [s];
    }));
  }

  renderTable() {
    const { disabled } = this.props;
    const { list } = this.state;
    if (!list.length) return <div className="p-3 text-center">{tr('Please select properties first')}</div>;
    return (
      <table className="table">
        <thead>
          <tr>
            <th className="sku-pic">{tr('Picture', 'alaska-sku')}</th>
            <th className="sku-desc">{tr('Properties', 'alaska-sku')}</th>
            <th className="sku-price">{tr('Price', 'alaska-sku')}</th>
            <th className="sku-discount">{tr('Discount', 'alaska-sku')}</th>
            <th className="sku-volume">{tr('Volume', 'alaska-sku')}</th>
            <th className="sku-inventory">{tr('Inventory', 'alaska-sku')}</th>
            <th className="sku-actions" />
          </tr>
        </thead>
        <tbody>
          {
            _.map(list, (sku: immutable.Immutable<SkuData>) => (<SkuItem
              key={sku.key}
              disabled={disabled}
              value={sku}
              onChange={this.handleChange}
            />))
          }
        </tbody>
      </table>
    );
  }

  render() {
    const { record } = this.props;
    const { props } = this.state;
    if (!props.length || record.isNew) return null;
    return (
      <div className="card sku-editor">
        <div className="card-heading">SKU</div>
        {this.renderTable()}
      </div>
    );
  }
}

