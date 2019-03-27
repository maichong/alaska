"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tr = require("grackle");
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const settingsRedux = require("../redux/settings");
const Dropdown = require('react-bootstrap/Dropdown');
class LocaleWidget extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (key) => {
            this.setState({ active: key });
            this.props.localeSetting(key);
        };
        this.state = {
            active: props.locale || '',
            localeOpen: false
        };
    }
    render() {
        let { locale, locales } = this.props;
        let { localeOpen } = this.state;
        if (!locale || !locales) {
            return null;
        }
        let list = [];
        _.forEach(locales, (server) => {
            _.forEach(server, (value, key) => {
                if (list.indexOf(key) < 0) {
                    list.push(key);
                }
            });
        });
        if (_.size(list) < 2)
            return null;
        return (React.createElement("li", { className: "locale-widget" },
            React.createElement(Dropdown, { show: this.state.localeOpen, onToggle: (isOpen) => this.setState({ localeOpen: isOpen }) },
                React.createElement(Dropdown.Toggle, { variant: "light", id: "locale-widget" },
                    React.createElement("img", { src: `img/locales/${locale}.png`, alt: "" })),
                React.createElement(Dropdown.Menu, null, list.map((key) => (React.createElement(Dropdown.Item, { key: key, onClick: (() => this.handleChange(key)) },
                    React.createElement("img", { src: `img/locales/${key}.png`, alt: "" }),
                    tr.locale(key)('lang'))))))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ locale: settings.locale, locales: settings.locales }), (dispatch) => redux_1.bindActionCreators({
    localeSetting: settingsRedux.localeSetting
}, dispatch))(LocaleWidget);
