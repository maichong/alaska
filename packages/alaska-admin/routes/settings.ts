import * as Router from 'koa-router';
import User from 'alaska-user/models/User';
import SETTINGS from 'alaska-settings';
import USER from 'alaska-user';
import ADMIN from '..';
import { Settings } from 'alaska-admin-view';

async function getLogo(key: string): Promise<string> {
  let logo = '';
  let pic = await SETTINGS.get(key);
  if (pic) {
    if (typeof pic === 'string') {
      logo = pic;
    } else if (pic.url) {
      logo = pic.url;
    }
  }
  return logo;
}

export default function (router: Router) {
  router.get('/settings', async (ctx) => {
    let user: User = ctx.user;
    let settings: Settings = {
      authorized: await USER.hasAbility(user, 'admin'),
      user: user ? user.data() : { id: '', username: '', avatar: '', displayName: 'Guest' },
      icon: await getLogo('adminIcon'),
      logo: await getLogo('adminLogo'),
      loginLogo: await getLogo('adminLoginLogo'),
      copyright: await SETTINGS.get('adminCopyright'),
      superMode: ctx.state.superMode || false,
      locale: ctx.locale || '',
      locales: {},
      abilities: {},
      services: {},
      models: {},
      navItems: [],
      menuItems: []
    };
    await ADMIN.settings(settings, user);
    // TODO:
    // ctx.session.lastAlive = Date.now();
    ctx.body = settings;
  });
}
