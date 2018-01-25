// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import akita from 'akita';
import type { ImmutableObject } from 'seamless-immutable';
import Node from './Node';
import ActionList from './ActionList';

type Props = {
  model: Alaska$view$Model,
  record: ImmutableObject<Alaska$view$Record>,
  id: string,
  isNew: boolean,
  loading: boolean,
  onSave: Function,
  onRemove: Function,
  refresh: Function,
  refreshSettings: Function
};

export default class EditorActions extends React.Component<Props> {
  static contextTypes = {
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
    router: PropTypes.object
  };

  context: {
    t: Function,
    confirm: Function,
    toast: Function,
    router: Object,
  };

  handleAdd = () => {
    const { model } = this.props;
    let url = '/edit/' + model.serviceId + '/' + model.modelName + '/_new';
    this.context.router.history.replace(url);
  };

  async handleAction(action: string) {
    const { model, record, id } = this.props;
    const { t, toast, confirm } = this.context;

    const config = model.actions[action];
    if (config && config.confirm) {
      await confirm(t('Confirm'), t(config.confirm, model.serviceId));
    }

    try {
      if (config.pre && config.pre.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        if (!eval(config.pre.substr(3))) {
          return;
        }
      }

      if (config.script && config.script.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.script.substr(3));
      } else {
        let body = Object.assign({}, record, { id: id.toString() === '_new' ? '' : id });
        await akita.post('/api/action', {
          params: {
            _service: model.serviceId,
            _model: model.modelName,
            _action: action
          },
          body
        });
      }
      toast('success', t('Successfully'));
      if (config.post === 'refreshSettings') {
        this.props.refreshSettings();
      } else {
        this.props.refresh();
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  }

  render() {
    const {
      model, record, id, isNew, onSave, onRemove, loading
    } = this.props;

    const { actions } = model;

    let actionList = [];

    {
      // create
      let hidden = !isNew || model.nocreate; // 不判断 ability，ActionList 会判断

      actionList.push({
        key: 'create',
        onClick: onSave,
        action: _.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, actions.create, hidden ? { hidden: true } : {})
      });
    }

    {
      // update
      let hidden = isNew || model.noupdate; // 不判断 ability，ActionList 会判断

      actionList.push({
        key: 'update',
        onClick: onSave,
        action: _.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, actions.update, hidden ? { hidden: true } : {})
      });
    }

    {
      // remove
      let hidden = isNew || model.noremove; // 不判断 ability，ActionList 会判断

      actionList.push({
        key: 'remove',
        onClick: onRemove,
        action: _.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, actions.remove, hidden ? { hidden: true } : {})
      });
    }

    // export
    actionList.push({
      key: 'export',
      action: {
        hidden: true
      }
    });

    {
      // add
      let hidden = isNew || model.nocreate; // 不判断 ability，ActionList 会判断

      actionList.push({
        key: 'add',
        onClick: this.handleAdd,
        action: _.assign({
          key: 'create',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, actions.create, actions.add, hidden ? { hidden: true } : {})
      });
    }

    //扩展动作按钮
    _.forEach(actions, (action, key) => {
      if (['add', 'create', 'update', 'remove'].indexOf(key) > -1) return;
      actionList.push({
        key,
        onClick: () => this.handleAction(key),
        action
      });
    });

    return (
      <Node id="editorActions" className="navbar-form navbar-right editor-actions">
        <ActionList
          editor
          items={actionList}
          disabled={loading}
          model={model}
          record={record}
          id={id}
        />
      </Node>
    );
  }
}
