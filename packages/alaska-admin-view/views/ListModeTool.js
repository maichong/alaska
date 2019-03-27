"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const options = [{
        label: 'list',
        value: 'list'
    }, {
        label: 'card',
        value: 'th-large'
    }];
class ListModeTool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: options[0].value,
            open: false
        };
    }
    render() {
        let { page } = this.props;
        if (page === 'editor')
            return null;
        return '';
    }
}
exports.default = ListModeTool;
