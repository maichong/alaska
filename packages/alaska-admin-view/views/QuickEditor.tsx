import * as _ from 'lodash';
import * as React from 'react';
import * as checkDepends from 'check-depends';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import toast from '@samoyed/toast';
import Node from './Node';
import Editor from './Editor';
import { QuickEditorProps, Record, State } from '..';
import * as ActionRedux from '../redux/action';
import QuickEditorActionBar from './QuickEditorActionBar';
import QuickEditorTitleBar from './QuickEditorTitleBar';

interface QuickEditorState {
  mode: Mode;
  data?: Record;
  updateError: boolean;
}

enum Mode { 'ONE', 'MULTI' }

interface Props extends QuickEditorProps {
  actionRequest: Function;
  action: { errorMsg: string; action: string; };
}

class QuickEditor extends React.Component<Props, QuickEditorState> {
  _r?: number;
  el?: React.ReactNode;
  editorRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: Mode.ONE,
      updateError: false
    };
  }

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  init(props: Props) {
    const { selected, action } = props;

    const { data, mode } = this.state;
    let nextState: QuickEditorState = {} as QuickEditorState;

    if (mode === Mode.ONE && selected.length > 1) {
      nextState.mode = Mode.MULTI;
      nextState.data = { _id: '' };
    } else if (selected.length === 1 && (!data || selected[0]._id !== data._id)) {
      nextState.data = selected[0];
      nextState.mode = Mode.ONE;
    }
    if (this.state.updateError) {
      let title = action.action || 'action';
      if (action && action.errorMsg) {
        //不定义any，ts会报错
        let error: any = action.errorMsg;
        toast(tr(error), tr(`${_.upperFirst(title)} Failure`), { type: 'error' });
      } else {
        toast(tr(`${title} success!`), tr(`${title}`), { type: 'success' });
      }
      nextState.updateError = false;
    }
    if (_.size(nextState)) {
      this.setState(nextState);
    }
  }

  canEdit = () => {
    const { model, selected } = this.props;

    if (!model || (!selected.length)) return false;
    if (model.noupdate) return false;
    if (!model.actions || !model.actions.update) return false;
    // update存在
    let action = model.actions.update;
    if (selected.length === 1) {
      if (action.disabled && checkDepends(action.disabled, selected[0])) return false;
      if (action.hidden && checkDepends(action.hidden, selected[0])) return false;
    }
    return true;
  };

  handleChange = (label: string, value: any) => {
    let { data } = this.state;
    let tmpRecord: Record = _.cloneDeep(data);
    tmpRecord[label] = value;
    this.setState({ data: tmpRecord });
  }

  handleSave = () => {
    const { model, selected, actionRequest } = this.props;
    const { data, mode } = this.state;

    if (!data) return;
    let dataForSave;
    if (mode === Mode.ONE) {
      if (!this.editorRef) return;
      let errors = this.editorRef.checkErrors();
      if (_.size(errors)) return;
      dataForSave = {
        id: data._id,
        ...data
      };
    } else {
      let dataWitoutId = _.omit(data, '_id');
      dataForSave = { ...dataWitoutId };
    }
    this._r = Math.random();
    let records = _.map(selected, (r) => r._id);
    actionRequest({
      model: model.serviceId + '.' + model.modelName,
      records,
      action: 'update',
      body: dataForSave
    });
    this.setState({ updateError: true });
  };

  render() {
    const { model, selected, hidden, onCannel } = this.props;
    let { mode, data } = this.state;

    let className = 'quick-editor quick-editor-' + (mode === Mode.ONE ? 'one' : 'multi');

    let title = '';
    let desc = '';
    let saveText = '';

    let { el } = this;

    if (!hidden && window.innerWidth > 600) {
      let canEdit = this.canEdit();
      if (canEdit) {
        if (mode === Mode.MULTI) {
          title = tr('Quick edit multi records');
          desc = tr('QUICK_EDIT_MULTI', {
            item: selected[0][model.titleField] || selected[0]._id,
            count: selected.length
          });
          saveText = tr('SAVE_MULTI_RECORDS', {
            count: selected.length
          });
        } else if (mode === Mode.ONE) {
          title = tr('Quick edit record');
          desc = tr('QUICK_EDIT', {
            item: selected[0][model.titleField] || selected[0]._id
          });
          saveText = tr('Save Record', {
            count: selected.length
          });
        }
      } else if (mode === Mode.ONE) {
        title = tr('Quick Viewer');
        data = selected[0];
      }

      el = (
        <div>
          <QuickEditorTitleBar
            title={title}
            onCannel={onCannel}
          />
          <div className="quick-editor-content">
            {canEdit ? (<div
              className={'quick-editor-desc alert alert-' + (mode === Mode.ONE ? 'info' : 'warning')}
            >{desc}</div>) : null}
            {
              selected.length > 0 ? <Editor
                ref={(r) => {
                  this.editorRef = r;
                }}
                model={model}
                record={data}
                onChange={this.handleChange}
              /> : null
            }
          </div>
          <QuickEditorActionBar
            saveText={saveText}
            canEdit={canEdit}
            onCannel={onCannel}
            onSave={this.handleSave}
          />
        </div>
      );
      this.el = el;
    } else {
      className += ' quick-editor-hidden';
    }

    return (
      <Node
        className={className}
        wrapper="QuickEditor"
        props={this.props}
      >
        {el}
      </Node>
    );
  }
}

export default connect(
  (state: State) => ({ action: state.action }),
  (dispatch) => bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch)
)(QuickEditor);
