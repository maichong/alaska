import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as checkDepends from 'check-depends';
import * as tr from 'grackle';
import { ModelAction } from 'alaska-model';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { confirm } from '@samoyed/modal';
import toast from '@samoyed/toast';
import { ObjectMap } from 'alaska';
import { EditorActionsProps, State, Settings } from '..';
import ActionGroup from './ActionGroup';
import * as ActionRedux from '../redux/action';

interface ActionMap {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
  afters: ActionMap[];
}

interface EditorActionsState {
  updateError: boolean;
}

interface Props extends EditorActionsProps {
  superMode: boolean;
  settings?: Settings;
  actionRequest: Function;
  action: { errorMsg: string; action: string; };
}

class EditorActions extends React.Component<Props, EditorActionsState> {
  static contextTypes = {
    router: PropTypes.object
  };

  context: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      updateError: false
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.state.updateError) {
      let title = nextProps.action.action || 'action';
      if (nextProps.action && nextProps.action.errorMsg) {
        //不定义any，ts会报错
        let error: any = nextProps.action.errorMsg;
        toast(tr(error), tr(`${_.upperFirst(title)} Failure`), { type: 'error' });
      } else {
        toast(tr(`${title} success!`), tr(`${title}`), { type: 'success' });
        //创建成功跳转
        // @ts-ignore action里面会包含修改的信息ID
        let id = nextProps.action ? nextProps.action._id : '';
        if (nextProps.isNew && nextProps.action && id) {
          const { model } = this.props;
          let url = '/edit/' + model.serviceId + '/' + model.modelName + '/' + id;
          this.context.router.history.replace(url);
        } else if (nextProps.action.action === 'remove') {
          //删除成功跳转
          const { model } = this.props;
          let url = '/list/' + model.serviceId + '/' + model.modelName;
          this.context.router.history.replace(url);
        }
      }
      this.setState({ updateError: false });
    }
  }

  handleAdd = () => {
    const { model } = this.props;
    let url = '/edit/' + model.serviceId + '/' + model.modelName + '/_new';
    this.context.router.history.replace(url);
  };

  handleAction = async (action: string) => {
    const { model, actionRequest, record, isNew } = this.props;
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
        actionRequest({
          model: model.serviceId + '.' + model.modelName,
          action,
          records: !isNew && record._id ? [record._id] : [],
          body: record
        });
        this.setState({ updateError: true });
      }

      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', tr('Failed'), error.message);
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
      model, record, isNew, superMode, settings
    } = this.props;

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
      if (!superMode && checkDepends(action.super, record)) return;
      if (checkDepends(action.hidden, record)) return;
      let { ability } = action;
      let abilityDisabled = false;
      if (typeof ability === 'function') {
        ability = ability(record, settings.user);
      }
      if (ability && ability[0] === '*') {
        ability = ability.substr(1);
        abilityDisabled = true;
      }
      let hasAbility = !ability || (settings && settings.abilities && settings.abilities[ability]) || false;
      if (!hasAbility && !abilityDisabled) return;

      let disabled = action.disabled && checkDepends(action.disabled, record);
      let obj = {} as ActionMap;
      if (key === 'create') {
        if (!isNew || model.nocreate) return;
        obj.onClick = () => this.handleAction(key);
        obj.action = _.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'update') {
        if (isNew || model.noupdate) return;
        obj.onClick = () => this.handleAction(key);
        obj.action = _.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'remove') {
        if (isNew || model.noremove) return;
        obj.onClick = () => this.handleRemove();
        obj.action = _.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'add') {
        if (isNew || model.nocreate) return;
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
  ({ settings, action }: State) => ({ superMode: settings.superMode, action, settings }),
  (dispatch) => bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch)
)(EditorActions);
