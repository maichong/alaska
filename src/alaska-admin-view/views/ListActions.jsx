// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import akita from 'akita';
import shallowEqualWithout from 'shallow-equal-without';
import type { ImmutableArray } from 'seamless-immutable';
import Node from './Node';
import ActionList from './ActionList';

type Props = {
  records: ImmutableArray<Alaska$view$Record>,
  selected: ImmutableArray<Alaska$view$Record>,
  model: Alaska$view$Model,
  refresh: Function,
  refreshSettings: Function,
};

export default class ListActions extends React.Component<Props> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func
  };

  context: {
    settings: Alaska$view$Settings;
    t: Function;
    confirm: Function;
    toast: Function;
  };

  shouldComponentUpdate(props: Props) {
    return !shallowEqualWithout(props, this.props);
  }

  handleAction = async(action: string) => {
    const { model, selected } = this.props;
    const { t, toast, confirm } = this.context;

    const config = model.actions[action];
    if (!config) return;
    if (config.confirm) {
      await confirm(t('Confirm'), t(config.confirm, model.serviceId));
    }

    try {
      if (config.pre && config.pre.substr(0, 3) === 'js:') {
        // eslint-disable-next-line no-eval
        if (!eval(config.pre.substr(3))) {
          return;
        }
      }

      if (config.script && config.script.substr(0, 3) === 'js:') {
        // eslint-disable-next-line no-eval
        eval(config.script.substr(3));
      } else {
        await akita.post('/api/action', {
          params: { _service: model.serviceId, _model: model.modelName, _action: action },
          body: { records: _.map(selected, (record) => record._id) }
        });
      }
      toast('success', t('Successfully'));
      if (config.post === 'refresh') {
        this.props.refreshSettings();
      } else {
        this.props.refresh();
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line no-eval
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  };

  handleRemove = async() => {
    const { model, selected } = this.props;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove selected records'), t('confirm remove selected records'));
    try {
      await akita.post('/api/remove', {
        params: {
          _service: model.serviceId,
          _model: model.modelName
        },
        body: { records: _.map(selected, (record) => record._id) }
      });
      toast('success', t('Successfully'));
      this.props.refresh();
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  };

  render() {
    const {
      model, selected, records, refresh
    } = this.props;

    const { actions } = model;

    let actionList = [];

    // 站位action，列表中不显示，只为排序
    actionList.push({
      key: 'create',
      action: {
        hidden: true
      }
    });
    actionList.push({
      key: 'update',
      action: {
        hidden: true
      }
    });

    {
      // remove
      let hidden = model.noremove; // 不判断 ability，ActionList 会判断

      actionList.push({
        key: 'remove',
        onClick: this.handleRemove,
        action: _.assign({
          key: 'remove',
          list: true,
          needRecords: 1,
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove selected records'
        }, actions.remove, hidden ? { hidden: true } : {})
      });
    }

    {
      // add
      let hidden = model.nocreate; // 不判断 ability，ActionList 会判断
      actionList.push({
        key: 'add',
        link: '/edit/' + model.serviceId + '/' + model.modelName + '/_new',
        action: _.assign({
          key: 'create',
          list: true,
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, model.actions.create, model.actions.add, hidden ? { hidden: true } : {})
      });
    }

    _.forEach(actions, (action, key) => {
      if (['add', 'create', 'update', 'remove'].indexOf(key) > -1) return;
      actionList.push({
        key,
        onClick: () => this.handleAction(key),
        action
      });
    });

    return (
      <Node id="listActions" className="navbar-form navbar-right">
        <ActionList
          items={actionList}
          model={model}
          selected={selected}
          records={records}
          refresh={refresh}
        />
      </Node>
    );
  }
}
