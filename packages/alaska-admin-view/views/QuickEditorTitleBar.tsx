import * as React from 'react';
import { QuickEditorTitleBarProps } from '..';

export default class QuickEditorTitleBar extends React.Component<QuickEditorTitleBarProps> {
  render() {
    const { title, onCannel } = this.props;
    return (
      <div className="quick-editor-title-bar">
        {title}
        <i className="fa fa-close icon-btn" onClick={() => onCannel()} />
      </div>
    );
  }
}
