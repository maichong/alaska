import * as React from 'react';
import { connect } from 'react-redux';
import Node from './Node';
import { CopyrightProps, Settings, State } from '..';

interface Props extends CopyrightProps {
  copyright: string;
}

class Copyright extends React.Component<Props> {
  render() {
    const { copyright } = this.props;
    return (
      <Node
        className="copyright"
        wrapper="Copyright"
        props={this.props}
      >
        <div>{copyright}</div>
      </Node>

    );
  }
}

export default connect(
  ({ settings }: State) => ({ copyright: settings.copyright })
)(Copyright);
