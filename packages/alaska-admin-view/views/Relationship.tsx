import * as React from 'react';
import * as tr from 'grackle';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Node from './Node';
import DataTable from './DataTable';
import * as listsRedux from '../redux/lists';
import { RelationshipProps, State, RecordList, Record } from '..';

interface RelationshipState {
  records: Record[];
}

interface Props extends RelationshipProps {
  locale: string;
  loadList: Function;
  lists: { [model: string]: RecordList<any> };
}

class Relationship extends React.Component<Props, RelationshipState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      records: []
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps: Props) {
    let { model, from, lists } = nextProps;
    if (!model) return;
    if (from !== this.props.from || model.modelName !== (this.props.model ? this.props.model.modelName : '')) {
      this.setState({ records: [] }, () => {
        this.init();
      });
      return;
    }
    let list = lists[model.id];
    if (this.state.records !== list.results) {
      this.setState({ records: list ? list.results : [] }, () => {
        this.init();
      });
    }
  }

  init() {
    let { model, filters: propFilters, loadList } = this.props;
    let list = this.props.lists[model.id];
    if (list && this.state.records && list.results === this.state.records) return;
    let filters = Object.assign({}, propFilters, { [this.props.path]: this.props.from });
    loadList({
      model: model.id,
      page: 1,
      filters
    });
  }

  render() {
    let { title, model } = this.props;
    let { records } = this.state;
    return (
      <Node
        wrapper="Relationship"
        props={this.props}
        className="relationship card mt-2"
      >
        <div className="card-title">{tr('Relationship') + `: ${tr(title || model.modelName, model.serviceId)}`}</div>
        <DataTable
          model={model}
          records={records}
        />
      </Node>
    );
  }
}

export default connect(
  ({ lists, settings }: State) => ({ lists, locale: settings.locale }),
  (dispatch) => bindActionCreators({
    loadList: listsRedux.loadList
  }, dispatch)
)(Relationship);
