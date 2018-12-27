import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { WidgetProps } from '..';
import * as refreshRedux from '../redux/refresh';

interface Props extends WidgetProps {
  refresh: Function;
}

class RefreshWidget extends React.Component<Props> {
  handleRefresh = () => {
    this.props.refresh();
  }

  render() {
    return (
      <li className="refresh-widget">
        <button className="btn" onClick={() => this.handleRefresh()}>
          <i className="fa fa-refresh" />
        </button>
      </li>
    );
  }
}

export default connect(
  () => ({}),
  (dispatch) => bindActionCreators({
    refresh: refreshRedux.refresh
  }, dispatch)
)(RefreshWidget);
