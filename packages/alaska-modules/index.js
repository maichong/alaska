"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("./debug");
const metadata_1 = require("./metadata");
exports.createMetadata = metadata_1.default;
function lookupModules(main, dir) {
    debug_1.default('lookupModules');
    let metadata = metadata_1.default(main.id, dir, main.configFileName, ['node_modules']);
    return metadata.toModules();
}
exports.default = lookupModules;
