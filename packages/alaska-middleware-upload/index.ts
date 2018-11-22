import { Context } from 'alaska-http';
import { UploadMiddlewareOptions, UploadFile } from '.';
const asyncBusboy = require('async-busboy');

export default function (options: UploadMiddlewareOptions): Function {
  return function (ctx: Context, next: Function) {
    if (ctx.method !== 'POST' || typeof ctx.files !== 'undefined') return next();
    if (!ctx.request.is('multipart/*')) return next();
    ctx.files = {};
    return asyncBusboy(ctx.req, options).then((res: any) => {
      const files = res.files;
      const fields = res.fields;
      ctx.files = {};
      files.forEach((file: UploadFile) => {
        let fieldname = file.fieldname;
        if (ctx.files[fieldname]) {
          if (Array.isArray(ctx.files[fieldname])) {
            (ctx.files[fieldname] as UploadFile[]).push(file);
          } else {
            ctx.files[fieldname] = [ctx.files[fieldname] as UploadFile, file];
          }
        } else {
          ctx.files[fieldname] = file;
        }
      });
      ctx.request.body = fields;
      return next();
    });
  };
}
