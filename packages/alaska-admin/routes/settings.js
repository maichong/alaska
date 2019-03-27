"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_settings_1 = require("alaska-settings");
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
async function getLogo(key) {
    let logo = '';
    let pic = await alaska_settings_1.default.get(key);
    if (pic) {
        if (typeof pic === 'string') {
            logo = pic;
        }
        else if (pic.url) {
            logo = pic.url;
        }
    }
    return logo;
}
function default_1(router) {
    router.get('/settings', async (ctx) => {
        ctx.state.adminApi = 'settings';
        ctx.service = __1.default;
        let user = ctx.user;
        let settings = {
            authorized: await alaska_user_1.default.hasAbility(user, 'admin'),
            user: user ? user.data() : { id: '', username: '', avatar: '', displayName: 'Guest' },
            icon: await getLogo('adminIcon'),
            logo: await getLogo('adminLogo'),
            loginLogo: await getLogo('adminLoginLogo'),
            copyright: await alaska_settings_1.default.get('adminCopyright'),
            superMode: ctx.state.superMode || false,
            locale: ctx.locale || '',
            locales: {},
            abilities: {},
            services: {},
            models: {},
            navItems: [],
            menuItems: []
        };
        await __1.default.settings(settings, user);
        ctx.body = settings;
    });
}
exports.default = default_1;
