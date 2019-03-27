"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Path = require("path");
const _ = require("lodash");
const alaska_admin_1 = require("alaska-admin");
const alaska_user_1 = require("alaska-user");
const ueditor_config_1 = require("../ueditor-config");
function default_1(router) {
    router.get('/', async (ctx, next) => {
        let prefix = alaska_admin_1.default.config.get('prefix', '');
        if (prefix === '/') {
            prefix = '';
        }
        ctx.state.foots.push(React.createElement("script", { src: Path.join(prefix, `/ueditor-config`) }));
        ctx.state.foots.push(React.createElement("script", { src: Path.join(prefix, `/ueditor/ueditor.all.min.js`) }));
        await next();
    });
    router.get('/ueditor-config', async (ctx) => {
        let ueditorConfig = _.assign({
            UEDITOR_HOME_URL: `${ctx.protocol}://${ctx.host}${Path.dirname(ctx.path)}/ueditor/`,
            serverUrl: `${ctx.protocol}://${ctx.host}${Path.dirname(ctx.path)}/ueditor-controller`
        }, ueditor_config_1.default, alaska_admin_1.default.config.get('ueditor', {}));
        ctx.body = `(function () {
      window.UEDITOR_CONFIG = ${JSON.stringify(ueditorConfig)};
    })();`;
        ctx.type = 'application/javascript';
    });
    router.get('/ueditor-controller', async (ctx) => {
        let action = ctx.query.action;
        function onError(msg) {
            ctx.body = {
                state: msg
            };
            ctx.status = 500;
        }
        if (action === 'config') {
            let ueditorImageDriver = alaska_admin_1.default.config.get('ueditorImageDriver');
            let imageService = alaska_admin_1.default.main.allServices.get('alaska-image');
            if (!imageService)
                return onError('Image service unavailable');
            let driverConfig = imageService.drivers[ueditorImageDriver];
            if (!driverConfig)
                return onError('Image driver unavailable');
            ctx.body = {
                imagePath: '',
                imageFieldName: 'file',
                imageMaxSize: driverConfig.maxSize,
                imageAllowFiles: driverConfig.allowed.map((ext) => `.${ext}`),
                imageManagerUrlPrefix: ''
            };
            return;
        }
        else if (action === '') {
            let imageService = alaska_admin_1.default.main.allServices.get('alaska-image');
            if (!imageService)
                return onError('Image service unavailable');
            let filters;
            if (!ctx.state.ignoreAuthorization) {
                filters = await alaska_user_1.default.createFilters(ctx.user, 'alaska-image.Image.read');
                if (filters === null) {
                    return onError('Access denied');
                }
            }
            let start = parseInt(ctx.query.start) || 0;
            let limit = 20;
            let images = await imageService.models.Image.find(filters).skip(start).limit(limit).sort('-_id');
            let total = images.length;
            if (start > 0 || images.length === limit) {
                total = await imageService.models.Image.countDocuments(filters);
            }
            ctx.body = {
                state: 'SUCCESS',
                list: images.map((img) => ({ url: img.url })),
                start,
                total
            };
            return;
        }
        onError('Unsupported action');
    });
    router.post('/ueditor-controller', async (ctx) => {
        let action = ctx.query.action;
        function onError(msg) {
            ctx.body = {
                state: msg
            };
            ctx.status = 500;
        }
        try {
            if (action === 'uploadimage') {
                let ueditorImageDriver = alaska_admin_1.default.config.get('ueditorImageDriver');
                let imageService = alaska_admin_1.default.main.allServices.get('alaska-image');
                if (!imageService)
                    return onError('Image service unavailable');
                let image = await imageService.sleds.Create.run({ ctx, user: ctx.user._id, driver: ueditorImageDriver });
                ctx.body = {
                    state: 'SUCCESS',
                    url: image.url,
                    title: image.name,
                    original: image.name
                };
                return;
            }
            onError('Unsupported action');
        }
        catch (error) {
            onError(error.message);
        }
    });
}
exports.default = default_1;
