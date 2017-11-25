// @flow

import React from 'react';

export default class IconFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value !== this.props.value;
  }

  render() {
    const { value } = this.props;
    if (!value) {
      return <div />;
    }
    return <i className={'fa fa-' + value} />;
  }
}
