// @flow

import React from 'react';
import _ from 'lodash';

export default class ImageLinkFieldCell extends React.Component {

  props: {
    field: Object,
    value: string
  };

  shouldComponentUpdate(props: Object) {
    return props.value !== this.props.value;
  }

  render() {
    const { value, field } = this.props;
    if (!value) {
      return <div className="image-link-field-cell"/>;
    }
    let style = {
      height: 40,
      maxWidth: 100
    };

    let thumbSuffix = field.thumbSuffix || '';

    if (field.multi && Array.isArray(value)) {
      return (
        <div className="image-link-field-cell">
          {
            _.map(value, (link) => <img src={link + thumbSuffix} style={style} />)
          }
        </div>
      );
    }

    return (
      <img src={value + thumbSuffix} style={style} />
    );
  }
}
