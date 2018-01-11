//@flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import checkDepends from 'check-depends';
import Immutable from 'seamless-immutable';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import Node from './Node';
import Editor from './Editor';
import * as saveRedux from '../redux/save';

const MODE_ONE = 0; // 0 编辑单个
const MODE_MULTI = 1; // 1 编辑多个

type Props = {
  model: Alaska$view$Model,
  record?: ImmutableObject<Alaska$view$Record>,
  records: ImmutableArray<Alaska$view$Record>,
  onCancel: Function,
  saveAction: Function,
  save: Alaska$view$save
};

type State = {
  mode: typeof MODE_ONE | typeof MODE_MULTI,
  data?: ImmutableObject<Alaska$view$Record>
};

class QuickEditor extends React.Component<Props, State> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func,
    toast: PropTypes.func,
  };

  _r: ?number;
  el: ?React$Node;

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: MODE_ONE,
    };
  }

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  init(props: Props) {
    const { save, record, records } = props;
    if (save._r && save._r === this._r) {
      this._r = 0;
      const { toast, t } = this.context;
      let { error } = save;
      if (error) {
        toast('error', t('Save failed'), error.message);
        return;
      }
      toast('success', t('Saved successfully'));
      props.onCancel();
      return;
    }
    if (!records.length && !record) return;

    const { data } = this.state;
    let nextState = {};

    if (this.state.mode === MODE_ONE && records.length > 1) {
      // 切换为编辑多个
      nextState.mode = MODE_MULTI;
      nextState.data = Immutable({ _id: '' });
    } else if (record && records.length < 2 && (!data || record._id !== data._id)) {
      // 切换为编辑单个
      nextState.data = record;
      nextState.mode = MODE_ONE;
    }
    this.setState(nextState);
  }

  canEdit(): boolean {
    const { model, record, records } = this.props;
    if (!model || (!record && !records.length)) return false;
    if (model.noupdate) return false;
    if (model.actions && model.actions.update) {
      // 存在自定义 update
      let action = model.actions.update;
      if (action.ability) {
        // 存在自定义 action 权限
        if (!this.context.settings.abilities[action.ability]) return false;
      } else if (!model.abilities.update) return false;
      if (records.length === 1 && record) {
        // 完善检查
        if (action.hidden && checkDepends(action.hidden, record)) return false;
        if (action.depends && checkDepends(action.depends, record)) return false;
      } else if (action.hidden || action.depends) return false;
    } else {
      // 不存在自定义action
      if (!model.abilities.update) return false;
    }
    return true;
  }

  handleChange = (data: ImmutableObject<Alaska$view$Record>) => {
    this.setState({ data });
  };

  handleSave = () => {
    const { saveAction, records, model } = this.props;
    const { data, mode } = this.state;
    if (!data) return;
    let dataForSave;
    if (mode === MODE_ONE) {
      dataForSave = {
        id: data._id,
        ...data
      };
    } else {
      let dataWitoutId = _.omit(data, '_id');
      dataForSave = _.map(records, (r) => ({
        id: r._id,
        ...dataWitoutId
      }));
    }
    this._r = Math.random();
    saveAction({
      service: model.serviceId,
      model: model.modelName,
      key: model.key,
      _r: this._r
    }, dataForSave);
  };

  render() {
    const { t } = this.context;
    const {
      model, record, records, onCancel
    } = this.props;
    let { mode, data } = this.state;

    let className = 'quick-editor quick-editor-' + (mode === MODE_ONE ? 'one' : 'multi');

    let title = '';
    let desc = '';
    let saveText = '';

    let { el } = this;

    if ((records.length || record) && data && window.innerWidth > 600) {

      let canEdit = this.canEdit();

      if (canEdit) {
        if (mode === MODE_MULTI) {
          title = t('Quick edit multi records');
          desc = t('QUICK_EDIT_MULTI', {
            item: records[0][model.titleField] || records[0]._id,
            count: records.length
          });
          saveText = t('SAVE_MULTI_RECORDS', {
            count: records.length
          });
        } else if (record) {
          title = t('Quick edit record');
          desc = t('QUICK_EDIT', {
            item: record[model.titleField] || record._id
          });
          saveText = t('Save Record', {
            count: records.length
          });
        }
      } else if (record) {
        title = t('Quick Viewer');
        data = record;
      }

      el = (
        <div>
          <div className="quick-editor-title">
            {title}
            <i className="fa fa-close icon-btn" onClick={onCancel} />
          </div>
          <div className="quick-editor-content">
            {canEdit ? (<div
              className={'quick-editor-desc alert alert-' + (mode === MODE_ONE ? 'info' : 'warning')}
            >{desc}</div>) : null}
            <Editor
              model={model}
              record={data}
              id={data._id}
              onChange={this.handleChange}
            />
          </div>
          <div className="quick-editor-bottom">
            <div className="inner">
              {canEdit ? <div className="btn btn-primary" onClick={this.handleSave}>{t(saveText)}</div> : null}
              <div className="btn btn-default" onClick={onCancel}>{t('Cancel')}</div>
            </div>
          </div>
        </div>
      );
      this.el = el;
    } else {
      className += ' quick-editor-hidden';
    }

    return (
      <Node id="quickEditor" className={className}>
        {el}
      </Node>
    );
  }
}

export default connect(({ save }) => ({ save }), (dispatch) => bindActionCreators({
  saveAction: saveRedux.save
}, dispatch))(QuickEditor);
