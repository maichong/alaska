import * as React from 'react';
import { FieldViewProps } from 'alaska-admin-view';

interface State {
}

export default class ShowcaseLayoutSelector extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div>ShowcaseLayoutSelector.tsx</div>
      </div>
    );
  }
}
