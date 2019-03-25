import * as React from 'react';
import * as tr from 'grackle';
import * as classnames from 'classnames';
import Node from './Node';
import {
  RelationshipTabProps, store, query
} from '..';

interface State {
  total?: number;
}

export default class RelationshipTab extends React.Component<RelationshipTabProps> {
  state: State = {
  };

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  init() {
    const { relationship, record } = this.props;
    let { total } = this.state;
    if (typeof total === 'number' || !record) return;
    let filters = {
      _limit: 1,
      [relationship.path]: record.id
    };

    query({
      model: relationship.ref,
      filters
    }).then((res) => {
      this.setState({ total: res.total });
    });
  }

  render() {
    let { model, relationship, onClick, active } = this.props;
    let title = relationship.title;
    if (!title) {
      let ref = store.getState().settings.models[relationship.ref];
      if (ref) {
        title = ref.label;
      }
    }
    let { total } = this.state;
    return (
      <Node
        className={classnames('editor-tab relationship-tab', { active })}
        wrapper="RelationshipTab"
        props={this.props}
        onClick={onClick}
      >
        {tr(title, model.serviceId)} <small>{total}</small>
      </Node>
    );
  }
}
