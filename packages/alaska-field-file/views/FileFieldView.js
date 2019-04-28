"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const shallowEqualWithout = require("shallow-equal-without");
const tr = require("grackle");
const prettyBytes = require("pretty-bytes");
const alaska_admin_view_1 = require("alaska-admin-view");
class FileFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleAddFile = () => {
            let { field, value } = this.props;
            let { multi } = field;
            if (value) {
                if (!multi) {
                    value = [value];
                }
                else {
                    value = value.concat();
                }
            }
            else {
                value = [];
            }
            let nextState = {
                error: ''
            };
            _.forEach(this.fileInput.files, (file) => {
                if (value.length >= this.state.max || !file)
                    return;
                if (file.size && file.size > field.maxSize) {
                    nextState.error = 'File exceeds the allowed size';
                    return;
                }
                if (field.allowed && field.allowed.length) {
                    let filename = file.name.toLocaleLowerCase();
                    if (!_.find(field.allowed, (ext) => filename.endsWith(`.${ext}`))) {
                        nextState.error = 'Invalid file format';
                        return;
                    }
                }
                this.uploadQueue.push(file);
            });
            this.setState(nextState);
            if (this.uploadQueue.length && !this.currentTask)
                this.upload();
        };
        this.state = {
            max: props.field.multi ? (props.field.max || 1000) : 1,
            error: '',
        };
        this.uploadQueue = [];
    }
    shouldComponentUpdate(props, state) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
            || !shallowEqualWithout(state, this.state);
    }
    async upload() {
        const { field } = this.props;
        let file = this.uploadQueue.shift();
        if (!file)
            return;
        this.currentTask = file;
        try {
            let record = await alaska_admin_view_1.api.post('/action', {
                query: {
                    _model: 'alaska-file.File',
                    _action: 'create'
                },
                body: {
                    driver: field.driver,
                    file
                }
            });
            let item = field.plainName === 'mixed' ? record : record.url;
            let { value, onChange } = this.props;
            if (field.multi) {
                value = (value || []).concat(item);
                onChange(value);
            }
            else {
                onChange(item);
            }
        }
        catch (e) {
            this.setState({ error: e.message });
        }
        this.currentTask = null;
        if (this.uploadQueue.length) {
            this.upload();
        }
    }
    handleRemoveItem(item) {
        let value = null;
        if (this.props.field.multi) {
            value = [];
            _.forEach(this.props.value, (i) => {
                if (i !== item) {
                    value.push(i);
                }
            });
        }
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
    render() {
        let { className, field, value, disabled, error: errorText } = this.props;
        let { error, max } = this.state;
        if (!field.multi) {
            value = value ? [value] : [];
        }
        let items = [];
        let readonly = disabled || field.fixed;
        _.forEach(value, (item, index) => {
            let file = item;
            if (typeof item === 'string') {
                file = { url: item };
            }
            items.push((React.createElement("div", { key: index, className: "file-field-item" },
                file.name && React.createElement("b", null, file.name),
                file.size && React.createElement("span", null, prettyBytes(file.size)),
                React.createElement("a", { target: "_blank", href: file.url }, tr('Download')),
                readonly ? null : React.createElement("a", { href: "javascript:void(0)", onClick: () => this.handleRemoveItem(item) }, tr('Remove')))));
        });
        if (items.length < max) {
            if (!readonly) {
                items.push((React.createElement("div", { className: "file-field-add", key: "add" },
                    React.createElement("div", { className: "btn btn-success" },
                        React.createElement("i", { className: "fa fa-cloud-upload" }),
                        " ",
                        tr('Upload')),
                    React.createElement("input", { ref: (r) => {
                            this.fileInput = r;
                        }, multiple: field.multi, type: "file", onChange: this.handleAddFile }))));
            }
        }
        if (!items.length && readonly) {
            items.push((React.createElement("div", { className: "file-field-add", key: "add" },
                React.createElement("i", { className: "fa fa-cloud-upload" }))));
        }
        let { help } = field;
        className += ' file-field';
        error = error || errorText;
        if (error) {
            className += ' is-invalid';
            help = tr(error);
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let label = field.nolabel ? '' : field.label;
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" },
                    items,
                    helpElement)));
        }
        return (React.createElement("div", { className: className },
            label ? (React.createElement("label", { className: "col-form-label" }, label)) : null,
            React.createElement("div", null, items),
            helpElement));
    }
}
exports.default = FileFieldView;
