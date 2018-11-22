import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Node from './Node';
import { MenuToggleProps, State } from '..';
import * as layoutRedux from '../redux/layout';

interface Props extends MenuToggleProps {
  layout: string;
  applyLayout: Function;
}

class MenuToggle extends React.Component<Props> {
  handleToggle = () => {
    let { layout } = this.props;
    if (window.innerWidth <= 768) {
      //小屏幕
      if (layout.toString() === 'hidden') {
        layout = 'icon';
      } else {
        layout = 'hidden';
      }
    } else if (layout.toString() === 'full') {
      layout = 'icon';
    } else {
      layout = 'full';
    }
    this.props.applyLayout(layout);
  };

  render() {
    return (
      <Node
        wrapper="MenuToggle"
        props={this.props}
        className="menu-toggle"
      >
        <button className="btn btn-default" onClick={this.handleToggle}>
          <i className="fa fa-bars" />
        </button>
      </Node>
    );
  }
}

export default connect(
  ({ layout }: State) => ({ layout }),
  (dispatch) => bindActionCreators({ applyLayout: layoutRedux.applyLayout }, dispatch)
)(MenuToggle);
