/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-21
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import qs from 'qs';
import shallowEqual from '../utils/shallow-equal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Node from './Node';
import Action from './Action';
import _reduce from 'lodash/reduce';
import api from '../utils/api';
import { PREFIX } from '../constants';
import _map from 'lodash/map';

const { object, array, func } = React.PropTypes;

export default class ListActions extends React.Component {

  static propTypes = {
    selected: array,
    model: object,
    onRefresh: func
  };

  static contextTypes = {
    actions: object,
    settings: object,
    t: func,
    confirm: func,
    toast: func
  };

  shouldComponentUpdate(props) {
    return !shallowEqual(props, this.props);
  }

  handleAction = async (action) => {
    const { model, selected } = this.props;
    const { t, toast, confirm, actions } = this.context;

    const config = model.actions[action];
    if (config && config.confirm) {
      await confirm(t('Confirm'), t(config.confirm, model.service.id));
    }

    try {
      if (config.pre && config.pre.substr(0, 3) === 'js:') {
        if (!eval(config.pre.substr(3))) {
          return;
        }
      }

      if (config.script && config.script.substr(0, 3) === 'js:') {
        eval(config.script.substr(3));
      } else {
        await api.post(PREFIX + '/api/action?' + qs.stringify({
            service: model.service.id,
            model: model.name,
            action
          }), { records: _map(selected, record => record._id) });
      }
      toast('success', t('Successfully'));
      if (config.post == 'refresh') {
        actions.refresh();
      } else {
        this.props.onRefresh();
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  };

  handleRemove = async () => {
    const { model, selected } = this.props;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove selected records'), t('confirm remove selected records'));
    try {
      await api.post(PREFIX + '/api/remove?' + qs.stringify({
          service: model.service.id,
          model: model.name
        }), { records: _map(selected, record => record._id) });
      toast('success', t('Successfully'));
      this.props.onRefresh();
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  };

  render() {
    const { model, selected, onRefresh } = this.props;
    const { t, settings } = this.context;
    const actions = _reduce(model.actions, (res, action, key) => {
      if (!action.list) return res;
      if (action.super && !settings.superMode) return res;
      res.push(
        <Action key={key}
                model={model}
                selected={selected}
                action={action}
                onRefresh={onRefresh}
                onClick={()=>this.handleAction(key)}
        />
      );
      return res;
    }, []);
    if (!model.noremove && model.abilities.remove && model.actions.remove !== false) {
      actions.push(<Action
        key="remove"
        action={{key:'remove',icon:'close',needRecords:1,style:'danger',tooltip:'Remove selected records'}}
        selected={selected}
        model={model}
        onClick={this.handleRemove}
        onRefresh={onRefresh}
      />);
    }

    if (!model.nocreate && model.abilities.create && model.actions.create !== false) {
      let href = '#/edit/' + model.service.id + '/' + model.name + '/_new';
      actions.push(<OverlayTrigger key="create" placement="top"
                                   overlay={<Tooltip id="tooltip">{t('Create record')}</Tooltip>}><a
        key="create" className="btn btn-success" href={href}><i
        className="fa fa-plus"/></a></OverlayTrigger>);
    }

    return (
      <Node id="listActions" className="navbar-form navbar-right">
        {actions}
      </Node>
    );
  }
}
