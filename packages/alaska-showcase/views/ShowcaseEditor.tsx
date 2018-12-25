import * as React from 'react';
import { FieldViewProps } from 'alaska-admin-view';

interface State {
}

export default class ShowcaseEditor extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div>ShowcaseEditor.tsx</div>
      </div>
    );
  }
}
