import * as Router from 'koa-router';
import * as Path from 'path';
import * as _ from 'lodash';
import { Context } from 'alaska-http';
import { ImageService } from 'alaska-image';
import adminService from 'alaska-admin';
import userService from 'alaska-user';
import { UEditorConfig } from '..';
import defaultConfig from '../ueditor-config';

export default function (router: Router) {
  router.get('/', async (ctx, next) => {
    let prefix = adminService.config.get('prefix', '');

    if (prefix === '/') {
      prefix = '';
    }
    ctx.state.bodyScripts.push({
      src: Path.join(prefix, `/ueditor-config`)
    });
    ctx.state.bodyScripts.push({
      src: Path.join(prefix, `/ueditor/ueditor.all.min.js`)
    });
    await next();
  });

  router.get('/ueditor-config', async (ctx: Context) => {
    let ueditorConfig: UEditorConfig = _.assign({
      UEDITOR_HOME_URL: `${ctx.protocol}://${ctx.host}${Path.dirname(ctx.path)}/ueditor/`,
      serverUrl: `${ctx.protocol}://${ctx.host}${Path.dirname(ctx.path)}/ueditor-controller`
    }, defaultConfig, adminService.config.get('ueditor', {}));
    ctx.body = `(function () {
      window.UEDITOR_CONFIG = ${JSON.stringify(ueditorConfig)};
    })();`;
    ctx.type = 'application/javascript';
  });

  router.get('/ueditor-controller', async (ctx: Context) => {
    let action = ctx.query.action;
    function onError(msg: string) {
      ctx.body = {
        state: msg
      };
      ctx.status = 500;
    }
    if (action === 'config') {
      // 配置
      let ueditorImageDriver = adminService.config.get('ueditorImageDriver');
      let imageService = adminService.main.allServices['alaska-image'] as ImageService;
      if (!imageService) return onError('Image service unavailable');
      let driverConfig = imageService.drivers[ueditorImageDriver];
      if (!driverConfig) return onError('Image driver unavailable');

      ctx.body = {
        imagePath: '',
        imageFieldName: 'file',
        imageMaxSize: driverConfig.maxSize,
        imageAllowFiles: driverConfig.allowed.map((ext) => `.${ext}`),
        imageManagerUrlPrefix: ''
      };
      return;
    } else if (action === '') {
      let imageService = adminService.main.allServices['alaska-image'] as ImageService;
      if (!imageService) return onError('Image service unavailable');
      let filters = await userService.createFilters(ctx.user, 'alaska-image.Image.read');
      if (filters === null) {
        return onError('Access denied');
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

    // 未知action
    onError('Unsupported action');
  });

  router.post('/ueditor-controller', async (ctx: Context) => {
    let action = ctx.query.action;
    function onError(msg: string) {
      ctx.body = {
        state: msg
      };
      ctx.status = 500;
    }

    try {
      if (action === 'uploadimage') {
        let ueditorImageDriver = adminService.config.get('ueditorImageDriver');
        let imageService = adminService.main.allServices['alaska-image'] as ImageService;
        if (!imageService) return onError('Image service unavailable');
        let image = await imageService.sleds.Create.run({ ctx, user: ctx.user, driver: ueditorImageDriver });
        ctx.body = {
          state: 'SUCCESS',
          url: image.url,
          title: image.name,
          original: image.name
        };
        return;
      }

      // 未知action
      onError('Unsupported action');
    } catch (error) {
      onError(error.message);
    }
  });
}
