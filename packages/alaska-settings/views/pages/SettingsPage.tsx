import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ObjectMap } from 'alaska';
import {
  StoreState, RouterProps, ListsState, Settings, ActionState,
  ClearListPayload, LoadListPayload, ActionRequestPayload,
  Record, views
} from 'alaska-admin-view';
import ActionBar from 'alaska-admin-view/views/ActionBar';
import ActionGroup from 'alaska-admin-view/views/ActionGroup';
import * as listsRedux from 'alaska-admin-view/redux/lists';
import * as actionRedux from 'alaska-admin-view/redux/action';

interface Props extends RouterProps {
  action: ActionState;
  settings: Settings;
  lists: ListsState;
  clearList: (req: ClearListPayload) => any;
  loadList: (req: LoadListPayload) => any;
  actionRequest: (req: ActionRequestPayload) => any;
}

interface State {
  _results?: immutable.Immutable<SettingsData[]>;
  groups: ObjectMap<Group>;
  fields: ObjectMap<SettingsData>;
  values: ObjectMap<any>;
}

interface Group {
  title: string;
  items: SettingsData[];
}

interface SettingsData extends Record {
}

const MODEL_ID = 'alaska-settings.Settings';

class SettingsPage extends React.Component<Props, State> {
  request: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      groups: {},
      fields: {},
      values: {}
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): null | Partial<State> {
    const { lists } = nextProps;
    let list = lists[MODEL_ID];
    if (!list) return { values: {}};
    if (list.results === prevState._results) return null;
    let nextState: Partial<State> = {
      _results: list.results,
      groups: {},
      fields: {}
    };
    _.forEach(list.results, (item: SettingsData) => {
      let groupKey = item.group || 'Basic Settings';
      if (!nextState.groups[groupKey]) {
        nextState.groups[groupKey] = {
          title: tr(groupKey, item.service || 'alaska-settings'),
          items: []
        };
      }
      nextState.groups[groupKey].items.push(item);
      let field = _.assign({
        horizontal: true,
        label: tr(item.title, item.service),
        help: tr(item.help, item.service),
        service: item.service
      }, item.options);
      nextState.fields[item._id] = field;
    });
    return nextState;
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  init() {
    const { action, lists, loadList, clearList } = this.props;
    let list = lists[MODEL_ID];
    if (!list) {
      loadList({
        model: MODEL_ID,
        limit: 1000
      });
      return;
    }
    if (this.request && action.request === this.request && !action.fetching) {
      // 刷新
      this.request = '';
      clearList({
        model: MODEL_ID
      });
    }
  }

  handleSave = () => {
    // const { actionRequest } = this.props;
    const { values } = this.state;
    if (_.isEmpty(values)) return;

    let request = Math.random().toString();
    this.request = request;
    this.props.actionRequest({
      action: 'update',
      model: MODEL_ID,
      request,
      records: _.keys(values),
      body: _.map(values, (v, k) => ({ id: k, value: v }))
    });
  };

  handleChange = (id: string, v: any) => {
    let { values } = this.state;
    values = _.assign({}, values, { [id]: v });
    this.setState({ values });
  };

  render() {
    const { settings } = this.props;
    const { lists } = this.props;
    const { values, groups, fields } = this.state;
    const model = settings.models[MODEL_ID];
    let content: any;

    if (!lists[MODEL_ID] || !model) {
      content = <div className="loading">Loading...</div>;
    } else {
      content = [];
      _.forEach(groups, (group, index) => {
        let items = _.map(group.items, (item) => {
          let FieldView = views.components[item.type] || views.components.MixedFieldView;
          let value = values[item._id];
          if (typeof value === 'undefined') {
            value = item.value;
          }
          return React.createElement(FieldView, {
            key: item._id,
            // @ts-ignore
            className: 'form-group row',
            model,
            // @ts-ignore
            field: fields[item._id],
            value: value,
            onChange: (v: any) => this.handleChange(item._id, v)
          });
        });
        content.push(<div className="card mb-3 mx-2" key={index}>
          <div className="card-heading">{group.title}</div>
          <div className="card-body">
            <div className="form form-horizontal">{items}</div>
          </div>
        </div>);
      });
    }

    return (
      <div className="settings-page">
        <div className="content-header pl-2">
          <h4>{tr('Settings', 'alaska-settings')}</h4>
        </div>
        <div className="form-horizontal">
          {content}
        </div>
        <ActionBar>
          <ActionGroup
            model={model}
            items={[{
              key: 'save',
              action: {
                title: 'Save',
                color: 'primary'
              },
              onClick: this.handleSave
            }]}
          />
        </ActionBar>
      </div>
    );
  }
}

export default connect(
  (state: StoreState) => ({ lists: state.lists, settings: state.settings, action: state.action }),
  (dispatch) => bindActionCreators({
    loadList: listsRedux.loadList,
    clearList: listsRedux.clearList,
    actionRequest: actionRedux.actionRequest,
  }, dispatch)
)(SettingsPage);
