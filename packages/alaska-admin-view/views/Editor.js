"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const React = require("react");
const Node_1 = require("./Node");
const FieldGroup_1 = require("./FieldGroup");
const check_ability_1 = require("../utils/check-ability");
function sortByAfter(items) {
    let paths = _.map(items, (item) => item.path);
    let map = {};
    for (let item of items) {
        map[item.path] = item;
        if (item.after && paths.indexOf(item.after) > -1) {
            let selfIndex = paths.indexOf(item.path);
            let afterIndex = paths.indexOf(item.after);
            paths.splice(afterIndex < selfIndex ? afterIndex + 1 : afterIndex, 0, paths.splice(selfIndex, 1)[0]);
        }
    }
    let list = [];
    for (let path of paths) {
        list.push(map[path]);
    }
    return list;
}
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.handleFieldChange = (key, value, error) => {
            let { record, onChange, errors } = this.props;
            if (typeof error !== 'undefined') {
                this.errorCheckers[key] = true;
                errors = errors || immutable({});
                if (error) {
                    errors = errors.set(key, error);
                }
                else if (errors[key]) {
                    errors = errors.without(key);
                }
            }
            else {
                this.errorCheckers[key] = false;
            }
            onChange(record.set(key, value), this._getErrors(errors));
        };
        this.state = {};
        this.errorCheckers = {};
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { model, record } = nextProps;
        const isNew = !record.id;
        const nextState = {
            disabled: nextProps.disabled || (isNew && model.nocreate) || (!isNew && model.noupdate)
        };
        if (!nextState.disabled) {
            let ability = nextProps.model.id + (isNew ? '.create' : '.update');
            nextState.disabled = !check_ability_1.hasAbility(ability, isNew ? null : record);
        }
        return nextState;
    }
    componentDidMount() {
        this._checkErrors();
    }
    componentDidUpdate() {
        this._checkErrors();
    }
    _checkErrors() {
        const { record, errors, onChange } = this.props;
        let newErrors = this._getErrors(errors);
        if (errors !== newErrors) {
            onChange(record, newErrors);
        }
    }
    _getErrors(errors) {
        let { model, record } = this.props;
        errors = errors || immutable({});
        _.forEach(model.fields, (field, key) => {
            if (this.errorCheckers[key] === true) {
                return;
            }
            if (field.required && !record[key]) {
                let value = tr('This field is required!');
                if (errors[key] !== value) {
                    errors = errors.set(key, value);
                }
            }
            else if (field.required && typeof record[key] === 'object' && !_.size(record[key])) {
                let value = tr('This field is required!');
                if (errors[key] !== value) {
                    errors = errors.set(key, value);
                }
            }
            else if (errors[key]) {
                errors = errors.without(key);
            }
        });
        if (_.isEmpty(errors))
            return null;
        return errors;
    }
    renderGroups() {
        let { model, record, embedded, errors } = this.props;
        let { disabled } = this.state;
        let groups = {
            default: {
                embedded,
                title: '',
                fields: [],
                path: 'default',
                model,
                record,
                errors,
                onFieldChange: this.handleFieldChange
            }
        };
        _.forEach(model.groups, (group, key) => {
            groups[key] = _.assign({ path: key }, group, {
                fields: [],
                embedded,
                model,
                record,
                errors,
                onFieldChange: this.handleFieldChange
            });
            if (disabled === true) {
                groups[key].disabled = true;
            }
        });
        _.forEach(model.fields, (field) => {
            if (!field.group || !groups[field.group]) {
                groups.default.fields.push(field);
            }
            else {
                groups[field.group].fields.push(field);
            }
        });
        _.forEach(groups, (group) => {
            group.fields = sortByAfter(group.fields);
        });
        return sortByAfter(_.values(groups)).map((group) => React.createElement(FieldGroup_1.default, Object.assign({ key: group.path }, group)));
    }
    render() {
        return (React.createElement(Node_1.default, { wrapper: "Editor", props: this.props, className: `editor${this.props.embedded ? ' embedded' : ''}` }, this.renderGroups()));
    }
}
exports.default = Editor;
