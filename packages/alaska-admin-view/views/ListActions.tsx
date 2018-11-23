import * as _ from 'lodash';
import * as React from 'react';
import * as qs from 'qs';
import * as tr from 'grackle';
import { ObjectMap } from 'alaska';
import { ModelAction } from 'alaska-model';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import toast from '@samoyed/toast';
import { confirm } from '@samoyed/modal';
import { ListActionsProps, State, Settings } from '..';
import ActionGroup from './ActionGroup';
import * as ActionRedux from '../redux/action';

interface ListActionsState {
  updateError: boolean;
}

interface ActionMap {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
  afters: ActionMap[];
}

interface Props extends ListActionsProps {
  settings?: Settings;
  superMode: boolean;
  locale: string;
  actionRequest: Function;
  action: { errorMsg: string; action: string; };
}

class ListActions extends React.Component<Props, ListActionsState> {
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
      }
      this.setState({ updateError: false });
    }
  }

  handleAction = async (action: string) => {
    const { model, selected, sort, filters, actionRequest, search } = this.props;

    const config: ModelAction = model.actions[action];
    if (!config) return;
    if (config.confirm) {
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
        let selecteds = _.map(selected, (item) => item._id);
        actionRequest({
          model: model.serviceId + '.' + model.modelName,
          records: selecteds,
          action,
          search: search || '',
          sort,
          filters,
          body: {}
        });
        this.setState({ updateError: true });
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (err) {
      toast('error', tr('Failed'), err.message);
    }
  };

  handleRemove = async () => {
    let res = await confirm(tr('Remove selected records'), tr('confirm remove selected records'));
    if (res) {
      await this.handleAction('remove');
    }
  };

  openPostWindow = (url: string) => {
    let newWin = window.open();
    let formStr = `<form style="visibility:hidden;" method="POST" action="${url}"></form>`;
    newWin.document.body.innerHTML = formStr;
    newWin.document.forms[0].submit();
    setTimeout(() => {
      newWin.close();
    }, 100);
    return newWin;
  }

  handleExport = () => {
    const { model, selected, sort, filters, search } = this.props;
    let selecteds = _.map(selected, (item) => item._id);
    let query = _.assign({
      _model: model.serviceId + '.' + model.modelName,
      _records: selecteds,
      _action: 'export',
      _search: search || '',
      _sort: sort || ''
    }, filters);
    let queryStr = qs.stringify(query);
    let url = `${location.origin}/admin/action?${queryStr}`;
    this.openPostWindow(url);
  };

  render() {
    const {
      model, records, selected, superMode, settings
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
      if (!action.list) return;
      if (!superMode && action.super) return;
      let { ability } = action;
      let abilityDisabled = false;
      if (typeof ability === 'function') {
        // TODO: 遍历所有selected 依次判断ability
        ability = '*';
      }
      if (ability && ability[0] === '*') {
        ability = ability.substr(1);
        abilityDisabled = true;
      }
      let hasAbility = !ability || (settings && settings.abilities && settings.abilities[ability]) || false;
      if (!hasAbility && !abilityDisabled) return;

      let disabled = action.needRecords && (!selected || selected.length < action.needRecords);
      let obj = {} as ActionMap;
      if (key === 'remove') {
        if (model.noremove) return;
        obj.onClick = () => this.handleRemove();
        obj.action = _.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove selected records'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'export') {
        if (model.noexport) return;
        obj.onClick = () => this.handleExport();
        obj.action = _.assign({
          key: 'export',
          icon: 'download',
          style: 'info',
          tooltip: 'Export records'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'add') {
        if (model.nocreate) return;
        obj.link = '/edit/' + model.serviceId + '/' + model.modelName + '/_new';
        obj.action = _.assign({
          key: 'add',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, action, disabled ? { disabled: true } : {});
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
      <div className="list-actions">
        <ActionGroup
          items={actionList}
          model={model}
          selected={selected}
          records={records}
        />
      </div>
    );
  }
}

export default connect(
  ({ settings, action }: State) =>
    ({ superMode: settings.superMode, locale: settings.locale, action, settings }),
  (dispatch) => bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch)
)(ListActions);