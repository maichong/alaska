import * as _ from 'lodash';
import * as React from 'react';
import * as qs from 'qs';
import * as tr from 'grackle';
import * as H from 'history';
import { ObjectMap } from 'alaska';
import { ModelAction } from 'alaska-model';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import toast from '@samoyed/toast';
import { confirm } from '@samoyed/modal';
import { ListActionsProps, StoreState, Settings, ActionState, ActionRequestPayload, Record } from '..';
import ActionGroup from './ActionGroup';
import * as ActionRedux from '../redux/action';
import checkAbility, { hasAbility } from '../utils/check-ability';

interface ListActionsState {
  request?: string;
}

interface ActionMap {
  key: string;
  link?: string;
  action: ModelAction;
  onClick?: Function;
  afters: ActionMap[];
}

interface Props extends ListActionsProps {
  history: H.History;
  location: H.Location<any>;
  match: any;
  staticContext?: any;
  settings?: Settings;
  superMode: boolean;
  locale: string;
  actionRequest: (req: ActionRequestPayload) => any;
  action: ActionState;
}

class ListActions extends React.Component<Props, ListActionsState> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: ListActionsState) {
    let { action } = nextProps;
    if (prevState.request && action.request === prevState.request && !action.fetching) {
      let title = nextProps.action.action;
      if (nextProps.action.error) {
        toast(tr(`${_.upperFirst(title)} Failure`), tr(nextProps.action.error.message), { type: 'error' });
      } else {
        toast(tr(`${title} success!`), '', { type: 'success' });
      }
      return { request: '' };
    }
    return null;
  }

  handleAction = async (action: string) => {
    const { model, selected, sort, filters, actionRequest } = this.props;

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
        let request = String(Math.random());
        let selecteds = _.map(selected, (item) => item._id);
        actionRequest({
          request,
          model: model.id,
          records: selecteds,
          action,
          search: (filters._search as string) || '',
          sort,
          filters: _.omit(filters, '_search'),
          body: {}
        });
        this.setState({ request });
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (err) {
      toast(tr('Failed'), err.message, { type: 'error' });
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
    const { model, selected, sort, filters } = this.props;
    let selecteds = _.map(selected, (item) => item._id);
    let query = _.assign({
      _model: `${model.serviceId}.${model.modelName}`,
      _records: selecteds,
      _action: 'export',
      _sort: sort || ''
    }, filters);
    let queryStr = qs.stringify(query);
    let path = location.pathname;
    if (path === '/') {
      path = '';
    }
    let url = `${location.origin + path}action?${queryStr}`;
    this.openPostWindow(url);
  };

  render() {
    const {
      model, records, selected, superMode, history
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

    let record: Record;
    if (selected) {
      record = selected[0];
    }

    let actionList: ActionMap[] = [];
    // eslint-disable-next-line complexity
    keys.forEach((key) => {
      let action = actions[key];
      if (!(action.pages || []).includes('list')) return;
      if (!superMode && checkAbility(action.super, record)) return;
      if (checkAbility(action.hidden, record)) return;
      let ability = action.ability || `${model.id}.${key}`;
      if (!hasAbility(ability, record)) return;

      let disabled = action.needRecords && (!selected || selected.length < action.needRecords);
      let obj = {} as ActionMap;
      if (key === 'remove') {
        if (model.noremove) return;
        obj.onClick = this.handleRemove;
        obj.action = _.assign({
          key: 'remove',
          icon: 'close',
          color: 'danger',
          tooltip: 'Remove selected records'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'export') {
        if (model.noexport) return;
        obj.onClick = this.handleExport;
        obj.action = _.assign({
          key: 'export',
          icon: 'download',
          color: 'info',
          tooltip: 'Export records'
        }, action, disabled ? { disabled: true } : {});
      } else if (key === 'add') {
        if (model.nocreate) return;
        obj.link = `/edit/${model.serviceId}/${model.modelName}/_new`;
        obj.action = _.assign({
          key: 'add',
          icon: 'plus',
          color: 'success',
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
          history={history}
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
  ({ settings, action }: StoreState) =>
    ({ superMode: settings.superMode, locale: settings.locale, action, settings }),
  (dispatch) => bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch)
)(withRouter(ListActions));
