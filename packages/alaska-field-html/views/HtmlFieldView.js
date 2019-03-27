"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
class HtmlFieldView extends React.Component {
    componentDidMount() {
        if (this.id && typeof UE !== 'undefined') {
            let editor = UE.getEditor(this.id);
            editor.ready(() => {
                let value = this.props.value ? this.props.value : '<p></p>';
                editor.setContent(value);
            });
            editor.addListener('contentChange', () => {
                let { disabled } = this.props;
                if (disabled)
                    return;
                let content = editor.getContent();
                this.props.onChange(content);
            });
        }
    }
    componentWillUnmount() {
        if (this.id && typeof UE !== 'undefined') {
            UE.delEditor(this.id);
        }
    }
    render() {
        let { className, error, field, value, disabled } = this.props;
        let readonly = disabled || field.fixed;
        let editor;
        if (readonly) {
            editor = (React.createElement("div", { className: "html-field-fixed p-2", dangerouslySetInnerHTML: { __html: value || '' } }));
        }
        else if (typeof UE !== 'undefined') {
            if (!this.id) {
                this.id = `html-editor-${Math.random()}`;
            }
            editor = React.createElement("script", { id: this.id, type: "text/plain", style: { width: '100%', height: '300px' } });
        }
        else {
            editor = React.createElement("div", { className: "form-control", style: { border: 'none' } }, "Missing UEditor");
        }
        let { help } = field;
        className += ' html-field';
        if (error) {
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let label = field.nolabel ? '' : field.label;
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-form-label col-sm-2" }, label),
                React.createElement("div", { className: "col-sm-10" },
                    editor,
                    helpElement)));
        }
        return (React.createElement("div", { className: className },
            label ? React.createElement("label", { className: "col-form-label" }, label) : null,
            editor,
            helpElement));
    }
}
exports.default = react_redux_1.connect((state) => ({ settings: state.settings }))(HtmlFieldView);
