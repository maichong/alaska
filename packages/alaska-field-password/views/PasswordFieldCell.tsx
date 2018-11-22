import * as React from 'react';
import { CellViewProps } from 'alaska-admin-view';

export default class PasswordFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>******</div>
    );
  }
}
