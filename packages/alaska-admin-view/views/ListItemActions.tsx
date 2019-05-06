import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { ModelAction } from 'alaska-model';
import toast from '@samoyed/toast';
import { confirm } from '@samoyed/modal';
import { ListItemActionsProps } from '..';
import ActionView from './ActionView';
import checkAbility, { hasAbility } from '../utils/check-ability';

interface State {
  request?: string;
}

export default class ListActions extends React.Component<ListItemActionsProps, State> {
  constructor(props: ListItemActionsProps) {
    super(props);
    this.state = {};
  }

  handleShow = () => {
    let { model, record, history } = this.props;
    history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
  };

  async handleAction(action: ModelAction) {
    const { model, actionRequest, record, refresh } = this.props;

    if (action && action.confirm) {
      let res = await confirm(tr('Confirm'), tr(action.confirm, model.serviceId));
      if (!res) return;
    }
    try {
      if (action.pre && action.pre.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        if (!eval(action.pre.substr(3))) {
          return;
        }
      }

      if (action.script && action.script.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(action.script.substr(3));
      } else {
        let request = String(Math.random());
        actionRequest({
          model: `${model.serviceId}.${model.modelName}`,
          action: action.key,
          request,
          records: record.isNew ? [] : [record._id],
          body: record
        });
        this.setState({ request });
      }

      if (action.post === 'refresh') {
        refresh();
      } else if (action.post && action.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(action.post.substr(3));
      }
    } catch (error) {
      toast(tr('Failed'), error.message, { type: 'error' });
    }
  };

  async handleRemove(action: ModelAction) {
    let res = await confirm(tr('Remove record'), tr('confirm remove record'));
    if (res) {
      this.handleAction(action);
    }
  };

  render() {
    const { model, record, history, superMode } = this.props;
    let actions = [
      <i key="show" className="fa fa-eye text-primary" onClick={this.handleShow} />
    ];

    _.forEach(model.actions, (action, key) => {
      if (!action.placements || !action.placements.includes('listItem')) return;
      if (key === 'remove' && model.noremove) return;
      if (!superMode && checkAbility(action.super, record)) return;
      if (checkAbility(action.hidden, record)) return;
      let ability = action.ability || `${model.id}.${key}`;
      if (!hasAbility(ability, record)) return;

      let link = '';
      let onClick = null;
      if (key === 'remove') {
        onClick = () => this.handleRemove(action);
      } else if (action.sled) {
        onClick = () => this.handleAction(action);
      }

      actions.push(<ActionView
        key={key}
        icon
        model={model}
        history={history}
        action={action}
        link={link}
        onClick={onClick}
      />);

    });

    return actions;
  }
}
