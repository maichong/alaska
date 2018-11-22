import * as React from 'react';
import * as tr from 'grackle';
import { CellViewProps } from 'alaska-admin-view';

export default class GeoFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let value = this.props.value;
    if (!value || !value[0]) {
      return <div />;
    }
    return (<a
      href={
        'http://m.amap.com/navi/?dest=' + value[0] + ',' + value[1]
        + '&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd'
      }
      target="_blank"
      rel="noopener noreferrer"
    >{tr('GEO')}
    </a>);
  }
}
