import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import { ActionViewProps } from 'alaska-admin-view';
import CreateInventoryModal from './CreateInventoryModal';

interface State {
  opened?: boolean;
}

export default class CreateInventoryButton extends React.Component<ActionViewProps, State> {
  constructor(props: ActionViewProps) {
    super(props);
    this.state = {};
  }

  handleClick = () => {
    const { disabled } = this.props;
    if (!disabled) {
      this.setState({ opened: true });
    }
  };

  handleClose = () => {
    this.setState({ opened: false });
  };

  render() {
    let { disabled, record, selected, model } = this.props;
    if (selected) {
      if (selected.length > 1) {
        disabled = true;
      }
      record = selected[0];
    }
    let goods = '';
    let sku = '';
    if (!record) {
      disabled = true;
    } else {
      if (!record.id) return null; // 新建页面
      goods = record._id;
      if (model.modelName === 'Sku') {
        goods = record.goods;
        sku = record._id;
      } else if (model.modelName === 'Goods') {
        // 商品页面存在多条SKU，需要在sku editor中进行入库
        if (_.size(record.skus)) return null;
      }
    }
    return (
      <div className={'btn btn-primary' + (disabled ? ' disabled' : '')} onClick={this.handleClick}>
        <i className="fa fa-truck" />
        {' ' + tr('Input Inventory')}
        {this.state.opened && !disabled && <CreateInventoryModal
          modelId={model.id}
          goods={goods}
          sku={sku}
          onClose={this.handleClose}
        />}
      </div>
    );
  }
}
