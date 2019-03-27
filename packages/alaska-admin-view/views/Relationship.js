"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const redux_1 = require("redux");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
const DataTable_1 = require("./DataTable");
const listsRedux = require("../redux/lists");
const check_ability_1 = require("../utils/check-ability");
class Relationship extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            records: immutable([])
        };
    }
    componentDidMount() {
        this.init();
    }
    componentWillReceiveProps(nextProps) {
        let { model, from, lists } = nextProps;
        if (!model)
            return;
        if (from !== this.props.from || model.modelName !== (this.props.model ? this.props.model.modelName : '')) {
            this.setState({ records: immutable([]) }, () => {
                this.init();
            });
            return;
        }
        let list = lists[model.id];
        if (!list || this.state.records !== list.results) {
            this.setState({ records: list ? list.results : immutable([]) }, () => {
                this.init();
            });
        }
    }
    init() {
        let { model, filters: propFilters, loadList } = this.props;
        if (!model)
            return;
        if (!check_ability_1.hasAbility(`${model.id}.read`))
            return;
        let list = this.props.lists[model.id];
        if (list && this.state.records && list.results === this.state.records)
            return;
        let filters = Object.assign({}, propFilters, { [this.props.path]: this.props.from });
        loadList({
            model: model.id,
            page: 1,
            filters
        });
    }
    render() {
        let { title, model } = this.props;
        let { records } = this.state;
        if (!model)
            return React.createElement("div", null, "Relationship ERROR");
        if (!check_ability_1.hasAbility(`${model.id}.read`))
            return '';
        if (!title) {
            title = `${tr('Relationship')}: ${tr(model.label || model.modelName, model.serviceId)}`;
        }
        else {
            title = tr(title, model.serviceId);
        }
        return (React.createElement(Node_1.default, { wrapper: "Relationship", props: this.props, className: "relationship card mt-2" },
            React.createElement("div", { className: "card-heading" }, title),
            React.createElement(DataTable_1.default, { model: model, records: records })));
    }
}
exports.default = react_redux_1.connect(({ lists, settings }) => ({ lists, locale: settings.locale }), (dispatch) => redux_1.bindActionCreators({
    loadList: listsRedux.loadList
}, dispatch))(Relationship);
