import { Context } from 'alaska-http';
import { UploadMiddlewareConfig, UploadFile } from '.';
const asyncBusboy = require('async-busboy');

export default function (config: UploadMiddlewareConfig): Function {
  return async function (ctx: Context, next: Function) {
    if (typeof ctx.files === 'undefined' && ctx.request.is('multipart/*')) {
      ctx.files = {};
      const res: any = await asyncBusboy(ctx.req, config);
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
    }
    await next();
  };
}
