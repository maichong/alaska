"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const alaska_admin_view_1 = require("alaska-admin-view");
const Editor_1 = require("alaska-admin-view/views/Editor");
class ShowcaseEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (item, error) => {
            let { value, onChange } = this.props;
            let { actived } = this.state;
            value = immutable(value || []).set(actived, item);
            onChange(value, error || null);
        };
        this.state = {
            actived: -1
        };
    }
    render() {
        let { className, disabled, value, record, error } = this.props;
        let { actived } = this.state;
        let items = value || [];
        className += ' showcase-editor-field';
        let columns = record.layout.split('-').map((cellCount) => _.repeat('0', parseInt(cellCount)));
        let index = -1;
        let els = columns.map((cells, colIndex) => {
            let colClassName = '';
            let colStyle = { height: record.height };
            let firstCell = items[index + 1];
            if (firstCell && firstCell.width) {
                colStyle.width = firstCell.width;
            }
            else {
                colClassName += 'flex-fill';
            }
            return (React.createElement("ul", { className: colClassName, key: colIndex, style: { height: record.height } }, _.map(cells, (z, cellIndex) => {
                index += 1;
                let _index = index;
                let item = items[index] || {};
                let cellClassName = actived === index ? 'active' : '';
                let cellStyle = {
                    width: item.width,
                    height: item.height
                };
                if (cellIndex !== 0) {
                    cellStyle.width = colStyle.width;
                    if (actived === _index) {
                        className += ' no-width';
                    }
                }
                if (cells.length === 1) {
                    cellStyle.height = record.height;
                    if (actived === _index) {
                        className += ' no-height';
                    }
                }
                return (React.createElement("li", { key: cellIndex, className: cellClassName, onClick: () => this.setState({ actived: _index }), style: cellStyle }, item.pic ? React.createElement("img", { style: cellStyle, src: item.pic.url }) : ''));
            })));
        });
        let form;
        if (actived < 0 || actived > index) {
            form = React.createElement("div", { className: "p-4" }, tr('Please select a cell for edit'));
        }
        else {
            form = React.createElement(Editor_1.default, { embedded: true, model: alaska_admin_view_1.store.getState().settings.models['alaska-showcase.ShowcaseItem'], record: immutable(items[actived] || {}), errors: error, onChange: this.handleChange, disabled: disabled });
        }
        return (React.createElement("div", { className: className },
            React.createElement("div", { className: "showcase-preview" },
                React.createElement("div", { className: "showcase-layout-row", style: { width: record.width, height: record.height } }, els)),
            form));
    }
}
exports.default = ShowcaseEditor;
