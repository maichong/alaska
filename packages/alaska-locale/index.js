"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const alaska_1 = require("alaska");
const utils_1 = require("./utils");
const tr = require("grackle");
class LocaleExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        _.forEach(main.modules.services, (s) => {
            let service = s.service;
            service.locales = s.locales || {};
            collie(service, 'initLocales', async () => {
                service.debug('initLocales');
                _.forEach(s.plugins, (plugin) => {
                    _.forEach(plugin.locales, (locale, name) => {
                        if (!service.locales[name]) {
                            service.locales[name] = locale;
                        }
                        else {
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
                main.app.use((ctx, next) => {
                    let locale = '';
                    if (localeQueryKey) {
                        if (ctx.query[localeQueryKey]) {
                            locale = ctx.query[localeQueryKey];
                            if (locales.indexOf(locale) > -1) {
                                ctx.cookies.set(localeCookieKey, locale, {
                                    maxAge: 365 * 86400 * 1000
                                });
                            }
                            else {
                                locale = '';
                            }
                        }
                    }
                    if (!locale && localeCookieKey) {
                        locale = ctx.cookies.get(localeCookieKey) || '';
                    }
                    if (!locale || locales.indexOf(locale) < 0) {
                        locale = '';
                        let languages = utils_1.parseAcceptLanguage(ctx.get('accept-language'));
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
        const adminService = main.lookup('alaska-admin');
        if (adminService) {
            adminService.pre('settings', (settings) => {
                _.forEach(main.modules.services, (s) => {
                    if (!settings.authorized && s.id !== 'alaska-admin')
                        return;
                    if (_.size(s.service.locales)) {
                        settings.locales[s.id] = s.service.locales;
                    }
                });
            });
        }
    }
}
LocaleExtension.after = ['alaska-http'];
exports.default = LocaleExtension;
