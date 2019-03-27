"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Extension {
    constructor(main) {
        this.main = main;
        this.instanceOfExtension = true;
    }
}
Extension.after = [];
Extension.classOfExtension = true;
exports.default = Extension;
