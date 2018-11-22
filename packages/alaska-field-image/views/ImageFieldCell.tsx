import * as React from 'react';
import { CellViewProps } from 'alaska-admin-view';

export default class ImageFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let { value, field } = this.props;
    let url = '';
    if (value) {
      if (typeof value === 'string') {
        url = value + (field.thumbSuffix || '');
      } else {
        url = value.thumbUrl || value.url + (field.thumbSuffix || '');
      }
    }
    if (!url) {
      return <div className="image-field-cell" />;
    }
    return (
      <div className="image-field-cell">
        <img alt="" src={url} />
      </div>
    );
  }
}
