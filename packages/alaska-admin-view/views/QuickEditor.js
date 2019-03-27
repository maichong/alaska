"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const toast_1 = require("@samoyed/toast");
const Node_1 = require("./Node");
const Editor_1 = require("./Editor");
const ActionRedux = require("../redux/action");
const QuickEditorActionBar_1 = require("./QuickEditorActionBar");
const QuickEditorTitleBar_1 = require("./QuickEditorTitleBar");
const check_ability_1 = require("../utils/check-ability");
var Mode;
(function (Mode) {
    Mode[Mode["ONE"] = 0] = "ONE";
    Mode[Mode["MULTI"] = 1] = "MULTI";
})(Mode || (Mode = {}));
class QuickEditor extends React.Component {
    constructor(props) {
        super(props);
        this.canEdit = () => {
            const { model, selected } = this.props;
            if (!model || (!selected.length))
                return false;
            if (model.noupdate)
                return false;
            if (!model.actions || !model.actions.update)
                return false;
            if (!check_ability_1.hasAbility(`${model.id}.update`, selected[0]))
                return false;
            let action = model.actions.update;
            if (selected.length === 1) {
                if (action.disabled && check_ability_1.default(action.disabled, selected[0]))
                    return false;
                if (action.hidden && check_ability_1.default(action.hidden, selected[0]))
                    return false;
            }
            return true;
        };
        this.handleChange = (record, errors) => {
            this.setState({ record, errors });
        };
        this.handleSave = () => {
            const { model, selected, actionRequest } = this.props;
            const { record, mode, errors } = this.state;
            if (!record)
                return;
            let dataForSave;
            if (mode === Mode.ONE) {
                if (!this.editorRef)
                    return;
                if (_.size(errors))
                    return;
                dataForSave = Object.assign({ id: record._id }, record);
            }
            else {
                let dataWitoutId = _.omit(record, '_id');
                dataForSave = Object.assign({}, dataWitoutId);
            }
            this._r = Math.random();
            let records = _.map(selected, (r) => r._id);
            actionRequest({
                model: `${model.serviceId}.${model.modelName}`,
                records,
                action: 'update',
                body: dataForSave
            });
            this.setState({ updateError: true });
        };
        this.state = {
            record: immutable({}),
            errors: null,
            mode: Mode.ONE,
            updateError: false
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { selected, action } = nextProps;
        let nextState = {};
        if (prevState.mode === Mode.ONE && selected.length > 1) {
            nextState.mode = Mode.MULTI;
            nextState.record = immutable({ _id: '' });
        }
        else if (selected.length === 1 && (!prevState.record || selected[0]._id !== prevState.record._id)) {
            nextState.record = selected[0];
            nextState.mode = Mode.ONE;
        }
        if (prevState.updateError) {
            let title = action.action || 'action';
            if (action && action.error) {
                toast_1.default(tr(`${_.upperFirst(title)} Failure`), tr(action.error.message), { type: 'error' });
            }
            else {
                toast_1.default(tr(`${title} success!`), '', { type: 'success' });
            }
            nextState.updateError = false;
        }
        return nextState;
    }
    render() {
        const { model, selected, hidden, onCannel } = this.props;
        let { mode, record, errors } = this.state;
        let className = `quick-editor quick-editor-${mode === Mode.ONE ? 'one' : 'multi'}`;
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
                }
                else if (mode === Mode.ONE) {
                    title = tr('Quick edit record');
                    desc = tr('QUICK_EDIT', {
                        item: selected[0][model.titleField] || selected[0]._id
                    });
                    saveText = tr('Save Record', {
                        count: selected.length
                    });
                }
            }
            else if (mode === Mode.ONE) {
                title = tr('Quick Viewer');
                record = selected[0];
            }
            el = (React.createElement("div", null,
                React.createElement(QuickEditorTitleBar_1.default, { title: title, onCannel: onCannel }),
                React.createElement("div", { className: "quick-editor-content" },
                    canEdit ? (React.createElement("div", { className: `quick-editor-desc alert alert-${mode === Mode.ONE ? 'info' : 'warning'}` }, desc)) : null,
                    selected.length > 0 ? React.createElement(Editor_1.default, { ref: (r) => {
                            this.editorRef = r;
                        }, model: model, record: record, errors: errors, onChange: this.handleChange }) : null),
                React.createElement(QuickEditorActionBar_1.default, { errors: mode === Mode.ONE && errors, saveText: saveText, canEdit: canEdit, onCannel: onCannel, onSave: this.handleSave })));
            this.el = el;
        }
        else {
            className += ' quick-editor-hidden';
        }
        return (React.createElement(Node_1.default, { className: className, wrapper: "QuickEditor", props: this.props }, el));
    }
}
exports.default = react_redux_1.connect((state) => ({ action: state.action }), (dispatch) => redux_1.bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch))(QuickEditor);
