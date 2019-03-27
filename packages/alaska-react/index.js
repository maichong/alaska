"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collie = require("collie");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const alaska_1 = require("alaska");
const Document_1 = require("./Document");
exports.Document = Document_1.default;
exports.Head = Document_1.Head;
exports.Foot = Document_1.Foot;
class ReactExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        collie(main, 'initReact', async () => {
            main.debug('initReact');
            let app = main.app;
            app.use(async (ctx, next) => {
                if (!ctx.state.heads) {
                    ctx.state.heads = [];
                }
                if (!ctx.state.foots) {
                    ctx.state.foots = [];
                }
                await next();
                let heads = [];
                let foots = [];
                function reduce(element, level) {
                    if (level >= 2 || !element || !element.props || !element.props.children)
                        return element;
                    let children = element.props.children;
                    if (Array.isArray(children)) {
                        let array = [];
                        let changed = false;
                        for (let child of children) {
                            if (!child)
                                continue;
                            if (child.type === Document_1.Head) {
                                heads = heads.concat(child.props.children);
                                changed = true;
                            }
                            if (child.type === Document_1.Foot) {
                                foots = foots.concat(child.props.children);
                                changed = true;
                            }
                            else {
                                let newChild = reduce(child, level + 1);
                                array.push(newChild);
                                changed = changed || newChild !== child;
                            }
                        }
                        return changed ? React.cloneElement(element, element.props, array) : element;
                    }
                    if (children.type === Document_1.Head) {
                        heads = heads.concat(children.props.children);
                        return null;
                    }
                    if (children.type === Document_1.Foot) {
                        foots = foots.concat(children.props.children);
                        return null;
                    }
                    let newChild = reduce(children, level + 1);
                    return newChild === children ? element : React.cloneElement(element, element.props, newChild);
                }
                if (React.isValidElement(ctx.body)) {
                    let body = ctx.body;
                    if (body.type !== 'html') {
                        body = reduce(body, 0);
                        body = React.createElement(ctx.state.Document || Document_1.default, { ctx, heads, foots }, body);
                    }
                    ctx.body = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(body)}`;
                    ctx.type = 'html';
                }
            });
        });
        main.post('initHttp', async () => {
            main.initReact();
        });
    }
}
ReactExtension.after = ['alaska-http'];
exports.default = ReactExtension;
