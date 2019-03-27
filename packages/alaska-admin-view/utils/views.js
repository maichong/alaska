"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const views = {
    wrappers: {},
    components: {},
    routes: [],
    widgets: [],
    listTools: [],
    editorTools: [],
    urrc: {}
};
window.views = views;
exports.default = views;
function setViews(data) {
    Object.assign(views, data);
}
exports.setViews = setViews;
