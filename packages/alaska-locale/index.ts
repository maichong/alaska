import * as _ from 'lodash';
import * as collie from 'collie';
import { Extension, Service, MainService } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import { } from 'alaska-locale';
import { AdminService } from 'alaska-admin';
import { Settings } from 'alaska-admin-view';
import { parseAcceptLanguage } from './utils';
import { Context } from 'alaska-http';
import * as tr from 'grackle';

export default class LocaleExtension extends Extension {
  static after = ['alaska-http'];

  constructor(main: MainService) {
    super(main);

    _.forEach(main.modules.services, (s: ServiceModules) => {
      let service: Service = s.service;
      service.locales = s.locales || {};

      collie(service, 'initLocales', async () => {
        service.debug('initLocales');

        // plugins
        _.forEach(s.plugins, (plugin) => {
          _.forEach(plugin.locales, (locale, name) => {
            if (!service.locales[name]) {
              service.locales[name] = locale;
            } else {
              _.assign(service.locales[name], locale);
            }
          });
        });

        tr.learn(service.locales, service.id === 'alaska-admin' ? '' : service.id);
      });

      service.pre('init', async () => {
        await service.initLocales();
      });
    });

    if (main.initMiddlewares) {
      main.pre('initMiddlewares', () => {

        const locales = main.config.get('locales') || [];
        const localeCookieKey = main.config.get('localeCookieKey');
        const localeQueryKey = main.config.get('localeQueryKey');

        main.app.use((ctx: Context, next) => {
          let locale = '';
          if (localeQueryKey) {
            if (ctx.query[localeQueryKey]) {
              locale = ctx.query[localeQueryKey];
              if (locales.indexOf(locale) > -1) {
                ctx.cookies.set(localeCookieKey, locale, {
                  maxAge: 365 * 86400 * 1000
                });
              } else {
                locale = '';
              }
            }
          }

          if (!locale && localeCookieKey) {
            locale = ctx.cookies.get(localeCookieKey) || '';
          }

          if (!locale || locales.indexOf(locale) < 0) {
            //没有cookie设置
            //自动判断
            locale = '';
            let languages: string[] = parseAcceptLanguage(ctx.get('accept-language'));
            for (let lang of languages) {
              if (locales.indexOf(lang) > -1) {
                locale = lang;
                break;
              }
            }
          }
          if (!locale && locales.length) {
            locale = locales[0];
          }
          if (locale) {
            ctx.locale = locale;
            ctx.state.locale = locale;
          }
          return next();
        });
      });
    }

    const adminService = main.allServices['alaska-admin'] as AdminService;
    if (adminService) {
      adminService.pre('settings', (settings: Settings) => {
        _.forEach(main.modules.services, (s: ServiceModules) => {
          if (!settings.authorized && s.id !== 'alaska-admin') return;
          if (_.size(s.service.locales)) {
            settings.locales[s.id] = s.service.locales;
          }
        });
      });
    }
  }
}
