import * as React from 'react';
import Node from './Node';
import Header from './Header';
import Body from './Body';
import { ContentProps } from '..';

interface ContentState {
}

export default class Content extends React.Component<ContentProps, ContentState> {
  constructor(props: ContentProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Node
        className="content"
        wrapper="Content"
        props={this.props}
      >
        <Header />
        <Body />
      </Node>
    );
  }
}
