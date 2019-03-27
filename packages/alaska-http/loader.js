"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const Path = require("path");
const isDirectory = require("is-directory");
const alaska_1 = require("alaska");
const debug_1 = require("./debug");
const tree_1 = require("alaska-modules/tree");
class HttpLoader extends alaska_1.Loader {
    constructor(metadata, extConfig) {
        super(metadata, extConfig);
        metadata.middlewares = {};
        collie(metadata, 'loadMiddlewares', async () => {
            debug_1.default('loadMiddlewares');
            let { middlewares } = metadata.config;
            if (!middlewares)
                return;
            for (let id of Object.keys(middlewares)) {
                let meta = {
                    path: '',
                    dismiss: false
                };
                if (id[0] === '.') {
                    meta.path = Path.join(metadata.dir, 'config', id);
                    metadata.middlewares[id] = meta;
                    continue;
                }
                _.find(metadata.modulesDirs, (mDir) => {
                    let path = Path.join(process.cwd(), mDir, id);
                    if (!isDirectory.sync(path))
                        return false;
                    meta.path = path;
                    return true;
                });
                if (!meta.path)
                    throw new Error(`Middleware ${id} not found!`);
                metadata.middlewares[id] = meta;
            }
        });
        metadata.post('loadPlugins', async () => {
            await metadata.loadMiddlewares();
        });
        metadata.post('build', async (res) => {
            let middlewares = new tree_1.ModuleTree();
            res.middlewares = middlewares;
            for (let id of Object.keys(metadata.middlewares)) {
                let meta = metadata.middlewares[id];
                if (meta.dismiss)
                    continue;
                middlewares[id] = new tree_1.Module(meta.path, 'ESModule');
            }
        });
    }
}
exports.default = HttpLoader;
