// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import akita from 'akita';
import shallowEqualWithout from 'shallow-equal-without';
import Node from './Node';
import Action from './Action';

type Props = {
  selected?: Alaska$view$Record[],
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
    const { model, selected, refresh } = this.props;
    const { settings } = this.context;
    const actions = _.reduce(model.actions, (res, action, key) => {
      if (!action.list) return res;
      if (action.super && !settings.superMode) return res;
      res.push(<Action
        key={key}
        model={model}
        selected={selected}
        action={action}
        refresh={refresh}
        onClick={() => this.handleAction(key)}
      />);
      return res;
    }, []);

    if (!model.noremove && model.abilities.remove && model.actions.remove !== false) {
      actions.push(<Action
        key="remove"
        action={_.assign({
          key: 'remove',
          icon: 'close',
          needRecords: 1,
          style: 'danger',
          tooltip: 'Remove selected records'
        }, model.actions.remove)}
        selected={selected}
        model={model}
        onClick={this.handleRemove}
        refresh={refresh}
      />);
    }

    if (!model.nocreate && model.abilities.create && model.actions.create !== false && model.actions.add !== false) {
      actions.push(<Action
        key="create"
        action={_.assign({
          key: 'create',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, model.actions.create, model.actions.add)}
        model={model}
        link={'/edit/' + model.serviceId + '/' + model.modelName + '/_new'}
      />);
    }

    return (
      <Node id="listActions" className="navbar-form navbar-right">
        {actions}
      </Node>
    );
  }
}
