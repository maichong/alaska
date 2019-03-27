"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const immutable = require("seamless-immutable");
const React = require("react");
const react_router_1 = require("react-router");
const Node_1 = require("./Node");
const DataTableHeader_1 = require("./DataTableHeader");
const DataTableRow_1 = require("./DataTableRow");
class DataTable extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelectAll = () => {
            const { selectAll } = this.state;
            const { records, onSelect } = this.props;
            if (!onSelect)
                return;
            let select = [];
            if (!selectAll) {
                select = records;
            }
            onSelect(select);
        };
        this.handleSelect = (record, select) => {
            let { selected, onSelect } = this.props;
            if (!onSelect)
                return;
            selected = selected || immutable([]);
            let tmpSelect = [];
            let lookup = false;
            _.forEach(selected, (item) => {
                if (String(item._id) !== String(record._id)) {
                    tmpSelect.push(item);
                }
                else {
                    lookup = true;
                }
            });
            if (!lookup && select) {
                tmpSelect.push(record);
            }
            onSelect(tmpSelect);
        };
        this.state = {
            _selected: props.selected,
            _records: props.records,
            selectAll: false,
            selectList: []
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let { selected, records } = nextProps;
        if (_.isEqual(prevState._selected, selected) || _.isEqual(prevState._records, records)) {
            let selectList = [];
            selectList = _.map(selected, (item) => String(item._id));
            return {
                _selected: nextProps.selected,
                _records: nextProps.records,
                selectList: immutable(selectList),
                selectAll: selectList.length > 0 && selectList.length === records.length
            };
        }
        return null;
    }
    render() {
        let { model, columns, records, activated, sort, onSort, onActive, onSelect, history } = this.props;
        let { selectAll, selectList } = this.state;
        columns = columns || model.defaultColumns;
        if (!columns) {
            columns = Object.keys(model.fields).join(' ');
        }
        return (React.createElement(Node_1.default, { tag: "table", wrapper: "DataTable", props: this.props, className: "data-table table" },
            React.createElement(DataTableHeader_1.default, { model: model, columns: columns, select: selectAll, sort: sort, onSelect: onSelect ? this.handleSelectAll : null, onSort: onSort }),
            React.createElement("tbody", null, records.map((item) => (React.createElement(DataTableRow_1.default, { key: item._id, history: history, model: model, columns: columns, record: item, selected: selectAll || selectList.indexOf(String(item._id)) > -1, onSelect: onSelect ? this.handleSelect : null, active: activated === item, onActive: onActive }))))));
    }
}
exports.default = react_router_1.withRouter(DataTable);
