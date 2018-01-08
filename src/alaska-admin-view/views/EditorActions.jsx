/**
 * @copyright Maichong Software Ltd. 2018 http://maichong.it
 * @date 2018-01-04
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import akita from 'akita';
import Node from './Node';
import ActionList from './ActionList';

type Props = {
  model: Alaska$view$Model,
  record: Alaska$view$Record,
  id: string,
  isNew: boolean,
  loading: boolean,
  onSave: Function,
  onRemove: Function,
  refreshSettings?: Function
};

export default class EditorActions extends React.Component<Props> {
  static contextTypes = {
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func
  };

  context: {
    t: Function,
    confirm: Function,
    toast: Function
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
      if (config.post === 'refresh') {
        this.props.refreshSettings();
      } else {
        this.refresh();
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

    const { abilities, actions } = model;

    let actionList = [];

    {
      // create
      let hidden = !isNew || !abilities.create || model.nocreate;

      actionList.push({
        key: 'create',
        onClick: onSave,
        action: _.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, actions.create, hidden ? { hidden: true } : null)
      });
    }

    {
      // update
      let hidden = isNew || !abilities.update || model.noupdate;

      actionList.push({
        key: 'update',
        onClick: onSave,
        action: _.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, actions.create, hidden ? { hidden: true } : null)
      });
    }

    {
      // remove
      let hidden = isNew || model.noremove || !abilities.remove;

      actionList.push({
        key: 'remove',
        onClick: onRemove,
        action: _.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, actions.remove, hidden ? { hidden: true } : null)
      });
    }

    {
      // add
      let hidden = isNew || model.nocreate || !abilities.create;

      actionList.push({
        key: 'add',
        link: '/edit/' + model.serviceId + '/' + model.modelName + '/_new',
        action: _.assign({
          key: 'create',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, actions.create, actions.add, hidden ? { hidden: true } : null)
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
      <Node id="editorActions" className="navbar-form navbar-right">
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
