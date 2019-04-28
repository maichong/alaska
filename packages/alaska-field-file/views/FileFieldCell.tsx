import * as React from 'react';
import * as tr from 'grackle';
import { CellViewProps } from 'alaska-admin-view';

export default class FileFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let { value, field } = this.props;
    let el = null;
    if (value) {
      if (typeof value === 'string') {
        value = { url: value };
      }
      if (field.multi) {
        if (value.length) {
          el = value.length;
        }
      } else if (value.url) {
        el = <a target="_blank" href={value.url}>{tr('Download')}</a>;
      }
    }
    return (
      <div className="file-field-cell">{el}</div>
    );
  }
}
