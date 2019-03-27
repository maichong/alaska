"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const classnames = require("classnames");
const Node_1 = require("./Node");
const __1 = require("..");
class RelationshipTab extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { relationship, record } = this.props;
        let { total } = this.state;
        if (typeof total === 'number' || !record)
            return;
        let filters = {
            _limit: 1,
            [relationship.path]: record.id
        };
        __1.query({
            model: relationship.ref,
            filters
        }).then((res) => {
            this.setState({ total: res.total });
        });
    }
    render() {
        let { model, relationship, onClick, active } = this.props;
        let title = relationship.title;
        if (!title) {
            let ref = __1.store.getState().settings.models[relationship.ref];
            if (ref) {
                title = ref.label;
            }
        }
        let { total } = this.state;
        return (React.createElement(Node_1.default, { className: classnames('editor-tab relationship-tab', { active }), wrapper: "RelationshipTab", props: this.props, onClick: onClick },
            tr(title, model.serviceId),
            React.createElement("small", null, total)));
    }
}
exports.default = RelationshipTab;
