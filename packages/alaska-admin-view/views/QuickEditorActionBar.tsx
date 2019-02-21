import * as React from 'react';
import * as tr from 'grackle';
import { QuickEditorActionBarProps } from '..';

export default class QuickEditorActionBar extends React.Component<QuickEditorActionBarProps> {
  render() {
    const { canEdit, saveText, onCannel, onSave, errors } = this.props;
    return (
      <div className="quick-editor-action-bar">
        <div className="inner">
          {canEdit ? <button className="btn btn-primary" disabled={!!errors} onClick={errors ? null : () => onSave()}>{tr(saveText)}</button> : null}
          <div className="btn btn-light" onClick={() => onCannel()}>{tr('Cancel')}</div>
        </div>
      </div>
    );
  }
}
