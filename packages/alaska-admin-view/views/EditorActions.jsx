/**
 * @copyright Maichong Software Ltd. 2018 http://maichong.it
 * @date 2018-01-04
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import akita from 'akita';
import checkDepends from 'check-depends';
import Node from './Node';
import Action from './Action';

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
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    router: PropTypes.object,
    toast: PropTypes.func
  };

  context: {
    settings: Alaska$view$Settings,
    t: Function,
    confirm: Function,
    toast: Function,
    router: Object,
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

  handleCreate = () => {
    const { model } = this.props;
    let url = '/edit/' + model.serviceId + '/' + model.modelName + '/_new';
    this.context.router.history.replace(url);
  };

  render() {
    const {
      model, record, id, isNew, onSave, onRemove, loading
    } = this.props;
    const { settings } = this.context;

    let actionElements = [];

    // 创建时，显示保存按钮
    if (
      isNew
      && model.abilities.create
      && !model.nocreate
      && !(model.actions.create && model.actions.create.depends && !checkDepends(model.actions.create.depends, record))
    ) {
      actionElements.push(<Action
        key="create"
        action={_.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, model.actions.create)}
        model={model}
        disabled={loading}
        onClick={onSave}
      />);
    } else if (
      !isNew
      && model.abilities.update
      && !model.noupdate
      && !(model.actions.update && model.actions.update.depends && !checkDepends(model.actions.update.depends, record))
    ) {
      actionElements.push(<Action
        key="update"
        action={_.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, model.actions.update)}
        model={model}
        disabled={loading}
        onClick={onSave}
      />);
    }

    if (
      !isNew
      && !model.noremove
      && model.abilities.remove
      && model.actions.remove !== false
      && !(model.actions.remove && model.actions.remove.depends && !checkDepends(model.actions.remove.depends, record))
    ) {
      actionElements.push(<Action
        key="remove"
        action={_.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, model.actions.remove)}
        model={model}
        disabled={loading}
        onClick={onRemove}
      />);
    }

    if (
      !isNew
      && !model.nocreate
      && model.abilities.create
      && model.actions.create !== false
      && model.actions.add !== false
    ) {
      // 创建另一个
      actionElements.push(<Action
        key="add"
        action={_.assign({
          key: 'create',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, model.actions.create, model.actions.add)}
        model={model}
        disabled={loading}
        onClick={this.handleCreate}
      />);
    }

    //扩展动作按钮
    _.forEach(model.actions, (action, key) => {
      if (['add', 'create', 'update', 'remove'].indexOf(key) > -1) return;
      if (action.super && !settings.superMode) return;
      if (action.depends && !checkDepends(action.depends, record)) return;
      if (action.list && !action.editor) return;
      let disabled = loading;
      if (!disabled && action.disabled) {
        disabled = checkDepends(action.disabled, record);
      }
      actionElements.push(<Action
        onClick={() => this.handleAction(key)}
        key={key}
        disabled={disabled}
        model={model}
        action={action}
        record={record}
        id={id}
      />);
    });

    return (
      <Node id="editorActions" className="navbar-form navbar-right">
        {actionElements}
      </Node>
    );
  }
}
