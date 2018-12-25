import * as Path from 'path';
import * as isDirectory from 'is-directory';
import * as _ from 'lodash';
import * as collie from 'collie';
import { MainService, Extension } from 'alaska';
import { } from 'alaska-http';
import { Static } from 'alaska-statics';
import * as staticCache from 'koa-static-cache';

export default class StaticsExtension extends Extension {
  static after = ['alaska-http'];

  constructor(main: MainService) {
    super(main);

    collie(main, 'initStatics', async () => {
      main.debug('initStatics');
      let statics = _.filter(main.config.get('alaska-statics'), (config) => !config.disabled);
      if (!statics.length) return;
      statics.forEach((options: Static) => {
        let dir = options.dir;
        if (Path.isAbsolute(dir)) {
          dir = Path.join(process.cwd(), dir);
        }
        if (!isDirectory.sync(dir)) throw new Error(`Static dir is not found: ${dir}`);
        main.debug('statics', options.prefix, '->', dir);
        main.app.use(staticCache(dir, options));
      });
    });

    main.post('initHttp', async () => {
      await main.initStatics();
    });
  }
}
