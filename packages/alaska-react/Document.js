"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
function onlyReactElement(list, child) {
    if (typeof child === 'string' || typeof child === 'number') {
        return list;
    }
    if (child.type === React.Fragment) {
        return list.concat(React.Children.toArray(child.props.children).reduce((fragmentList, fragmentChild) => {
            if (typeof fragmentChild === 'string' ||
                typeof fragmentChild === 'number') {
                return fragmentList;
            }
            return fragmentList.concat(fragmentChild);
        }, []));
    }
    return list.concat(child);
}
const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];
function unique() {
    const keys = new Set();
    const tags = new Set();
    const metaTypes = new Set();
    const metaCategories = {};
    return (h) => {
        if (h.key && typeof h.key !== 'number') {
            if (keys.has(h.key))
                return false;
            keys.add(h.key);
            return true;
        }
        switch (h.type) {
            case 'title':
            case 'base':
                if (tags.has(h.type))
                    return false;
                tags.add(h.type);
                break;
            case 'meta':
                for (let metatype of METATYPES) {
                    if (!h.props.hasOwnProperty(metatype))
                        continue;
                    if (metatype === 'charSet') {
                        if (metaTypes.has(metatype))
                            return false;
                        metaTypes.add(metatype);
                    }
                    else {
                        const category = h.props[metatype];
                        const categories = metaCategories[metatype] || new Set();
                        if (categories.has(category))
                            return false;
                        categories.add(category);
                        metaCategories[metatype] = categories;
                    }
                }
                break;
        }
        return true;
    };
}
class Document extends React.Component {
    render() {
        const { ctx, heads, foots, children } = this.props;
        const { state } = ctx;
        let headers = [
            React.createElement("meta", { key: "charSet", charSet: "utf-8" })
        ];
        if (state.documentTitle) {
            headers.push(React.createElement("title", null, state.documentTitle));
        }
        if (state.documentDescription) {
            headers.push(React.createElement("meta", { name: "Description", content: state.documentDescription }));
        }
        return (React.createElement("html", { lang: ctx.locale },
            React.createElement("head", null, headers.concat(heads)
                .concat(ctx.state.heads)
                .reduce(onlyReactElement, [])
                .reverse()
                .filter(unique())
                .reverse()
                .map((el, index) => {
                const key = el.key || index;
                return React.cloneElement(el, { key });
            })),
            React.createElement("body", { className: state.bodyClass },
                React.createElement("div", { id: "__viewport" }, children),
                [].concat(ctx.state.foots)
                    .concat(foots)
                    .reduce(onlyReactElement, [])
                    .reverse()
                    .filter(unique())
                    .reverse()
                    .map((el, index) => {
                    const key = el.key || index;
                    return React.cloneElement(el, { key });
                }))));
    }
}
exports.default = Document;
class Head extends React.Component {
    render() {
        return null;
    }
}
exports.Head = Head;
class Foot extends React.Component {
    render() {
        return null;
    }
}
exports.Foot = Foot;
