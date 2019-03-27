"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Path = require("path");
const fs = require("fs");
const alaska_1 = require("alaska");
const tree_1 = require("alaska-modules/tree");
const debug_1 = require("./debug");
class UpdateLoader extends alaska_1.Loader {
    constructor(metadata, extConfig) {
        super(metadata, extConfig);
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build updates`);
            let updates = {};
            meta.updates = updates;
            let updatesDir = Path.join(meta.path, 'updates');
            if (!fs.existsSync(updatesDir))
                return;
            let names = fs.readdirSync(updatesDir);
            for (let name of names) {
                if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts'))
                    continue;
                name = name.replace(/\.[tj]sx?$/, '');
                updates[name] = Path.join(updatesDir, name);
            }
            let moduleTreeUpdates = new tree_1.ModuleTree();
            tree.services[meta.id].updates = moduleTreeUpdates;
            _.forEach(meta.updates, (path, name) => {
                moduleTreeUpdates[name] = new tree_1.Module(path, 'ESModule');
            });
        });
    }
}
exports.default = UpdateLoader;
