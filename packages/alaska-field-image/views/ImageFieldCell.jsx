// @flow

import React from 'react';

export default class ImageFieldCell extends React.Component {

  props: {
    value: Object
  };

  shouldComponentUpdate(props: Object) {
    return props.value !== this.props.value;
  }

  render() {
    let value = this.props.value;
    if (!value || !value.thumbUrl) {
      return <div />;
    }
    let styles = {
      img: {
        height: 40,
        maxWidth: 100
      }
    };
    return (
      <img alt="" src={value.thumbUrl} style={styles.img} />
    );
  }
}
