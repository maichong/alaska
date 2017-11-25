// @flow

import React from 'react';

export default class ImageFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value !== this.props.value;
  }

  render() {
    let value = this.props.value;
    if (!value || !value.thumbUrl) {
      return <div className="image-field-cell" />;
    }
    let styles = {
      img: {
        height: 40,
        maxWidth: 100
      }
    };
    return (
      <div className="image-field-cell">
        <img alt="" src={value.thumbUrl} style={styles.img} />
      </div>
    );
  }
}
