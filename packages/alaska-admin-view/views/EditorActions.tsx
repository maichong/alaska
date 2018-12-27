import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import { ModelAction } from 'alaska-model';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { confirm } from '@samoyed/modal';
import toast from '@samoyed/toast';
import { ObjectMap } from 'alaska';
import { EditorActionsProps, StoreState, ActionState, ActionRequestPayload } from '..';
import ActionGroup from './ActionGroup';
import * as ActionRedux from '../redux/action';
import checkAbility, { hasAbility } from '../utils/check-ability';

interface ActionMap {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
  afters: ActionMap[];
}

interface EditorActionsState {
  request?: string;
  redirect?: string;
}

interface Props extends EditorActionsProps {
  superMode: boolean;
  actionRequest: (req: ActionRequestPayload) => any;
  action: ActionState;
}

class EditorActions extends React.Component<Props, EditorActionsState> {
  static contextTypes = {
    router: PropTypes.object
  };

  context: any;
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: EditorActionsState) {
    const { action, model } = nextProps;
    if (prevState.request && prevState.request === action.request && !action.fetching) {
      let title = nextProps.action.action || 'action';
      if (action.error) {
        toast(tr(`${_.upperFirst(title)} Failure`), tr(action.error.message), { type: 'error' });
        return { request: '' };
      } else {
        toast(tr(`${title}`), tr(`${title} success!`), { type: 'success' });
        let id = _.get(action, 'result._id');
        let redirect;
        if (nextProps.record.isNew && id) {
          // 创建成功跳转
          redirect = `/edit/${model.serviceId}/${model.modelName}/${id}`;
        } else if (action.action === 'remove') {
          // 删除成功跳转
          redirect = `/list/${model.serviceId}/${model.modelName}`;
        }
        return { request: '', redirect };
      }
    }
    return null;
  }

  handleAdd = () => {
    const { model } = this.props;
    let url = `/edit/${model.serviceId}/${model.modelName}/_new`;
    this.context.router.history.replace(url);
  };

  handleAction = async (action: string) => {
    const { model, actionRequest, record } = this.props;
    const config: ModelAction = model.actions[action];

    if (config && config.confirm) {
      let res = await confirm(tr('Confirm'), tr(config.confirm, model.serviceId));
      if (!res) return;
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
        let request = String(Math.random());
        actionRequest({
          model: `${model.serviceId}.${model.modelName}`,
          action,
          request,
          records: record.isNew ? [] : [record._id],
          body: record
        });
        this.setState({ request });
      }

      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast(tr('Failed'), error.message, { type: 'error' });
    }
  };

  handleRemove = async () => {
    let res = await confirm(tr('Remove record'), tr('confirm remove record'));
    if (res) {
      await this.handleAction('remove');
    }
  };

  render() {
    const {
      model, record, superMode
    } = this.props;

    let redirect = this.state.redirect;
    if (redirect) {
      this.context.router.history.replace(redirect);
    }

    const { actions } = model;

    let map = {} as ObjectMap<ActionMap>;
    _.forIn(actions, (item, key) => {
      map[key] = {
        key,
        action: item,
        afters: []
      };
    });

    let list: ActionMap[] = [];

    _.forEach(map, (el) => {
      let {
        after
      } = el.action;
      if (after && map[after]) {
        map[after].afters.push(el);
      } else {
        list.push(el);
      }
    });

    let keys: string[] = [];

    function flat(el: ActionMap) {
      keys.push(el.key);
      el.afters.forEach(flat);
    }

    _.forEach(list, flat);

    let actionList: ActionMap[] = [];
    // eslint-disable-next-line complexity
    keys.forEach((key) => {
      let action = actions[key];
      if (action.list && !action.editor) return;
      if (!superMode && checkAbility(action.super, record)) return;
      if (checkAbility(action.hidden, record)) return;
      let ability = action.ability || model.id + '.' + key;
      if (!hasAbility(ability, record)) return;

      let disabled = action.disabled && checkAbility(action.disabled, record);
      let obj = {} as ActionMap;
      if (key === 'create') {
        if (!record.isNew || model.nocreate) return;
        obj.onClick = () => this.handleAction(key);
        obj.action = _.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'update') {
        if (record.isNew || model.noupdate) return;
        obj.onClick = () => this.handleAction(key);
        obj.action = _.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'remove') {
        if (record.isNew || model.noremove) return;
        obj.onClick = () => this.handleRemove();
        obj.action = _.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'add') {
        if (record.isNew || model.nocreate) return;
        obj.onClick = () => this.handleAdd();
        obj.action = _.assign({
          key: 'add',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, actions.create, actions.add, disabled ? { disabled: true } : {});
      } else {
        obj.action = _.assign({}, action, disabled ? { disabled: true } : {});
        if (action.link) {
          obj.link = action.link;
        }
        if (action.sled) {
          obj.onClick = () => this.handleAction(key);
        }
      }
      obj.key = key;
      actionList.push(obj);
    });
    return (
      <div className="editor-actions">
        <ActionGroup
          editor
          items={actionList}
          model={model}
          record={record}
        />
      </div>
    );
  }
}

export default connect(
  ({ settings, action }: StoreState) => ({ superMode: settings.superMode, action }),
  (dispatch) => bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch)
)(EditorActions);
