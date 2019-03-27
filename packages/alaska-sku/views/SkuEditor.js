"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const _ = require("lodash");
const immutable = require("seamless-immutable");
const alaska_admin_view_1 = require("alaska-admin-view");
function createPropsMap(props) {
    let map = {};
    _.forEach(props, (p) => {
        if (!p.sku)
            return;
        let item = Object.assign({ valueMap: {} }, p);
        _.forEach(p.values, (v) => {
            item.valueMap[v.id] = v;
        });
        map[item.id] = item;
    });
    return map;
}
function valueToList(value, props, propsMap, oldSkus, record) {
    value = value || immutable([]);
    if (!record._id || !props.length)
        return value;
    let valueMap = _.keyBy(value, 'key');
    let defaultPic = record.pic;
    if (record.pics && Array.isArray(record.pics) && record.pics.length) {
        defaultPic = record.pics[0];
    }
    function createList(index, res) {
        if (!props.length)
            return [];
        index = index | 0;
        res = res || [];
        let prop = props[index];
        if (!index) {
            _.forEach(prop.values, (v) => {
                res.push({
                    [prop.id]: v.id
                });
            });
        }
        else {
            _.forEach(res, (item) => {
                _.forEach(prop.values, (v) => {
                    if (!item[prop.id]) {
                        item[prop.id] = v.id;
                    }
                    else {
                        let newItem = Object.assign({}, item, {
                            [prop.id]: v.id
                        });
                        res.push(newItem);
                    }
                });
            });
        }
        index += 1;
        if (index < props.length) {
            return createList(index, res);
        }
        return res;
    }
    let itemList = createList();
    let result = itemList.map((item) => {
        let keyItems = [];
        let descItems = [];
        let skuProps = [];
        _.keys(item).sort().forEach((pid) => {
            let vid = item[pid];
            keyItems.push(`${pid}:${vid}`);
            let prop = propsMap[pid];
            let propValue = prop.valueMap[vid];
            descItems.push(`${prop.title}:${propValue.title}`);
            skuProps.push({
                id: pid,
                title: prop.title,
                values: [{ id: vid, title: propValue.title }]
            });
        });
        let key = keyItems.join(';');
        let sku = immutable(valueMap[key] || oldSkus[key] || {
            key,
            desc: descItems.join(';'),
            goods: record._id,
            shop: record.shop,
            props: skuProps
        });
        if (defaultPic && !sku.pic) {
            sku = sku.set('pic', defaultPic);
        }
        return sku;
    });
    return immutable(result);
}
class SkuItem extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { opened: false };
        this.handlePic = (e) => {
        };
        this.handleInventory = (e) => {
            const { onChange, value } = this.props;
            onChange(value.set('inventory', e.target.value));
        };
        this.handlePrice = (e) => {
            const { onChange, value } = this.props;
            onChange(value.set('price', e.target.value));
        };
        this.handleDiscount = (e) => {
            const { onChange, value } = this.props;
            onChange(value.set('discount', e.target.value));
        };
        this.handleOpen = () => {
            this.setState({ opened: true });
        };
        this.handleClose = () => {
            this.setState({ opened: false });
        };
    }
    render() {
        const { value, disabled } = this.props;
        const { opened } = this.state;
        let thumbUrl = '';
        if (value.pic) {
            thumbUrl = value.pic.thumbUrl || value.pic.url;
        }
        let CreateInventoryModal = alaska_admin_view_1.views.components['CreateInventoryModal'];
        let inventoryBtn;
        if (value._id && CreateInventoryModal) {
            inventoryBtn = React.createElement(React.Fragment, null,
                React.createElement("button", { className: "btn btn-primary btn-sm", onClick: this.handleOpen }, tr('Input Inventory')),
                opened && React.createElement(CreateInventoryModal, { modelId: "alaska-sku.Sku", goods: value.goods, sku: value._id, onClose: this.handleClose }));
        }
        return (React.createElement("tr", null,
            React.createElement("td", { className: "sku-pic" },
                React.createElement("img", { alt: "", src: thumbUrl, onClick: this.handlePic })),
            React.createElement("td", { className: "sku-desc", dangerouslySetInnerHTML: { __html: value.desc.replace(/\;/g, '<br/>') } }),
            React.createElement("td", { className: "sku-price" },
                React.createElement("input", { className: value.price > 0 ? '' : 'is-invalid', type: "number", disabled: disabled, value: value.price || 0, onChange: this.handlePrice })),
            React.createElement("td", { className: "sku-discount" },
                React.createElement("input", { type: "number", disabled: disabled, value: value.discount || 0, onChange: this.handleDiscount })),
            React.createElement("td", { className: "sku-volume" }, value.volume),
            React.createElement("td", { className: "sku-inventory" }, (disabled || !!inventoryBtn) ? value.inventory : React.createElement("input", { type: "number", disabled: disabled || !!inventoryBtn, value: value.inventory || 0, onChange: this.handleInventory })),
            React.createElement("td", { className: "sku-actions" }, inventoryBtn)));
    }
}
class SkuEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (sku) => {
            const { value, onChange } = this.props;
            let found = false;
            let newValue = value.map((s) => {
                if (s.key === sku.key) {
                    found = true;
                    return sku;
                }
                return s;
            });
            if (!found) {
                newValue = newValue.concat([sku]);
            }
            onChange(newValue);
        };
        this.state = {
            _record: null,
            props: [],
            propsMap: {},
            list: immutable([]),
            oldSkus: {}
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.record.isNew)
            return null;
        if (nextProps.record !== prevState._record) {
            let propsMap = createPropsMap(nextProps.record.props);
            let props = _.values(propsMap);
            return {
                _record: nextProps.record,
                props,
                propsMap,
                list: valueToList(nextProps.value, props, propsMap, prevState.oldSkus, nextProps.record)
            };
        }
        return null;
    }
    componentDidMount() {
        const { record, value } = this.props;
        if (record.isNew)
            return;
        alaska_admin_view_1.query({
            model: 'alaska-sku.Sku',
            filters: {
                goods: record._id
            }
        }).then((res) => {
            let propsMap = createPropsMap(record.props);
            let props = _.values(propsMap);
            let oldSkus = _.keyBy(res.results, 'key');
            this.setState({
                _record: record,
                props,
                propsMap,
                list: valueToList(value, props, propsMap, oldSkus, record),
                oldSkus
            });
        });
    }
    componentDidUpdate() {
        const { value, onChange, record } = this.props;
        if (!value || record.isNew)
            return;
        const { list, propsMap } = this.state;
        let skuMap = {};
        let newValue = value.flatMap((sku) => {
            if (_.find(sku.props, (p) => {
                if (!propsMap[p.id])
                    return true;
                if (!propsMap[p.id].valueMap[p.values[0].id])
                    return true;
                return false;
            })) {
                return [];
            }
            skuMap[sku.key] = sku;
            return [sku];
        });
        list.forEach((sku) => {
            if (!skuMap[sku.key] &&
                (sku._id || sku.price || sku.inventory || sku.discount)) {
                newValue = newValue.concat([sku]);
            }
        });
        if (value.length !== newValue.length) {
            onChange(newValue);
        }
    }
    handleRemove(sku) {
        const { value, onChange } = this.props;
        onChange(value.flatMap((s) => {
            if (s.key === sku.key) {
                return [];
            }
            return [s];
        }));
    }
    renderTable() {
        const { disabled } = this.props;
        const { list } = this.state;
        if (!list.length)
            return React.createElement("div", { className: "p-3 text-center" }, tr('Please select properties first'));
        return (React.createElement("table", { className: "table" },
            React.createElement("thead", null,
                React.createElement("tr", null,
                    React.createElement("th", { className: "sku-pic" }, tr('Picture', 'alaska-sku')),
                    React.createElement("th", { className: "sku-desc" }, tr('Properties', 'alaska-sku')),
                    React.createElement("th", { className: "sku-price" }, tr('Price', 'alaska-sku')),
                    React.createElement("th", { className: "sku-discount" }, tr('Discount', 'alaska-sku')),
                    React.createElement("th", { className: "sku-volume" }, tr('Volume', 'alaska-sku')),
                    React.createElement("th", { className: "sku-inventory" }, tr('Inventory', 'alaska-sku')),
                    React.createElement("th", { className: "sku-actions" }))),
            React.createElement("tbody", null, _.map(list, (sku) => (React.createElement(SkuItem, { key: sku.key, disabled: disabled, value: sku, onChange: this.handleChange }))))));
    }
    render() {
        const { record } = this.props;
        const { props } = this.state;
        if (!props.length || record.isNew)
            return null;
        return (React.createElement("div", { className: "card sku-editor" },
            React.createElement("div", { className: "card-heading" }, "SKU"),
            this.renderTable()));
    }
}
exports.default = SkuEditor;
