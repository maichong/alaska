"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const alaska_react_1 = require("alaska-react");
const Path = require("path");
const fs = require("fs");
const hasha = require("hasha");
const tr = require("grackle");
const __1 = require("..");
let jsHash = '';
let cssHash = '';
const CSS = `
body{background:#eaf0f5}
.loading{margin-top: 100px;}
.loading .loading-text{
width: 300px;
height: 60px;
line-height: 70px;
background: url(img/loading.gif) left center no-repeat;
padding-left: 120px;
color: #333;
font-size: 26px;
font-weight: 100;
margin: 0 auto;
letter-spacing: 4px;
}
`.replace(/\n/g, ' ');
function default_1(router) {
    router.get('/', (ctx) => {
        ctx.service = __1.default;
        if (!ctx.path.endsWith('/')) {
            ctx.redirect(`${ctx.path}/`);
            return;
        }
        const min = ctx.state.env === 'production' ? '.min' : '';
        const resourceVersion = __1.default.config.get('resourceVersion');
        if (!jsHash && !resourceVersion) {
            try {
                jsHash = hasha(fs.readFileSync(`public/admin/app${min}.js`), {
                    algorithm: 'md5'
                }).substr(0, 8);
            }
            catch (e) {
                jsHash = '-';
            }
        }
        if (!cssHash && !resourceVersion) {
            try {
                cssHash = hasha(fs.readFileSync(`public/admin/app.css`), {
                    algorithm: 'md5'
                }).substr(0, 8);
            }
            catch (e) {
                cssHash = '-';
            }
        }
        let prefix = __1.default.config.get('prefix', '');
        if (prefix === '/') {
            prefix = '';
        }
        ctx.body = React.createElement(React.Fragment, null,
            React.createElement(alaska_react_1.Head, null,
                React.createElement("title", null, __1.default.config.get('dashboardTitle')),
                React.createElement("meta", { name: "viewport", content: "initial-scale=0.8,maximum-scale=0.8,user-scalable=no" }),
                React.createElement("meta", { name: "renderer", content: "webkit" }),
                React.createElement("style", null, CSS),
                React.createElement("link", { rel: "stylesheet", type: "text/css", href: Path.join(prefix, `/app.css?${resourceVersion || cssHash}`) }),
                React.createElement("script", { dangerouslySetInnerHTML: { __html: `var PREFIX='${prefix}';` } })),
            React.createElement("div", { className: "loading" },
                React.createElement("div", { className: "loading-text" }, tr.locale(ctx.locale)('Loading'))),
            React.createElement(alaska_react_1.Foot, null,
                React.createElement("script", { src: Path.join(prefix, `/app${min}.js?${resourceVersion || jsHash}`) })));
    });
}
exports.default = default_1;
