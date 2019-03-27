"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const akita_1 = require("akita");
akita_1.default.setOptions({
    apiRoot: window.PREFIX,
    init: {
        credentials: 'include'
    }
});
exports.default = akita_1.default;
