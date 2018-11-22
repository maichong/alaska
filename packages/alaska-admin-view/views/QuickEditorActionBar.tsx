import * as React from 'react';
import * as tr from 'grackle';
import { QuickEditorActionBarProps } from '..';

interface QuickEditorActionBarState {
}

export default class QuickEditorActionBar extends React.Component<QuickEditorActionBarProps, QuickEditorActionBarState> {
  constructor(props: QuickEditorActionBarProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { canEdit, saveText, onCannel, onSave } = this.props;
    return (
      <div className="quick-editor-action-bar">
        <div className="inner">
          {canEdit ? <div className="btn btn-primary" onClick={() => onSave()}>{tr(saveText)}</div> : null}
          <div className="btn btn-default" onClick={() => onCannel()}>{tr('Cancel')}</div>
        </div>
      </div>
    );
  }
}
