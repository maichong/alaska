"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncBusboy = require('async-busboy');
function default_1(options) {
    return async function (ctx, next) {
        if (typeof ctx.files === 'undefined' && ctx.request.is('multipart/*')) {
            ctx.files = {};
            const res = await asyncBusboy(ctx.req, options);
            const files = res.files;
            const fields = res.fields;
            ctx.files = {};
            files.forEach((file) => {
                let fieldname = file.fieldname;
                if (ctx.files[fieldname]) {
                    if (Array.isArray(ctx.files[fieldname])) {
                        ctx.files[fieldname].push(file);
                    }
                    else {
                        ctx.files[fieldname] = [ctx.files[fieldname], file];
                    }
                }
                else {
                    ctx.files[fieldname] = file;
                }
            });
            ctx.request.body = fields;
        }
        await next();
    };
}
exports.default = default_1;
