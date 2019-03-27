"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const shallowEqualWithout = require("shallow-equal-without");
const alaska_admin_view_1 = require("alaska-admin-view");
const tr = require("grackle");
class ImageFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleAddImage = () => {
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
            _.forEach(this.imageInput.files, (file) => {
                if (value.length >= this.state.max || !file)
                    return;
                let matchs = file.name.match(/\.(\w+)$/);
                if (!matchs) {
                    nextState.error = 'Invalid image format';
                    return;
                }
                let ext = matchs[1].replace('jpeg', 'jpg').toLowerCase();
                if ((field.allowed || ['jpg', 'png']).indexOf(ext) < 0) {
                    nextState.error = 'Invalid image format';
                    return;
                }
                if (file.size && file.size > field.maxSize) {
                    nextState.error = 'Image exceeds the allowed size';
                    return;
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
            multi: ''
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
            let image = await alaska_admin_view_1.api.post('/action', {
                query: {
                    _model: 'alaska-image.Image',
                    _action: 'create'
                },
                body: {
                    driver: field.driver,
                    file
                }
            });
            let item = field.plainName === 'mixed' ? image : image.url;
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
            let url = '';
            if (typeof item === 'string') {
                let matchs = item.match(/\.(\w+)$/i);
                url = item + ((field.thumbSuffix || '').replace('{EXT}', matchs ? matchs[1] : '') || '');
            }
            else {
                url = item.thumbUrl || item.url + ((field.thumbSuffix || '').replace('{EXT}', item.ext || '') || '');
            }
            items.push((React.createElement("div", { key: index, className: "image-field-item" },
                React.createElement("img", { alt: "", src: url }),
                readonly ? null : (React.createElement("button", { className: "btn btn-link btn-block", disabled: disabled, onClick: () => this.handleRemoveItem(item) }, tr('Remove'))))));
        });
        if (items.length < max) {
            if (!readonly) {
                items.push((React.createElement("div", { className: "image-field-item image-field-add", key: "add" },
                    React.createElement("i", { className: "fa fa-plus-square-o" }),
                    React.createElement("input", { ref: (r) => {
                            this.imageInput = r;
                        }, multiple: this.state.multi, accept: "image/png;image/jpg;", type: "file", onChange: this.handleAddImage }))));
            }
        }
        if (!items.length && readonly) {
            items.push((React.createElement("div", { className: "image-field-item image-field-add", key: "add" },
                React.createElement("i", { className: "fa fa-picture-o" }))));
        }
        let { help } = field;
        className += ' image-field';
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
exports.default = ImageFieldView;
